'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore, isRealUser } from '@/lib/store';
import { getProductsByIds } from '@/lib/products';
import { createOrders } from '@/lib/orders';
import { Product } from '@/types';
import TopBar from '@/components/TopBar';
import { useToast } from '@/components/Toast';
import { CreditCard, Wallet, Banknote, MapPin, Calendar, Check } from 'lucide-react';

type Line = Product & { cantidad: number };

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, addToCart, clearCart, nombreLocal, userId, ubicacion } = useStore();
  const toast = useToast();
  const [pago, setPago] = useState<'tarjeta' | 'mp' | 'efectivo'>('mp');
  const [success, setSuccess] = useState(false);
  const [items, setItems] = useState<Line[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      // 1 query para todos los ítems (antes: N queries)
      const ids = cart.map(c => c.productId);
      const productos = await getProductsByIds(ids, { lat: ubicacion.lat, lng: ubicacion.lng });
      if (!mounted) return;
      const byId = Object.fromEntries(productos.map(p => [p.id, p]));
      setItems(
        cart
          .map(c => byId[c.productId] ? { ...byId[c.productId], cantidad: c.cantidad } : null)
          .filter(Boolean) as Line[]
      );
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [cart, ubicacion.lat, ubicacion.lng]);

  const subtotal = items.reduce((s, i) => s + i.precio * i.cantidad, 0);
  const total = subtotal + 1200;

  async function pagar() {
    if (items.length === 0) return;

    // Snapshot para rollback — capturar antes de clearCart
    const snapshot = cart.map(c => ({ ...c }));

    // Optimistic: éxito inmediato, sin spinner
    clearCart();
    setSuccess(true);

    // Confirmar en background solo si hay usuario real
    if (isRealUser(userId)) {
      const res = await createOrders(items.map(i => ({
        buyerId: userId,
        productId: i.id,
        sellerId: i.proveedorId,
        cantidad: i.cantidad,
        precioUnitario: i.precio,
      })));
      if (!res.ok) {
        // Rollback: restaurar carrito y volver al formulario
        snapshot.forEach(c => addToCart(c.productId, c.cantidad));
        setSuccess(false);
        toast.show('No pudimos confirmar el pedido. Intentá de nuevo.', 'error');
      }
    }
    // Modo demo: success ya se muestra, no hay API que esperar
  }

  if (loading) {
    return (
      <div className="min-h-full bg-cream-50 flex flex-col">
        <TopBar title="Pagar pedido" />
        <div className="px-4 py-4 space-y-4 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-soft space-y-3">
              <div className="h-3 bg-cream-200 rounded-full w-1/3" />
              <div className="h-4 bg-cream-200 rounded-full w-2/3" />
              <div className="h-3 bg-cream-200 rounded-full w-1/2" />
            </div>
          ))}
        </div>
        <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-ink-100 p-4">
          <div className="w-full h-14 bg-cream-200 rounded-2xl animate-pulse" />
        </footer>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-full bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-28 h-28 rounded-full bg-leaf-100 flex items-center justify-center animate-pop">
          <div className="w-20 h-20 rounded-full bg-leaf-500 flex items-center justify-center">
            <Check size={42} className="text-white" strokeWidth={3} />
          </div>
        </div>
        <h1 className="font-display font-extrabold text-2xl mt-6">¡Pedido confirmado!</h1>
        <p className="text-sm text-ink-500 mt-2">El proveedor ya recibió tu pedido y lo está preparando.</p>
        <div className="bg-cream-100 rounded-2xl p-4 mt-6 w-full max-w-xs">
          <p className="text-xs text-ink-500">Total pagado</p>
          <p className="font-extrabold text-2xl text-brand-500">${total.toLocaleString('es-AR')}</p>
          <p className="text-[11px] text-ink-500 mt-1">Entrega estimada · Hoy 16-19hs</p>
        </div>
        <div className="space-y-2 mt-8 w-full">
          <button onClick={() => router.push('/pedidos')} className="w-full bg-brand-500 text-white font-bold py-4 rounded-2xl shadow-pop">
            Ver mi pedido
          </button>
          <button onClick={() => router.push('/home')} className="w-full text-ink-500 font-semibold py-3">
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-cream-50 flex flex-col">
      <TopBar title="Pagar pedido" />

      <main className="flex-1 px-4 py-4 pb-40 space-y-4">
        <section className="bg-white rounded-2xl p-4 shadow-soft">
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={16} className="text-brand-500" />
            <p className="text-xs font-extrabold uppercase tracking-wide text-ink-700">Dirección de entrega</p>
          </div>
          <p className="font-bold text-sm">{nombreLocal || 'Mi Local'}</p>
          <p className="text-xs text-ink-500">{ubicacion.direccion || ubicacion.barrio || 'CABA'}</p>
        </section>

        <section className="bg-white rounded-2xl p-4 shadow-soft">
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={16} className="text-brand-500" />
            <p className="text-xs font-extrabold uppercase tracking-wide text-ink-700">Cuándo lo querés</p>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 bg-brand-50 border-2 border-brand-500 rounded-xl py-2 text-xs font-bold text-brand-700">Hoy</button>
            <button className="flex-1 bg-cream-100 border-2 border-transparent rounded-xl py-2 text-xs font-bold text-ink-500">Mañana</button>
            <button className="flex-1 bg-cream-100 border-2 border-transparent rounded-xl py-2 text-xs font-bold text-ink-500">Elegir</button>
          </div>
        </section>

        <section className="bg-white rounded-2xl p-4 shadow-soft">
          <p className="text-xs font-extrabold uppercase tracking-wide text-ink-700 mb-3">Método de pago</p>
          <div className="space-y-2">
            <PayOption label="Mercado Pago" desc="Cuenta vinculada" icon={Wallet} sel={pago === 'mp'} onClick={() => setPago('mp')} />
            <PayOption label="Tarjeta de crédito" desc="Visa terminada en 4242" icon={CreditCard} sel={pago === 'tarjeta'} onClick={() => setPago('tarjeta')} />
            <PayOption label="Efectivo / transferencia" desc="A coordinar con proveedor" icon={Banknote} sel={pago === 'efectivo'} onClick={() => setPago('efectivo')} />
          </div>
        </section>

        <section className="bg-white rounded-2xl p-4 shadow-soft space-y-2 text-sm">
          <p className="text-xs font-extrabold uppercase tracking-wide text-ink-700 mb-2">Resumen</p>
          {items.map(i => (
            <div key={i.id} className="flex justify-between text-ink-600">
              <span className="truncate">{i.cantidad}× {i.nombre}</span>
              <span className="font-bold">${(i.precio * i.cantidad).toLocaleString('es-AR')}</span>
            </div>
          ))}
          <div className="h-px bg-ink-100 my-2" />
          <div className="flex justify-between text-ink-600"><span>Envío</span><span>$1.200</span></div>
          <div className="flex justify-between font-extrabold text-base text-ink-900 pt-1"><span>Total</span><span>${total.toLocaleString('es-AR')}</span></div>
        </section>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 md:absolute bg-white border-t border-ink-100 p-4">
        <button
          onClick={pagar}
          className="w-full bg-brand-500 active:scale-[0.97] transition rounded-2xl py-4 font-bold text-white shadow-pop"
        >
          Confirmar y pagar ${total.toLocaleString('es-AR')}
        </button>
      </footer>
    </div>
  );
}

function PayOption({ label, desc, icon: Icon, sel, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition ${sel ? 'border-brand-500 bg-brand-50' : 'border-ink-100 bg-white'}`}
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${sel ? 'bg-brand-500 text-white' : 'bg-cream-100 text-ink-600'}`}>
        <Icon size={18} />
      </div>
      <div className="flex-1 text-left">
        <p className="font-bold text-sm">{label}</p>
        <p className="text-[11px] text-ink-500">{desc}</p>
      </div>
      <div className={`w-5 h-5 rounded-full border-2 ${sel ? 'border-brand-500 bg-brand-500' : 'border-ink-300'} flex items-center justify-center`}>
        {sel && <span className="w-2 h-2 rounded-full bg-white" />}
      </div>
    </button>
  );
}
