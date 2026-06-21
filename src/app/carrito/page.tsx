'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { getProductsByIds } from '@/lib/products';
import { Product } from '@/types';
import TopBar from '@/components/TopBar';
import { useToast } from '@/components/Toast';
import { Plus, Minus, Trash2, ShoppingBag, Truck } from 'lucide-react';

type CartLine = Product & { cantidad: number };

export default function CarritoPage() {
  const router = useRouter();
  const { cart, addToCart, removeFromCart, ubicacion } = useStore();
  const toast = useToast();
  const [items, setItems] = useState<CartLine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      // 1 query para todos los productos del carrito (antes: N queries)
      const ids = cart.map(c => c.productId);
      const productos = await getProductsByIds(ids, { lat: ubicacion.lat, lng: ubicacion.lng });
      if (!mounted) return;
      const byId = Object.fromEntries(productos.map(p => [p.id, p]));
      setItems(
        cart
          .map(c => byId[c.productId] ? { ...byId[c.productId], cantidad: c.cantidad } : null)
          .filter(Boolean) as CartLine[]
      );
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [cart, ubicacion.lat, ubicacion.lng]);

  const subtotal = items.reduce((s, i) => s + i.precio * i.cantidad, 0);
  const envio = subtotal > 0 ? 1200 : 0;
  const total = subtotal + envio;

  function dec(id: string, current: number) {
    if (current <= 1) removeFromCart(id);
    else { removeFromCart(id); addToCart(id, current - 1); }
  }

  function checkout() {
    router.push('/checkout');
  }

  if (loading) {
    return (
      <div className="min-h-full flex flex-col bg-cream-50">
        <TopBar title="Mi carrito" />
        <div className="px-4 py-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-3 flex gap-3 animate-pulse">
              <div className="w-20 h-20 rounded-xl bg-cream-200 flex-shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-3.5 bg-cream-200 rounded-full w-3/4" />
                <div className="h-3 bg-cream-200 rounded-full w-1/2" />
                <div className="h-4 bg-cream-200 rounded-full w-1/3 mt-2" />
              </div>
            </div>
          ))}
          <div className="bg-white rounded-2xl p-4 mt-4 space-y-3 animate-pulse">
            <div className="h-3 bg-cream-200 rounded-full w-1/4" />
            <div className="h-3 bg-cream-200 rounded-full w-full" />
            <div className="h-px bg-cream-200" />
            <div className="h-5 bg-cream-200 rounded-full w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-full flex flex-col bg-white">
        <TopBar title="Mi carrito" />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-24 h-24 rounded-full bg-cream-100 flex items-center justify-center text-5xl">🛒</div>
          <h2 className="font-display font-extrabold text-xl mt-4">Carrito vacío</h2>
          <p className="text-sm text-ink-500 mt-1">Sumá productos desde el explorador o pediselos a Provi.</p>
          <button onClick={() => router.push('/explorar')} className="mt-6 bg-brand-500 text-white font-bold px-6 py-3 rounded-2xl shadow-pop">
            Explorar productos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col bg-cream-50">
      <TopBar title="Mi carrito" subtitle={`${items.length} ${items.length === 1 ? 'producto' : 'productos'}`} />

      <main className="flex-1 px-4 py-4 pb-40 space-y-3">
        {items.map(i => (
          <div key={i.id} className="bg-white rounded-2xl shadow-soft p-3 flex gap-3">
            <div className={`w-20 h-20 rounded-xl bg-gradient-to-br ${i.color} flex items-center justify-center text-4xl flex-shrink-0`}>
              {i.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate">{i.nombre}</p>
              <p className="text-[11px] text-ink-500 truncate">{i.proveedor}</p>
              <p className="font-extrabold text-brand-500 mt-1">${(i.precio * i.cantidad).toLocaleString('es-AR')}</p>
            </div>
            <div className="flex flex-col items-end justify-between">
              <button onClick={() => { removeFromCart(i.id); toast.show('Eliminado del carrito', 'info'); }} className="w-8 h-8 rounded-lg text-red-500 active:bg-red-50 flex items-center justify-center">
                <Trash2 size={16} />
              </button>
              <div className="flex items-center gap-1 bg-cream-100 rounded-xl px-1 py-1">
                <button onClick={() => dec(i.id, i.cantidad)} className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
                  <Minus size={12} />
                </button>
                <span className="font-extrabold text-sm w-5 text-center">{i.cantidad}</span>
                <button onClick={() => addToCart(i.id, 1)} className="w-7 h-7 rounded-lg bg-brand-500 text-white flex items-center justify-center">
                  <Plus size={12} strokeWidth={3} />
                </button>
              </div>
            </div>
          </div>
        ))}

        <div className="bg-leaf-50 border border-leaf-200 rounded-2xl p-3 flex items-center gap-2 text-leaf-800">
          <Truck size={16} />
          <p className="text-xs font-semibold">Entrega estimada: <b>hoy 16-19hs</b></p>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-4 mt-4 space-y-2">
          <Row label="Subtotal" value={`$${subtotal.toLocaleString('es-AR')}`} />
          <Row label="Envío" value={`$${envio.toLocaleString('es-AR')}`} />
          <div className="h-px bg-ink-100 my-2" />
          <Row label="Total" value={`$${total.toLocaleString('es-AR')}`} bold />
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 md:absolute bg-white border-t border-ink-100 p-4">
        <button onClick={checkout} className="w-full bg-brand-500 active:scale-[0.98] transition rounded-2xl py-4 font-bold text-white shadow-pop flex items-center justify-center gap-2">
          <ShoppingBag size={18} /> Pagar ${total.toLocaleString('es-AR')}
        </button>
      </footer>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between text-sm ${bold ? 'font-extrabold text-base text-ink-900' : 'text-ink-600'}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
