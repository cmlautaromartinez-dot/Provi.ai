/**
 * Webhook que recibe mensajes de WhatsApp vía Twilio Sandbox.
 * Twilio postea form-encoded a esta URL cuando un user manda un wpp al sandbox number.
 *
 * Flujo:
 * 1. Recibe el mensaje del usuario
 * 2. Busca o crea su sesión (en memoria + opcional Supabase)
 * 3. Usa Claude para extraer producto/cantidad/fecha/presupuesto del texto natural
 * 4. Cuando tiene datos suficientes, llama runMatch() y devuelve TOP 4
 * 5. Responde por TwiML (XML) → Twilio lo manda como wpp al user
 */

import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { runMatch } from '@/lib/matching-core';
import { getSupabaseServer } from '@/lib/supabase-server';

export const runtime = 'nodejs';

// Sesiones en memoria (para hackathon, suficiente. En prod usar Redis/DB)
type Session = {
  from: string;
  history: { role: 'user' | 'assistant'; content: string }[];
  pedido?: string;
  cantidad?: string;
  fecha?: string;
  presupuesto?: string;
  extra?: string;
  buyerId?: string | null;
  lastAt: number;
};
const sessions = new Map<string, Session>();

function getSession(from: string): Session {
  const existing = sessions.get(from);
  // Limpiar sesiones viejas (>1h)
  if (existing && Date.now() - existing.lastAt < 60 * 60 * 1000) return existing;
  const fresh: Session = { from, history: [], lastAt: Date.now() };
  sessions.set(from, fresh);
  return fresh;
}

const SYS_PROMPT = `Sos Provi, una IA asistente de un local gastronómico por WhatsApp.
Tu trabajo es entender qué necesita el dueño del local y juntar 4 datos:
1) PRODUCTO que quiere comprar
2) CANTIDAD aproximada
3) FECHA para cuándo lo necesita (hoy, mañana, esta semana...)
4) PRESUPUESTO aproximado
5) (opcional) RESTRICCIONES (sin TACC, vegano, etc.)

Hablás casual, breve, en español rioplatense, con tono cercano. Una pregunta por mensaje. Usás emojis con moderación.

Cuando ya tenés los 4 datos principales (producto, cantidad, fecha, presupuesto), respondé EXACTAMENTE este JSON (sin texto fuera del JSON):
{"ready": true, "pedido": "...", "cantidad": "...", "fecha": "...", "presupuesto": "...", "extra": "..."}

Mientras NO tengas los 4 datos, respondé un JSON con tu próxima pregunta:
{"ready": false, "reply": "..."}

NUNCA respondas texto fuera del JSON. SIEMPRE JSON.`;

async function processMessage(session: Session, userText: string): Promise<{ reply: string; ready: boolean; data?: any }> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return { reply: '⚠️ Provi no está disponible (falta ANTHROPIC_API_KEY).', ready: false };
  }

  const anthropic = new Anthropic({ apiKey: key });

  session.history.push({ role: 'user', content: userText });
  session.lastAt = Date.now();

  const resp = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 400,
    system: [
      { type: 'text', text: SYS_PROMPT, cache_control: { type: 'ephemeral' } },
    ] as any,
    messages: session.history.map(h => ({ role: h.role, content: h.content })),
  });

  const raw = resp.content.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('').trim();

  let parsed: any = null;
  try {
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/, '');
    parsed = JSON.parse(cleaned);
  } catch {
    // Si Claude se fue del JSON, asumimos que es texto normal
    session.history.push({ role: 'assistant', content: raw });
    return { reply: raw, ready: false };
  }

  if (parsed.ready) {
    session.pedido = parsed.pedido;
    session.cantidad = parsed.cantidad;
    session.fecha = parsed.fecha;
    session.presupuesto = parsed.presupuesto;
    session.extra = parsed.extra;
    return { reply: 'Buscando los mejores proveedores para vos... 🔍', ready: true, data: parsed };
  }

  session.history.push({ role: 'assistant', content: parsed.reply });
  return { reply: parsed.reply, ready: false };
}

function twiml(message: string) {
  const escaped = message.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escaped}</Message></Response>`,
    { headers: { 'Content-Type': 'text/xml; charset=utf-8' } }
  );
}

function formatMatches(matches: any[]): string {
  if (!matches.length) return 'No encontré productos que matcheen 😔 Probá con otro pedido.';
  let txt = `🎯 *Top ${matches.length} para vos:*\n\n`;
  matches.forEach((m, i) => {
    txt += `*${i + 1}. ${m.emoji} ${m.nombre}* (${m.match}%)\n`;
    txt += `   _${m.proveedor} · ${m.distancia ? m.distancia.toFixed(1) + 'km · ' : ''}⭐ ${m.rating}_\n`;
    txt += `   💰 $${m.precio.toLocaleString('es-AR')} / ${m.unidad}\n`;
    if (m.razon) txt += `   ✨ ${m.razon}\n`;
    txt += '\n';
  });
  txt += `Respondé con el número para confirmar el pedido.`;
  return txt;
}

async function findBuyerIdByPhone(phone: string): Promise<string | null> {
  try {
    const supabase = getSupabaseServer();
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('telefono', phone)
      .maybeSingle();
    return data?.id || null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const form = await req.formData();
  const from = (form.get('From') as string) || 'unknown'; // 'whatsapp:+5491100000000'
  const body = ((form.get('Body') as string) || '').trim();

  if (!body) return twiml('No te entendí, mandame un mensajito 👋');

  // Comando reset
  if (/^(reset|reiniciar|empezar de nuevo|start)$/i.test(body)) {
    sessions.delete(from);
    return twiml('Listo, empezamos de nuevo 🔄 ¿Qué necesitás hoy?');
  }

  const session = getSession(from);
  if (!session.buyerId) {
    session.buyerId = await findBuyerIdByPhone(from.replace('whatsapp:', ''));
  }

  try {
    const result = await processMessage(session, body);

    if (result.ready && result.data) {
      // Disparar matching
      try {
        const match = await runMatch({
          buyerId: session.buyerId || null,
          pedido: result.data.pedido,
          cantidad: result.data.cantidad,
          fecha: result.data.fecha,
          presupuesto: result.data.presupuesto,
          extra: result.data.extra,
        });
        // Reset para próxima consulta
        sessions.delete(from);
        return twiml(formatMatches(match.matches));
      } catch (e: any) {
        return twiml(`Ups, error buscando matches: ${e.message}`);
      }
    }

    return twiml(result.reply);
  } catch (e: any) {
    console.error('[whatsapp webhook]', e);
    return twiml('Tuve un problema, ¿probás de nuevo? 🤖');
  }
}

// Twilio puede mandar GET para validar el webhook URL
export async function GET() {
  return NextResponse.json({ ok: true, service: 'provi-ai whatsapp webhook' });
}
