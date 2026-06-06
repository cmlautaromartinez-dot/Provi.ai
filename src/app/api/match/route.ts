import { NextResponse } from 'next/server';
import { runMatch } from '@/lib/matching-core';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }

  try {
    const result = await runMatch({
      buyerId: body.buyerId || null,
      pedido: body.pedido || '',
      cantidad: body.cantidad,
      fecha: body.fecha,
      presupuesto: body.presupuesto,
      extra: body.extra,
    });
    return NextResponse.json(result);
  } catch (e: any) {
    console.error('[/api/match]', e);
    return NextResponse.json(
      { error: 'match_failed', message: e.message },
      { status: 500 }
    );
  }
}
