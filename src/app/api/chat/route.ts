/**
 * Chat conversacional con Claude para Provi Bot web.
 * El cliente manda el historial completo, server llama Claude.
 * Cuando Claude detecta que tiene los 4 datos, devuelve ready:true + dispara match.
 */
import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { runMatch } from '@/lib/services/matching-core';

export const runtime = 'nodejs';

const SYS_PROMPT = `Sos Provi, una IA asistente de un local gastronómico.
Tu trabajo es entender qué necesita el dueño del local y juntar 4 datos clave:
1) PRODUCTO que quiere comprar (tortas, brownies, café, viandas, etc.)
2) CANTIDAD aproximada
3) FECHA para cuándo lo necesita (hoy, mañana, esta semana, próxima semana)
4) PRESUPUESTO aproximado
5) (opcional) RESTRICCIONES (sin TACC, vegano, orgánico, etc.)

REGLAS:
- Hablás casual, breve, en español rioplatense. Usás "vos" y "che", emojis con moderación.
- Una pregunta por mensaje. Cortita.
- Si el usuario te saluda ("hola", "buenas"), respondés saludando y arrancás preguntando qué necesita.
- Si el usuario manda algo que NO es un pedido (chiste, pregunta general, "qué onda"), respondés con buena onda y reorientás a la pregunta que estabas haciendo.
- Si ya sabés algún dato porque el usuario lo mencionó antes, NO lo vuelvas a preguntar.
- Si el usuario dice algo ambiguo (ej. "muchas" para cantidad), pedile que aclare con un rango.

CUANDO YA TENÉS los 4 datos principales (producto + cantidad + fecha + presupuesto), respondé EXACTAMENTE este JSON (sin texto fuera del JSON):
{"ready": true, "pedido": "...", "cantidad": "...", "fecha": "...", "presupuesto": "...", "extra": "..."}

Mientras NO tengas los 4 datos, respondé un JSON con tu próxima respuesta:
{"ready": false, "reply": "..."}

NUNCA respondas texto plano. SIEMPRE JSON válido, sin markdown.`;

type ChatRequest = {
  buyerId?: string | null;
  history: { role: 'user' | 'assistant'; content: string }[];
};

export async function POST(req: Request) {
  let body: ChatRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return NextResponse.json({
      ready: false,
      reply: '⚠️ Falta ANTHROPIC_API_KEY en el server. Configurala en .env.local y reiniciá npm run dev.',
    });
  }

  const history = (body.history || []).filter(
    (m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string'
  );

  // Si está vacío, saludamos primero
  if (history.length === 0) {
    return NextResponse.json({
      ready: false,
      reply: '¡Hola! Soy Provi 🤖 ¿Qué estás necesitando hoy?',
    });
  }

  const anthropic = new Anthropic({ apiKey: key });

  try {
    const resp = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 400,
      system: [
        { type: 'text', text: SYS_PROMPT, cache_control: { type: 'ephemeral' } },
      ] as any,
      messages: history.map((h) => ({ role: h.role, content: h.content })),
    });

    const raw = resp.content
      .filter((b: any) => b.type === 'text')
      .map((b: any) => b.text)
      .join('')
      .trim();

    let parsed: any = null;
    try {
      const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/, '');
      parsed = JSON.parse(cleaned);
    } catch {
      // Claude se fue del JSON: lo tratamos como reply
      return NextResponse.json({ ready: false, reply: raw });
    }

    if (!parsed.ready) {
      return NextResponse.json({ ready: false, reply: parsed.reply || '¿En qué te ayudo?' });
    }

    // Tiene todos los datos → disparar matching
    const match = await runMatch({
      buyerId: body.buyerId || null,
      pedido: parsed.pedido,
      cantidad: parsed.cantidad,
      fecha: parsed.fecha,
      presupuesto: parsed.presupuesto,
      extra: parsed.extra,
    });

    return NextResponse.json({
      ready: true,
      reply: `¡Listo! Analicé el catálogo y estos son los TOP ${match.matches.length} para vos 🎯`,
      matches: match.matches,
      strategy: match.strategy,
      summary: {
        pedido: parsed.pedido,
        cantidad: parsed.cantidad,
        fecha: parsed.fecha,
        presupuesto: parsed.presupuesto,
        extra: parsed.extra,
      },
    });
  } catch (e: any) {
    console.error('[/api/chat]', e);
    return NextResponse.json(
      { error: 'chat_failed', message: e.message },
      { status: 500 }
    );
  }
}
