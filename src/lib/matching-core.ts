/**
 * Núcleo de matching reutilizable por /api/match y /api/whatsapp/webhook.
 * Trae catálogo de Supabase, distancia Haversine y llama a Claude para rankear.
 */
import Anthropic from '@anthropic-ai/sdk';
import { getSupabaseServer } from '@/lib/supabase-server';

export type MatchInput = {
  buyerId?: string | null;
  pedido: string;
  cantidad?: string;
  fecha?: string;
  presupuesto?: string;
  extra?: string;
};

export type ProductMatch = {
  id: string;
  nombre: string;
  descripcion: string | null;
  categoria: string | null;
  tags: string[];
  precio: number;
  unidad: string;
  stock: number;
  emoji: string;
  color: string;
  proveedor: string;
  proveedorId: string;
  distancia: number;
  rating: number;
  match: number;
  razon: string;
};

const SYSTEM_PROMPT = `Sos Provi, una IA matchmaker entre locales gastronómicos. Tu trabajo es elegir los TOP 4 productos del catálogo que mejor satisfagan al comprador.

CRITERIOS DE RANKING (en orden de importancia):
1. Coincidencia con el pedido (categoría, nombre, tags)
2. Encaje con el perfil del comprador (su menú, equipamiento, qué quiere sumar)
3. Restricciones (sin TACC, vegano, etc.) si las menciona
4. Precio dentro del presupuesto
5. Distancia (más cerca mejor)
6. Rating y verificación del vendedor

Respondé SOLO JSON válido con esta forma exacta:
{
  "matches": [
    { "productId": "<uuid>", "score": <0-100>, "razon": "<frase corta en español, 1 oración, por qué este es ideal>" }
  ]
}
Exactamente 4 matches, ordenados de mejor a peor. Sin texto fuera del JSON.`;

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function runMatch(input: MatchInput): Promise<{
  matches: ProductMatch[];
  strategy: 'llm_claude' | 'rules_only';
  note?: string;
}> {
  const supabase = getSupabaseServer();

  let buyer: any = null;
  if (input.buyerId) {
    const { data } = await supabase
      .from('profiles')
      .select('id, nombre_local, lat, lng, barrio')
      .eq('id', input.buyerId)
      .maybeSingle();
    buyer = data;
    if (buyer) {
      const { data: bp } = await supabase
        .from('buyer_profile')
        .select('herramientas, menu_actual, quiero_sumar')
        .eq('id', input.buyerId)
        .maybeSingle();
      if (bp) buyer = { ...buyer, ...bp };
    }
  }

  const { data: products, error } = await supabase
    .from('products')
    .select(
      `
      id, nombre, descripcion, categoria, tags, precio, unidad, stock, emoji, color, vencimiento, como_se_sirve,
      seller:profiles!products_seller_id_fkey(
        id, nombre_local, lat, lng, barrio,
        seller_meta:seller_profile(rating, total_ventas, verificado, traslado)
      )
    `
    )
    .eq('activo', true)
    .gt('stock', 0);

  if (error || !products) {
    throw new Error(error?.message || 'db error');
  }

  // Aplanamos seller_meta para que el resto del código siga igual
  const enriched = products.map((p: any) => {
    let dist: number | null = null;
    if (buyer?.lat && buyer?.lng && p.seller?.lat && p.seller?.lng) {
      dist = haversineKm(buyer.lat, buyer.lng, p.seller.lat, p.seller.lng);
    }
    const sellerMetaRaw = p.seller?.seller_meta;
    const sellerMeta = Array.isArray(sellerMetaRaw)
      ? sellerMetaRaw
      : sellerMetaRaw
      ? [sellerMetaRaw]
      : [];
    return { ...p, distancia_km: dist, seller_meta: sellerMeta };
  });

  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  // Fallback por reglas si no hay key
  if (!anthropicKey) {
    const ranked = enriched
      .map((p: any) => {
        const q = input.pedido.toLowerCase();
        let score = 40;
        if (p.nombre.toLowerCase().includes(q.split(' ').pop() || '')) score += 25;
        if (p.categoria?.toLowerCase().includes(q)) score += 15;
        if ((p.tags || []).some((t: string) => q.includes(t.toLowerCase()))) score += 10;
        if (p.distancia_km !== null && p.distancia_km < 3) score += 8;
        score += Math.min(7, ((p.seller_meta?.[0]?.rating || 4.5) - 4) * 7);
        return { ...p, score: Math.min(100, Math.round(score)) };
      })
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 4);

    const matches = ranked.map(toClientShape);
    await maybeLog(supabase, input, matches);
    return { matches, strategy: 'rules_only', note: 'ANTHROPIC_API_KEY no configurada' };
  }

  // Con Claude
  const anthropic = new Anthropic({ apiKey: anthropicKey });

  const catalog = enriched.slice(0, 30).map((p: any) => ({
    id: p.id,
    nombre: p.nombre,
    categoria: p.categoria,
    tags: p.tags,
    precio: p.precio,
    unidad: p.unidad,
    stock: p.stock,
    descripcion: p.descripcion,
    vendedor: p.seller?.nombre_local,
    rating: p.seller_meta?.[0]?.rating || null,
    verificado: p.seller_meta?.[0]?.verificado || false,
    distancia_km: p.distancia_km ? Math.round(p.distancia_km * 10) / 10 : null,
  }));

  const buyerCtx = buyer
    ? {
        local: buyer.nombre_local,
        barrio: buyer.barrio,
        menu_actual: buyer.menu_actual,
        herramientas: buyer.herramientas,
        quiero_sumar: buyer.quiero_sumar,
      }
    : null;

  const userMsg = `PEDIDO DEL COMPRADOR:
- Producto: "${input.pedido}"
- Cantidad: ${input.cantidad || 'no especificada'}
- Para cuándo: ${input.fecha || 'no especificada'}
- Presupuesto: ${input.presupuesto || 'no especificado'}
- Extra: ${input.extra || 'ninguno'}

PERFIL DEL COMPRADOR:
${buyerCtx ? JSON.stringify(buyerCtx) : 'sin perfil cargado'}

CATÁLOGO DISPONIBLE:
${JSON.stringify(catalog)}`;

  const resp = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1024,
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPT,
        // Prompt caching: el system prompt se reusa entre llamadas
        cache_control: { type: 'ephemeral' },
      },
    ] as any,
    messages: [{ role: 'user', content: userMsg }],
  });

  const text = resp.content
    .filter((b: any) => b.type === 'text')
    .map((b: any) => b.text)
    .join('')
    .trim();

  let parsed: any;
  try {
    // Claude a veces envuelve en ```json
    const cleaned = text.replace(/^```json\s*/i, '').replace(/```\s*$/, '');
    parsed = JSON.parse(cleaned);
  } catch (e) {
    console.error('[matching-core] no pudo parsear JSON:', text);
    throw new Error('Respuesta de Claude no es JSON válido');
  }

  const llmMatches: { productId: string; score: number; razon: string }[] = parsed.matches || [];

  const matches: ProductMatch[] = llmMatches
    .map((m) => {
      const product = enriched.find((p: any) => p.id === m.productId);
      if (!product) return null;
      return { ...toClientShape(product), match: m.score, razon: m.razon };
    })
    .filter(Boolean) as ProductMatch[];

  await maybeLog(supabase, input, matches);
  return { matches, strategy: 'llm_claude' };
}

function toClientShape(p: any): ProductMatch {
  return {
    id: p.id,
    nombre: p.nombre,
    descripcion: p.descripcion,
    categoria: p.categoria,
    tags: p.tags || [],
    precio: Number(p.precio),
    unidad: p.unidad,
    stock: p.stock,
    emoji: p.emoji || '🍽️',
    color: p.color || 'from-brand-400 to-brand-600',
    proveedor: p.seller?.nombre_local || 'Proveedor',
    proveedorId: p.seller?.id || '',
    distancia: p.distancia_km ?? 0,
    rating: Number(p.seller_meta?.[0]?.rating || 4.5),
    match: p.score || 75,
    razon: p.razon || '',
  };
}

async function maybeLog(supabase: any, input: MatchInput, matches: ProductMatch[]) {
  if (!input.buyerId) return;
  try {
    await supabase.from('match_logs').insert({
      buyer_id: input.buyerId,
      pedido: input.pedido,
      cantidad: input.cantidad || null,
      fecha: input.fecha || null,
      presupuesto: input.presupuesto || null,
      extra: input.extra || null,
      resultado: matches,
    });
  } catch (e) {
    console.warn('[matching-core] no se pudo loggear match', e);
  }
}
