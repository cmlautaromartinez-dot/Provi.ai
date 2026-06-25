'use client';

import Link from 'next/link';
import { Star, MapPin, Plus } from 'lucide-react';
import { Product } from '@/types';
import { useStore } from '@/lib/store';
import { useToast } from '@/components/ui/Toast';

export default function ProductCard({ product, compact = false }: { product: Product; compact?: boolean }) {
  const { addToCart } = useStore();
  const toast = useToast();

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id, 1);
    toast.show(`${product.nombre} agregado al carrito`, 'success');
  }

  if (compact) {
    return (
      <Link href={`/producto/${product.id}`} className="block bg-white rounded-2xl shadow-soft overflow-hidden min-w-[180px]">
        <div className={`h-28 bg-gradient-to-br ${product.color} flex items-center justify-center text-5xl relative`}>
          {product.emoji}
          {product.match && (
            <span className="absolute top-2 right-2 bg-white/95 backdrop-blur text-[10px] font-extrabold px-2 py-0.5 rounded-full text-brand-600">
              {product.match}% match
            </span>
          )}
        </div>
        <div className="p-3">
          <p className="font-bold text-sm text-ink-900 leading-tight truncate">{product.nombre}</p>
          <p className="text-[11px] text-ink-500 truncate">{product.proveedor}</p>
          <div className="flex items-center justify-between mt-2">
            <p className="font-extrabold text-brand-500 text-sm">${product.precio.toLocaleString('es-AR')}</p>
            <button onClick={handleAdd} className="w-7 h-7 rounded-lg bg-brand-500 text-white flex items-center justify-center">
              <Plus size={16} strokeWidth={3} />
            </button>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/producto/${product.id}`} className="block bg-white rounded-2xl shadow-soft overflow-hidden">
      <div className="flex">
        <div className={`w-28 h-28 bg-gradient-to-br ${product.color} flex items-center justify-center text-5xl flex-shrink-0`}>
          {product.emoji}
        </div>
        <div className="flex-1 p-3 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <p className="font-bold text-sm text-ink-900 leading-tight">{product.nombre}</p>
            {product.match && (
              <span className="bg-brand-50 text-[10px] font-extrabold px-2 py-0.5 rounded-full text-brand-600 whitespace-nowrap">
                {product.match}%
              </span>
            )}
          </div>
          <p className="text-[11px] text-ink-500 mt-0.5">{product.proveedor}</p>
          <div className="flex items-center gap-2 mt-1.5 text-[11px] text-ink-500">
            <span className="flex items-center gap-0.5">
              <Star size={11} className="text-amber-500 fill-amber-500" />
              <span className="font-bold text-ink-700">{product.rating}</span>
            </span>
            <span className="flex items-center gap-0.5">
              <MapPin size={11} /> {product.distancia} km
            </span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div>
              <p className="font-extrabold text-brand-500 text-base leading-none">${product.precio.toLocaleString('es-AR')}</p>
              <p className="text-[10px] text-ink-400">por {product.unidad}</p>
            </div>
            <button onClick={handleAdd} className="w-9 h-9 rounded-xl bg-brand-500 active:scale-95 text-white flex items-center justify-center shadow-soft">
              <Plus size={18} strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
