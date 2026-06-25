'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { listProductsBySeller } from '@/lib/services/products';
import { Product } from '@/types';
import BottomNav from '@/components/layout/BottomNav';
import TopBar from '@/components/layout/TopBar';
import { Plus, Eye, Edit3, Loader2 } from 'lucide-react';

export default function MisProductosPage() {
  const { userId } = useStore();
  const [productos, setProductos] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    listProductsBySeller(userId).then((p) => {
      setProductos(p);
      setLoading(false);
    });
  }, [userId]);

  return (
    <div className="min-h-full bg-cream-50 flex flex-col">
      <TopBar
        title="Mis productos"
        back={false}
        right={
          <Link href="/vendedor/publicar" className="bg-leaf-500 text-white w-9 h-9 rounded-xl flex items-center justify-center">
            <Plus size={18} strokeWidth={3} />
          </Link>
        }
      />

      <main className="flex-1 px-4 py-4 space-y-3">
        <div className="grid grid-cols-3 gap-2 mb-2">
          <div className="bg-white rounded-2xl shadow-soft p-3 text-center">
            <p className="font-extrabold text-xl text-leaf-600">{productos.length}</p>
            <p className="text-[10px] text-ink-500">Publicados</p>
          </div>
          <div className="bg-white rounded-2xl shadow-soft p-3 text-center">
            <p className="font-extrabold text-xl text-brand-600">{productos.reduce((s, p) => s + p.stock, 0)}</p>
            <p className="text-[10px] text-ink-500">Stock total</p>
          </div>
          <div className="bg-white rounded-2xl shadow-soft p-3 text-center">
            <p className="font-extrabold text-xl text-amber-600">{productos.filter(p => p.stock < 10).length}</p>
            <p className="text-[10px] text-ink-500">Bajo stock</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={24} className="text-leaf-500 animate-spin" />
          </div>
        ) : productos.length === 0 ? (
          <Link href="/vendedor/publicar" className="block bg-white border-2 border-dashed border-ink-200 rounded-3xl p-8 text-center active:scale-[0.99] transition">
            <Plus size={32} className="mx-auto text-leaf-500" strokeWidth={2.5} />
            <p className="font-bold text-base mt-2">Publicá tu primer producto</p>
            <p className="text-xs text-ink-500 mt-1">Cuanto antes lo subas, antes te llegan pedidos</p>
          </Link>
        ) : (
          <>
            {productos.map(p => (
              <div key={p.id} className="bg-white rounded-2xl shadow-soft p-3 flex gap-3">
                <div className={`w-20 h-20 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center text-4xl flex-shrink-0`}>
                  {p.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="font-bold text-sm truncate">{p.nombre}</p>
                    <span className="bg-leaf-100 text-leaf-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full whitespace-nowrap">ACTIVO</span>
                  </div>
                  <p className="text-[11px] text-ink-500">{p.categoria}</p>
                  <p className="font-extrabold text-leaf-600 mt-1">${p.precio.toLocaleString('es-AR')} <span className="text-[11px] text-ink-400 font-normal">/{p.unidad}</span></p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-[10px] text-ink-500 flex items-center gap-0.5">
                      <Eye size={11} /> {Math.floor(Math.random() * 200)}
                    </span>
                    <span className="text-[10px] text-ink-500">·</span>
                    <span className={`text-[10px] ${p.stock < 10 ? 'text-amber-600 font-bold' : 'text-ink-500'}`}>Stock: {p.stock}</span>
                    <button className="ml-auto w-7 h-7 rounded-lg bg-cream-100 flex items-center justify-center">
                      <Edit3 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <Link href="/vendedor/publicar" className="block bg-white border-2 border-dashed border-ink-200 rounded-2xl p-6 text-center mt-4 active:scale-[0.99] transition">
              <Plus size={28} className="mx-auto text-leaf-500" strokeWidth={2.5} />
              <p className="font-bold text-sm mt-1">Sumá otro producto</p>
              <p className="text-xs text-ink-500">Cuantos más, más ventas</p>
            </Link>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
