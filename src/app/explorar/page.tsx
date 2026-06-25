'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useStore } from '@/lib/store';
import { listProducts } from '@/lib/services/products';
import { Product } from '@/types';
import { Search, SlidersHorizontal, MapPin, Star, Sparkles } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import BottomNav from '@/components/layout/BottomNav';
import TopBar from '@/components/layout/TopBar';

const CATEGORIAS = ['Todos', 'Pastelería', 'Panadería', 'Viandas', 'Salado', 'Bebidas', 'Lácteos'];

export default function ExplorarPage() {
  return (
    <Suspense fallback={<div className="min-h-full bg-cream-50" />}>
      <ExplorarInner />
    </Suspense>
  );
}

function ExplorarInner() {
  const { ubicacion } = useStore();
  const search = useSearchParams();
  const catParam = search.get('cat');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState(catParam || 'Todos');
  const [orden, setOrden] = useState<'cerca' | 'rating' | 'precio'>('cerca');
  const [productos, setProductos] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    listProducts({ buyerCoords: { lat: ubicacion.lat, lng: ubicacion.lng } }).then((p) => {
      setProductos(p);
      setLoading(false);
    });
  }, [ubicacion.lat, ubicacion.lng]);

  let lista = [...productos];
  if (cat !== 'Todos') lista = lista.filter(p => p.categoria === cat);
  if (q) {
    const ql = q.toLowerCase();
    lista = lista.filter(p =>
      p.nombre.toLowerCase().includes(ql) ||
      p.proveedor.toLowerCase().includes(ql) ||
      p.tags.some(t => t.toLowerCase().includes(ql))
    );
  }
  if (orden === 'cerca') lista.sort((a, b) => a.distancia - b.distancia);
  if (orden === 'rating') lista.sort((a, b) => b.rating - a.rating);
  if (orden === 'precio') lista.sort((a, b) => a.precio - b.precio);

  return (
    <div className="min-h-full bg-cream-50 flex flex-col">
      <TopBar title="Explorar" back={false} />
      <div className="px-4 py-3 bg-white border-b border-ink-100 space-y-3">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscá productos, proveedores..."
            className="w-full pl-10 pr-4 py-3 bg-cream-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
          {CATEGORIAS.map(c => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                cat === c ? 'bg-brand-500 text-white shadow-soft' : 'bg-cream-100 text-ink-600'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
          {[
            { k: 'cerca', l: 'Más cerca', i: MapPin },
            { k: 'rating', l: 'Mejor rating', i: Star },
            { k: 'precio', l: 'Menor precio', i: SlidersHorizontal },
          ].map(o => {
            const I = o.i;
            const sel = orden === o.k;
            return (
              <button
                key={o.k}
                onClick={() => setOrden(o.k as any)}
                className={`flex items-center gap-1 whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                  sel ? 'bg-ink-900 text-white border-ink-900' : 'bg-white text-ink-600 border-ink-200'
                }`}
              >
                <I size={12} /> {o.l}
              </button>
            );
          })}
        </div>
      </div>

      <main className="flex-1 px-4 py-4 space-y-2.5">
        {loading ? (
          <>
            <div className="h-3 w-20 bg-white rounded animate-pulse" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-28 bg-white rounded-2xl shadow-soft animate-pulse" />
            ))}
          </>
        ) : (
          <>
            <p className="text-xs text-ink-500">{lista.length} productos</p>
            {lista.map(p => <ProductCard key={p.id} product={p} />)}
            {lista.length === 0 && (
              <div className="text-center py-16">
                <p className="text-4xl mb-2">🔍</p>
                <p className="font-semibold text-ink-700">Nada por acá</p>
                <p className="text-xs text-ink-500">Probá con otra búsqueda</p>
              </div>
            )}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
