'use client';

import { getSupabase } from '@/lib/supabase/client';
import { Pedido } from '@/types';

const ORDER_SELECT = `
  id, buyer_id, seller_id, product_id, cantidad, total, estado, fecha_entrega, notas, created_at,
  product:products(nombre, emoji, color, precio, unidad),
  buyer:profiles!orders_buyer_id_fkey(nombre_local),
  seller:profiles!orders_seller_id_fkey(nombre_local)
`;

function toPedido(row: any, perspectiva: 'comprador' | 'vendedor'): Pedido {
  const created = new Date(row.created_at);
  const ahora = Date.now() - created.getTime();
  let fecha = created.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
  if (ahora < 60_000) fecha = 'Recién';
  else if (ahora < 3600_000) fecha = `Hace ${Math.floor(ahora / 60_000)} min`;
  else if (ahora < 86400_000) fecha = `Hoy ${created.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`;
  else if (ahora < 2 * 86400_000) fecha = 'Ayer';
  return {
    id: row.id,
    producto: row.product?.nombre || 'Producto',
    cantidad: row.cantidad,
    total: Number(row.total),
    estado: row.estado,
    fecha,
    proveedor: perspectiva === 'comprador' ? row.seller?.nombre_local : undefined,
    comprador: perspectiva === 'vendedor' ? row.buyer?.nombre_local : undefined,
    emoji: row.product?.emoji || '📦',
  };
}

export async function createOrders(items: {
  buyerId: string;
  productId: string;
  sellerId: string;
  cantidad: number;
  precioUnitario: number;
}[]): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, error: 'no supabase' };
  if (!items.length) return { ok: true };
  const rows = items.map((i) => ({
    buyer_id: i.buyerId,
    seller_id: i.sellerId,
    product_id: i.productId,
    cantidad: i.cantidad,
    total: i.cantidad * i.precioUnitario,
    estado: 'pendiente' as const,
  }));
  const { error } = await supabase.from('orders').insert(rows);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function listOrdersForBuyer(buyerId: string): Promise<Pedido[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('orders')
    .select(ORDER_SELECT)
    .eq('buyer_id', buyerId)
    .order('created_at', { ascending: false });
  if (error) return [];
  return (data || []).map((r: any) => toPedido(r, 'comprador'));
}

export async function listOrdersForSeller(sellerId: string): Promise<Pedido[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('orders')
    .select(ORDER_SELECT)
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false });
  if (error) return [];
  return (data || []).map((r: any) => toPedido(r, 'vendedor'));
}

export async function updateOrderStatus(orderId: string, estado: Pedido['estado']) {
  const supabase = getSupabase();
  if (!supabase) return { ok: false };
  const { error } = await supabase.from('orders').update({ estado }).eq('id', orderId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function sellerStats(sellerId: string): Promise<{
  ventasHoy: number;
  pedidosTotales: number;
  pendientes: number;
  facturadoMes: number;
}> {
  const supabase = getSupabase();
  if (!supabase) return { ventasHoy: 0, pedidosTotales: 0, pendientes: 0, facturadoMes: 0 };
  const { data } = await supabase
    .from('orders')
    .select('total, estado, created_at')
    .eq('seller_id', sellerId);
  if (!data) return { ventasHoy: 0, pedidosTotales: 0, pendientes: 0, facturadoMes: 0 };
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  let ventasHoy = 0, pendientes = 0, facturadoMes = 0;
  for (const o of data) {
    const created = new Date(o.created_at);
    if (created >= hoy) ventasHoy += Number(o.total);
    if (created >= inicioMes) facturadoMes += Number(o.total);
    if (o.estado === 'pendiente') pendientes++;
  }
  return { ventasHoy, pedidosTotales: data.length, pendientes, facturadoMes };
}
