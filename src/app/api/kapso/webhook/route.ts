/**
 * Webhook que recibe mensajes de WhatsApp vía Kapso.
 *
 * Flujo:
 * 1. Kapso POSTea a esta URL cuando un user manda un wpp
 * 2. Verificamos la firma HMAC
 * 3. Mantenemos una sesión en memoria por número
 * 4. Pasamos la conversación a Claude (mismo system prompt que /api/chat)
 * 5. Cuando Claude junta los 4 datos, llamamos runMatch() y devolvemos TOP 4
 * 6. Mandamos la respuesta de vuelta usando sendText() de Kapso
 *
 * Respondemos 200 rápido (Kapso requiere <10s) y procesamos en segundo plano
 * con el patrón "fire-and-forget" via after-response work.
 */

import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { sendText, verifyWebhookSignature, parseInboundMessage } from '@/lib/services/kapso';
import { runMatch } from '@/lib/services/matching-core';
import { getSupabaseServer } from '@/lib/supabase/server';

export const runtime = 'nodejs';

// Sesiones en memoria (para hackathon, suficiente; en prod usar Redis/DB)
type Session = {
  from: string;
  history: { role: 'user' | 'assistant'; content: string }[];
  buyerId?: string | null;
  lastAt: number;
};
const sessions = new Map<string, Session>();

function getSession(from: string): Session {
  const existing = sessions.get(from);
  if (existing && Date.now() - existing.lastAt < 60 * 60 * 1000) return existing;
  const fresh: Session = { from, history: [], lastAt: Date.now() };
  sessions.set(from, fresh);
  return fresh;
}

const SYS_PROMPT = `Sos Provi, una IA asistente de un local gastronómico que atiende por WhatsApp.
Tu trabajo es entender qué necesita el dueño del local y juntar 4 datos clave:
1) PRODUCTO que quiere comprar
2) CANTIDAD aproximada
3) FECHA para cuándo lo necesita (hoy, mañana, esta semana...)
4) PRESUPUESTO aproximado
5) (opcional) RESTRICCIONES (sin TACC, vegano, etc.)

REGLAS:
- Hablás casual, breve, en español rioplatense. Usás "vos". Emojis con moderación.
- Una pregunta por mensaje.
- Si el usuario te saluda, respondés saludando y arrancás preguntando qué necesita.
- Si dice algo ambiguo, pedile que aclare.
- Si ya sabés un dato, no lo vuelvas a preguntar.

Cuando tenés los 4 datos principales, respondé EXACTAMENTE este JSON (nada más):
{"ready": true, "pedido": "...", "cantidad": "...", "fecha": "...", "presupuesto": "...", "extra": "..."}

Mientras NO tengas los 4 datos:
{"ready": false, "reply": "..."}

NUNCA texto fuera del JSON.`;

function formatMatches(matches: any[]): string {
  if (!matches.length) return 'No encontré productos que matcheen 😔 Probá con otro pedido.';
  let txt = `🎯 *Top ${matches.length} para vos:*\n\n`;
  matches.forEach((m, i) => {
    txt += `*${i + 1}. ${m.emoji} ${m.nombre}* (${m.match}%)\n`;
    txt += `   _${m.proveedor} · ${m.distancia ? m.distancia.toFixed(1) + 'km · ' : ''}⭐ ${m.rating}_\n`;
    txt += `   💰 $${Number(m.precio).toLocaleString('es-AR')} / ${m.unidad}\n`;
    if (m.razon) txt += `   ✨ ${m.razon}\n`;
    txt += '\n';
  });
  txt += `Respondé el número para confirmar el pedido.`;
  return txt;
}

async function findBuyerIdByPhone(phone: string): Promise<string | null> {
  try {
    const supabase = getSupabaseServer();
    // Probamos con y sin "+"
    const variants = [phone, `+${phone}`];
    for (const p of variants) {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('telefono', p)
        .maybeSingle();
      if (data?.id) return data.id;
    }
    return null;
  } catch {
    return null;
  }
}

async function processAndReply(from: string, text: string) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    await sendText(from, '⚠️ Provi no está disponible ahora. Probá más tarde.');
    return;
  }

  // Comando reset
  if (/^(reset|reiniciar|empezar de nuevo|start)$/i.test(text.trim())) {
    sessions.delete(from);
    await sendText(from, 'Listo, empezamos de nuevo 🔄 ¿Qué necesitás hoy?');
    return;
  }

  const session = getSession(from);
  if (!session.buyerId) {
    session.buyerId = await findBuyerIdByPhone(from);
  }
  session.history.push({ role: 'user', content: text });
  session.lastAt = Date.now();

  try {
    const anthropic = new Anthropic({ apiKey: key });
    const resp = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 400,
      system: [{ type: 'text', text: SYS_PROMPT, cache_control: { type: 'ephemeral' } }] as any,
      messages: session.history.map((h) => ({ role: h.role, content: h.content })),
    });
    const raw = resp.content.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('').trim();

    let parsed: any = null;
    try {
      const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/, '');
      parsed = JSON.parse(cleaned);
    } catch {
      session.history.push({ role: 'assistant', content: raw });
      await sendText(from, raw);
      return;
    }

    if (parsed.ready) {
      await sendText(from, 'Buscando los mejores proveedores para vos... 🔍');
      const match = await runMatch({
        buyerId: session.buyerId || null,
        pedido: parsed.pedido,
        cantidad: parsed.cantidad,
        fecha: parsed.fecha,
        presupuesto: parsed.presupuesto,
        extra: parsed.extra,
      });
      sessions.delete(from);
      await sendText(from, formatMatches(match.matches));
      return;
    }

    const reply = parsed.reply || '¿En qué te ayudo?';
    session.history.push({ role: 'assistant', content: reply });
    await sendText(from, reply);
  } catch (e: any) {
    console.error('[kapso webhook] error en processAndReply', e);
    try {
      await sendText(from, 'Tuve un problema, ¿probás de nuevo? 🤖');
    } catch {}
  }
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-webhook-signature') || req.headers.get('X-Webhook-Signature');

  if (!verifyWebhookSignature(rawBody, signature)) {
    console.warn('[kapso webhook] firma inválida');
    return new NextResponse('invalid signature', { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new NextResponse('invalid json', { status: 400 });
  }

  // Solo procesamos eventos de mensaje recibido
  const event = payload?.event || req.headers.get('x-webhook-event');
  if (event && !String(event).includes('message.received') && !String(event).includes('inbound')) {
    return NextResponse.json({ ok: true, ignored: event });
  }

  const parsed = parseInboundMessage(payload);
  if (!parsed) {
    console.warn('[kapso webhook] sin mensaje útil', JSON.stringify(payload).slice(0, 500));
    return NextResponse.json({ ok: true, note: 'sin mensaje útil' });
  }

  // Vercel serverless mata el proceso al devolver la respuesta,
  // así que NO podemos usar fire-and-forget. Procesamos sincrónico.
  // Kapso da 10s, Claude tarda ~3s, está OK.
  try {
    await processAndReply(parsed.from, parsed.text);
  } catch (e) {
    console.error('[kapso webhook] error procesando', e);
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  // Health check + verificación inicial del webhook
  return NextResponse.json({
    ok: true,
    service: 'provi-ai kapso webhook',
    configured: !!(process.env.KAPSO_API_KEY && process.env.KAPSO_PHONE_NUMBER_ID),
  });
}
