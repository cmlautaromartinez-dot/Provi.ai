'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { Heart, Share2, Plus, Minus, MessageCircle } from 'lucide-react';
import { Product } from '@/types';

export function FavShareButtons() {
  const toast = useToast();
  const [fav, setFav] = useState(false);
  return (
    <div className="flex gap-2">
      <button
        onClick={() => setFav(f => !f)}
        className="w-10 h-10 rounded-full bg-white/95 backdrop-blur flex items-center justify-center shadow-soft"
      >
        <Heart size={20} className={fav ? 'fill-red-500 text-red-500' : 'text-ink-700'} />
      </button>
      <button
        onClick={() => toast.show('Link copiado', 'info')}
        className="w-10 h-10 rounded-full bg-white/95 backdrop-blur flex items-center justify-center shadow-soft"
      >
        <Share2 size={18} />
      </button>
    </div>
  );
}

export function ContactButton({ proveedor }: { proveedor: string }) {
  const toast = useToast();
  return (
    <button
      onClick={() => toast.show('Mensaje enviado al proveedor', 'success')}
      className="w-10 h-10 rounded-xl bg-white text-brand-500 flex items-center justify-center shadow-soft"
    >
      <MessageCircle size={18} />
    </button>
  );
}

export function BuyActions({ product }: { product: Product }) {
  const router = useRouter();
  const { addToCart } = useStore();
  const toast = useToast();
  const [qty, setQty] = useState(1);

  function add() {
    addToCart(product.id, qty);
    toast.show(`${qty}× ${product.nombre} al carrito`, 'success');
  }

  function buyNow() {
    addToCart(product.id, qty);
    router.push('/carrito');
  }

  return (
    <>
      {/* Qty picker */}
      <div className="mt-6 flex items-center justify-between bg-cream-100 rounded-2xl p-3">
        <p className="font-bold text-sm">Cantidad</p>
        <div className="flex items-center gap-3 bg-white rounded-xl px-2 py-1.5">
          <button
            onClick={() => setQty(Math.max(1, qty - 1))}
            className="w-8 h-8 rounded-lg bg-cream-100 flex items-center justify-center"
          >
            <Minus size={14} />
          </button>
          <span className="font-extrabold text-lg w-6 text-center">{qty}</span>
          <button
            onClick={() => setQty(qty + 1)}
            className="w-8 h-8 rounded-lg bg-brand-500 text-white flex items-center justify-center"
          >
            <Plus size={14} strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* Sticky footer */}
      <footer className="fixed md:absolute bottom-0 left-0 right-0 bg-white border-t border-ink-100 p-4 flex gap-2 z-20">
        <button
          onClick={add}
          className="flex-1 bg-cream-100 active:scale-[0.98] transition rounded-2xl py-3.5 font-bold text-ink-900 text-sm"
        >
          Agregar al carrito
        </button>
        <button
          onClick={buyNow}
          className="flex-[1.3] bg-brand-500 active:scale-[0.98] transition rounded-2xl py-3.5 font-bold text-white shadow-pop text-sm"
        >
          Comprar ${(product.precio * qty).toLocaleString('es-AR')}
        </button>
      </footer>
    </>
  );
}
