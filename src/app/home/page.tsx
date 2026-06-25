// RSC — sin 'use client'. Datos fetcheados en el servidor, cero waterfall.
// React.cache() deduplica la query: RecomendadosSection y TrendingSection
// comparten 1 sola llamada a Supabase aunque estén en Suspense boundaries separados.
export const revalidate = 60; // ISR: CDN cachea 60s, luego revalida en background

import { Suspense, cache } from 'react';
import { listProductsServer } from '@/lib/services/products';
import { Sparkles, TrendingUp, Zap } from 'lucide-react';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';
import BottomNav from '@/components/layout/BottomNav';
import HomeHeader from '@/components/home/HomeHeader';

// CABA centro — coords por defecto para cálculo de distancia server-side.
// El usuario urbano de CABA (target principal) ve distancias correctas.
const CABA = { lat: -34.6037, lng: -58.3816 };

// cache() garantiza que múltiples RSC compartan la misma Promise por request
const fetchProducts = cache(() => listProductsServer({ buyerCoords: CABA }));

async function RecomendadosSection() {
  const productos = await fetchProducts();
  const recomendados = [...productos].sort((a, b) => a.distancia - b.distancia).slice(0, 6);

  if (recomendados.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-card border border-cream-200 p-6 text-center">
        <p className="text-3xl mb-2">🍽️</p>
        <p className="font-bold text-sm">Todavía no hay productos cargados</p>
        <p className="text-[11px] text-ink-500 mt-1">Revisá que el seed corrió OK en Supabase</p>
      </div>
    );
  }

  return (
    <>
      <div className="md:hidden flex gap-3 overflow-x-auto no-scrollbar -mx-5 px-5 pb-2">
        {recomendados.map(p => <ProductCard key={p.id} product={p} compact />)}
      </div>
      <div className="hidden md:grid grid-cols-3 lg:grid-cols-4 gap-4">
        {recomendados.map(p => <ProductCard key={p.id} product={p} compact />)}
      </div>
    </>
  );
}

async function TrendingSection() {
  const productos = await fetchProducts(); // misma Promise — sin segunda query
  const trending = [...productos].sort((a, b) => b.rating - a.rating).slice(0, 6);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {trending.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}

function ProductsGridSkeleton({ rows = 4, tall = false }: { rows?: number; tall?: boolean }) {
  return (
    <div className={`grid gap-3 ${tall ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2'}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={`bg-white rounded-2xl shadow-card animate-pulse ${tall ? 'h-52' : 'h-28'}`} />
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-full bg-cream-50 flex flex-col">

      {/* Client island: necesita localStorage para nombreLocal y cart */}
      <HomeHeader />

      <main className="flex-1 px-5 md:px-8 pt-6 pb-6 max-w-5xl mx-auto w-full space-y-8">

        {/* Estático — no necesita data, renderiza en el primer byte */}
        <div className="bg-gradient-to-br from-brand-50 to-cream-100 border border-brand-100 rounded-3xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center flex-shrink-0">
            <Zap size={22} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-extrabold text-brand-600 uppercase tracking-wide">Provi recomienda</p>
            <p className="font-display font-extrabold text-ink-900 text-base">Sumá comida sin TACC — +40% de búsquedas en tu zona</p>
          </div>
          <Link
            href="/onboarding/comprador"
            className="flex-shrink-0 bg-brand-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-pop hover:bg-brand-600 transition flex items-center gap-1.5"
          >
            <Sparkles size={13} /> Mejorar mi match
          </Link>
        </div>

        {/* Recomendados — streamed desde el servidor */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-extrabold text-xl flex items-center gap-2">
              <Sparkles size={20} className="text-brand-500" /> Para vos
            </h2>
            <Link href="/explorar" className="text-sm font-semibold text-brand-500 hover:text-brand-600">Ver todo</Link>
          </div>
          <Suspense fallback={<ProductsGridSkeleton rows={4} tall />}>
            <RecomendadosSection />
          </Suspense>
        </section>

        {/* Categorías — estático, llega con el HTML inicial */}
        <section>
          <h2 className="font-display font-extrabold text-xl mb-3 flex items-center gap-2">
            <span>📂</span> Categorías
          </h2>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {[
              { e: '🧁', n: 'Pastel.', c: 'Pastelería' },
              { e: '🥖', n: 'Panad.',  c: 'Panadería' },
              { e: '🥗', n: 'Viandas', c: 'Viandas' },
              { e: '🥟', n: 'Salado',  c: 'Salado' },
              { e: '🥤', n: 'Bebidas', c: 'Bebidas' },
              { e: '🥛', n: 'Lácteos', c: 'Lácteos' },
              { e: '🌱', n: 'Vegano',  c: 'Todos' },
              { e: '🌾', n: 'S/TACC',  c: 'Todos' },
            ].map(c => (
              <Link
                key={c.n}
                href={`/explorar?cat=${encodeURIComponent(c.c)}`}
                className="bg-white rounded-2xl shadow-card border border-cream-200 p-3 flex flex-col items-center gap-1 hover:border-brand-300 active:scale-95 transition"
              >
                <span className="text-2xl">{c.e}</span>
                <span className="text-[11px] font-semibold text-ink-700">{c.n}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Trending — streamed (comparte la misma query gracias a React.cache) */}
        <section>
          <h2 className="font-display font-extrabold text-xl mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-leaf-500" /> Lo más pedido cerca tuyo
          </h2>
          <Suspense fallback={<ProductsGridSkeleton rows={4} />}>
            <TrendingSection />
          </Suspense>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
