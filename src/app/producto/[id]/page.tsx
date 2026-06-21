// RSC — datos fetched en el servidor, caché ISR de 60 segundos
// JS al cliente: solo el client island ProductActions.tsx
import { getProductServer } from '@/lib/products';
import { Star, MapPin, Truck, ShieldCheck, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { FavShareButtons, ContactButton, BuyActions } from './ProductActions';

export const revalidate = 60; // ISR: Next.js revalida cada 60s desde CDN

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductoPage({ params }: Props) {
  const { id } = await params;
  const product = await getProductServer(id);

  if (!product) {
    return (
      <div className="p-8 text-center min-h-full flex flex-col items-center justify-center gap-4">
        <span className="text-5xl">🤷</span>
        <p className="font-bold">Producto no encontrado</p>
        <Link href="/explorar" className="mt-2 underline text-brand-500">
          Ver catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-white flex flex-col">

      {/* ── Hero imagen ──────────────────────────── */}
      <div className={`relative bg-gradient-to-br ${product.color} h-72 flex items-end justify-center`}>
        <header className="absolute top-0 left-0 right-0 z-30 px-3 py-3 flex items-center justify-between">
          <Link
            href="/explorar"
            className="w-10 h-10 rounded-full bg-white/95 backdrop-blur flex items-center justify-center shadow-soft"
          >
            <ChevronLeft size={22} />
          </Link>
          {/* Client island: fav + share (necesitan estado interactivo) */}
          <FavShareButtons />
        </header>
        <span className="text-[10rem] leading-none drop-shadow-2xl">{product.emoji}</span>
      </div>

      {/* ── Contenido estático (RSC) ─────────────── */}
      <main className="flex-1 -mt-6 bg-white rounded-t-3xl px-5 pt-6 pb-32 relative z-10">
        <p className="text-xs font-bold text-brand-500 uppercase tracking-wide">
          {product.categoria}
        </p>
        <h1 className="font-display font-extrabold text-2xl text-ink-900 leading-tight mt-1">
          {product.nombre}
        </h1>

        <div className="flex items-center gap-3 text-xs text-ink-500 mt-2">
          <span className="flex items-center gap-1">
            <Star size={13} className="text-amber-500 fill-amber-500" />
            <span className="font-bold text-ink-700">{product.rating}</span>
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <MapPin size={12} />
            {product.distancia > 0 ? `${product.distancia} km` : 'CABA'}
          </span>
          <span>·</span>
          <span>{product.stock} disponibles</span>
        </div>

        <div className="flex items-baseline gap-2 mt-4">
          <p className="font-extrabold text-3xl text-brand-500">
            ${product.precio.toLocaleString('es-AR')}
          </p>
          <p className="text-sm text-ink-500">por {product.unidad}</p>
        </div>

        {/* Proveedor */}
        <div className="bg-cream-100 rounded-2xl p-4 mt-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white font-extrabold flex items-center justify-center">
            {product.proveedor[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate">{product.proveedor}</p>
            <p className="text-[11px] text-ink-500">Proveedor verificado</p>
          </div>
          {/* Client island: mensaje al proveedor */}
          <ContactButton proveedor={product.proveedor} />
        </div>

        {product.descripcion && (
          <div className="mt-5">
            <h3 className="font-bold text-sm text-ink-900 mb-2">Descripción</h3>
            <p className="text-sm text-ink-600 leading-relaxed">{product.descripcion}</p>
          </div>
        )}

        {product.tags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-1.5">
            {product.tags.map(t => (
              <span key={t} className="bg-cream-100 text-[11px] font-semibold text-ink-600 px-2.5 py-1 rounded-full">
                #{t}
              </span>
            ))}
          </div>
        )}

        <div className="mt-5 grid grid-cols-2 gap-2">
          <div className="bg-leaf-50 rounded-2xl p-3 flex items-center gap-2">
            <Truck size={18} className="text-leaf-600" />
            <div>
              <p className="text-[11px] font-bold text-leaf-800">Entrega hoy</p>
              <p className="text-[10px] text-leaf-600">Antes de 18hs</p>
            </div>
          </div>
          <div className="bg-brand-50 rounded-2xl p-3 flex items-center gap-2">
            <ShieldCheck size={18} className="text-brand-600" />
            <div>
              <p className="text-[11px] font-bold text-brand-800">Pago seguro</p>
              <p className="text-[10px] text-brand-600">A los 7 días</p>
            </div>
          </div>
        </div>

        {/* Client island: qty picker + botones comprar */}
        <BuyActions product={product} />
      </main>
    </div>
  );
}
