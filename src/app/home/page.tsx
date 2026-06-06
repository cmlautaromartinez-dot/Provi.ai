'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { listProducts } from '@/lib/products';
import { Bell, ShoppingCart, Sparkles, TrendingUp, Bot } from 'lucide-react';
import Link from 'next/link';
import { Product } from '@/types';
import ProductCard from '@/components/ProductCard';
import BottomNav from '@/components/BottomNav';

export default function HomePage() {
  const { nombreLocal, cart, ubicacion } = useStore();
  const [productos, setProductos] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listProducts({ buyerCoords: { lat: ubicacion.lat, lng: ubicacion.lng } }).then((p) => {
      setProductos(p);
      setLoading(false);
    });
  }, [ubicacion.lat, ubicacion.lng]);

  // Cercanos primero como "recomendados"
  const recomendados = [...productos].sort((a, b) => a.distancia - b.distancia).slice(0, 6);
  const trending = [...productos].sort((a, b) => b.rating - a.rating).slice(0, 4);

  return (
    <div className="min-h-full bg-cream-50 flex flex-col">
      <header className="sticky top-0 z-30 bg-gradient-to-br from-brand-500 to-brand-600 text-white px-5 pt-5 pb-6 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-white/80">Hola 👋</p>
            <p className="font-display font-extrabold text-lg">{nombreLocal || 'Mi Local'}</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center relative">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-leaf-400 rounded-full" />
            </button>
            <Link href="/carrito" className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center relative">
              <ShoppingCart size={18} />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-leaf-500 text-[10px] font-extrabold rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </Link>
          </div>
        </div>

        <Link href="/explorar" className="bg-white/95 text-ink-700 rounded-2xl px-4 py-3 flex items-center gap-2 text-sm">
          <span className="text-ink-400">🔍</span>
          <span className="text-ink-500">Buscá productos, proveedores...</span>
        </Link>

        <Link href="/provibot" className="mt-3 bg-ink-900/30 backdrop-blur border border-white/20 rounded-2xl px-4 py-3 flex items-center gap-3 active:scale-[0.98] transition">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-xl">🤖</div>
          <div className="flex-1">
            <p className="font-bold text-sm">Hablá con Provi</p>
            <p className="text-[11px] text-white/80">Pedí lo que necesites en lenguaje natural</p>
          </div>
          <Bot size={18} />
        </Link>
      </header>

      <main className="flex-1 px-5 pt-6 pb-6 space-y-7">
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-extrabold text-lg flex items-center gap-2">
              <Sparkles size={18} className="text-brand-500" /> Para vos
            </h2>
            <Link href="/explorar" className="text-xs font-semibold text-brand-500">Ver todo</Link>
          </div>
          <p className="text-xs text-ink-500 mb-3">Productos cerca tuyo y compatibles con tu local.</p>
          {loading ? (
            <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-5 px-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="min-w-[180px] h-48 bg-white rounded-2xl shadow-soft animate-pulse" />
              ))}
            </div>
          ) : recomendados.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-5 px-5 pb-2">
              {recomendados.map(p => (
                <ProductCard key={p.id} product={p} compact />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="font-display font-extrabold text-lg mb-2 flex items-center gap-2">
            <span>📂</span> Categorías
          </h2>
          <div className="grid grid-cols-4 gap-2">
            {[
              { e: '🧁', n: 'Pastel.', c: 'Pastelería' },
              { e: '🥖', n: 'Panad.', c: 'Panadería' },
              { e: '🥗', n: 'Viandas', c: 'Viandas' },
              { e: '🥟', n: 'Salado', c: 'Salado' },
              { e: '🥤', n: 'Bebidas', c: 'Bebidas' },
              { e: '🥛', n: 'Lácteos', c: 'Lácteos' },
              { e: '🌱', n: 'Vegano', c: 'Todos' },
              { e: '🌾', n: 'S/TACC', c: 'Todos' },
            ].map(c => (
              <Link key={c.n} href={`/explorar?cat=${encodeURIComponent(c.c)}`} className="bg-white rounded-2xl shadow-soft p-3 flex flex-col items-center gap-1 active:scale-95 transition">
                <span className="text-2xl">{c.e}</span>
                <span className="text-[11px] font-semibold text-ink-700">{c.n}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-gradient-to-br from-leaf-50 to-leaf-100 rounded-3xl p-5 border border-leaf-200">
          <div className="flex items-start gap-3">
            <div className="text-3xl">💡</div>
            <div className="flex-1">
              <p className="text-xs font-extrabold text-leaf-700 uppercase tracking-wide">Provi recomienda</p>
              <p className="font-display font-extrabold text-ink-900 mt-1">Sumá comida sin TACC</p>
              <p className="text-xs text-ink-600 mt-1">Detectamos +40% de búsquedas de productos celíacos en tu zona esta semana.</p>
              <Link href="/explorar" className="mt-3 inline-flex items-center gap-1 bg-leaf-500 text-white text-xs font-bold px-4 py-2 rounded-xl">
                Ver opciones <span>→</span>
              </Link>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-display font-extrabold text-lg mb-3 flex items-center gap-2">
            <TrendingUp size={18} className="text-leaf-500" /> Lo más pedido cerca tuyo
          </h2>
          {loading ? (
            <div className="space-y-2.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-28 bg-white rounded-2xl shadow-soft animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-2.5">
              {trending.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white rounded-2xl shadow-soft p-6 text-center">
      <p className="text-3xl mb-2">🍽️</p>
      <p className="font-bold text-sm">Todavía no hay productos cargados</p>
      <p className="text-[11px] text-ink-500 mt-1">Revisá que el seed corrió OK en Supabase</p>
    </div>
  );
}
