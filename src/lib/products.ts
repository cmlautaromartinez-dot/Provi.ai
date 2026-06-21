import { getSupabase } from '@/lib/supabase';
import { getSupabaseServer } from '@/lib/supabase-server';
import { Product } from '@/types';

const PRODUCT_SELECT = `
  id, nombre, descripcion, categoria, tags, emoji, color, precio, unidad, stock,
  vencimiento, como_se_sirve, seller_id,
  seller:profiles!products_seller_id_fkey(
    id, nombre_local, lat, lng, barrio,
    seller_meta:seller_profile(rating, total_ventas, verificado)
  )
`;

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toProduct(row: any, buyerCoords?: { lat: number | null; lng: number | null }): Product {
  const sellerMeta = Array.isArray(row.seller?.seller_meta)
    ? row.seller?.seller_meta[0]
    : row.seller?.seller_meta;
  let distancia = 0;
  if (buyerCoords?.lat && buyerCoords?.lng && row.seller?.lat && row.seller?.lng) {
    distancia = haversineKm(buyerCoords.lat, buyerCoords.lng, row.seller.lat, row.seller.lng);
    distancia = Math.round(distancia * 10) / 10;
  }
  return {
    id: row.id,
    nombre: row.nombre,
    descripcion: row.descripcion || '',
    categoria: row.categoria || 'Otro',
    tags: row.tags || [],
    emoji: row.emoji || '🍽️',
    color: row.color || 'from-brand-400 to-brand-600',
    precio: Number(row.precio),
    unidad: row.unidad || 'unidad',
    stock: row.stock || 0,
    proveedor: row.seller?.nombre_local || 'Proveedor',
    proveedorId: row.seller?.id || row.seller_id,
    rating: Number(sellerMeta?.rating || 4.5),
    distancia,
    match: undefined,
  };
}

export async function listProducts(opts?: {
  categoria?: string;
  buyerCoords?: { lat: number | null; lng: number | null };
}): Promise<Product[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  let q = supabase.from('products').select(PRODUCT_SELECT).eq('activo', true).gt('stock', 0);
  if (opts?.categoria && opts.categoria !== 'Todos') q = q.eq('categoria', opts.categoria);
  const { data, error } = await q;
  if (error) {
    console.error('[listProducts]', error);
    return [];
  }
  return (data || []).map((r: any) => toProduct(r, opts?.buyerCoords));
}

export async function getProduct(
  id: string,
  buyerCoords?: { lat: number | null; lng: number | null }
): Promise<Product | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('id', id)
    .maybeSingle();
  if (error || !data) return null;
  return toProduct(data, buyerCoords);
}

// Trae varios productos en UNA sola query (en vez de N queries paralelas)
export async function getProductsByIds(
  ids: string[],
  buyerCoords?: { lat: number | null; lng: number | null }
): Promise<Product[]> {
  if (ids.length === 0) return [];
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .in('id', ids);
  if (error) {
    console.error('[getProductsByIds]', error);
    return [];
  }
  return (data || []).map((r: any) => toProduct(r, buyerCoords));
}

// Versión server-side del listado — para RSC/Suspense streaming
export async function listProductsServer(opts?: {
  categoria?: string;
  buyerCoords?: { lat: number | null; lng: number | null };
}): Promise<Product[]> {
  try {
    const supabase = getSupabaseServer();
    let q = supabase.from('products').select(PRODUCT_SELECT).eq('activo', true).gt('stock', 0);
    if (opts?.categoria && opts.categoria !== 'Todos') q = q.eq('categoria', opts.categoria);
    const { data, error } = await q;
    if (error) return [];
    return (data || []).map((r: any) => toProduct(r, opts?.buyerCoords));
  } catch {
    return [];
  }
}

// Versión server-side para RSC/ISR — no accede a localStorage ni al DOM
export async function getProductServer(id: string): Promise<Product | null> {
  try {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('id', id)
      .maybeSingle();
    if (error || !data) return null;
    return toProduct(data);
  } catch {
    return null;
  }
}

export async function listProductsBySeller(sellerId: string): Promise<Product[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false });
  if (error) return [];
  return (data || []).map((r: any) => toProduct(r));
}

export async function createProduct(input: {
  sellerId: string;
  nombre: string;
  descripcion?: string;
  categoria: string;
  tags?: string[];
  emoji?: string;
  color?: string;
  precio: number;
  unidad?: string;
  stock?: number;
  vencimiento?: string;
  como_se_sirve?: string;
}): Promise<{ ok: boolean; error?: string; id?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, error: 'no supabase' };
  const { data, error } = await supabase
    .from('products')
    .insert({
      seller_id: input.sellerId,
      nombre: input.nombre,
      descripcion: input.descripcion || null,
      categoria: input.categoria,
      tags: input.tags || [],
      emoji: input.emoji || '🍽️',
      color: input.color || 'from-brand-400 to-brand-600',
      precio: input.precio,
      unidad: input.unidad || 'unidad',
      stock: input.stock || 0,
      vencimiento: input.vencimiento || null,
      como_se_sirve: input.como_se_sirve || null,
      activo: true,
    })
    .select('id')
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  return { ok: true, id: data?.id };
}
