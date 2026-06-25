'use client';

import { useStore } from '@/lib/store';
import { ShoppingCart, Bot } from 'lucide-react';
import Link from 'next/link';

// Client island: accede a localStorage (cart, nombreLocal) — el resto del home es RSC
export default function HomeHeader() {
  const { nombreLocal, cart } = useStore();

  return (
    <header className="sticky top-0 z-30 bg-gradient-to-r from-brand-500 to-brand-600 text-white px-5 md:px-8 pt-5 pb-6 md:pb-5 rounded-b-3xl md:rounded-none">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-white/70">Hola 👋</p>
            <p className="font-display font-extrabold text-lg">{nombreLocal || 'Mi Local'}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/pedidos" className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center relative">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-leaf-400 rounded-full" />
            </Link>
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

        <div className="flex gap-3 flex-col md:flex-row">
          <Link href="/explorar" className="flex-1 bg-white/95 text-ink-700 rounded-2xl px-4 py-3 flex items-center gap-2 text-sm">
            <span className="text-ink-400">🔍</span>
            <span className="text-ink-500">Buscá productos, proveedores...</span>
          </Link>
          <Link href="/provibot" className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl px-4 py-3 flex items-center gap-2 active:scale-[0.98] transition whitespace-nowrap">
            <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-base">🤖</div>
            <span className="font-bold text-sm">Hablá con Provi</span>
            <Bot size={16} className="text-white/60 ml-1" />
          </Link>
        </div>
      </div>
    </header>
  );
}
