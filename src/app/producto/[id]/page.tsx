'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { getProduct } from '@/lib/products';
import { Product } from '@/types';
import { ChevronLeft, Heart, Share2, Star, MapPin, Truck, ShieldCheck, MessageCircle, Plus, Minus, Loader2 } from 'lucide-react';

export default function ProductoPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart, ubicacion } = useStore();
  const toast = useToast();
  const [qty, setQty] = useState(1);
  const [fav, setFav] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = String(params.id);
    getProduct(id, { lat: ubicacion.lat, lng: ubicacion.lng }).then((p) => {
      setProduct(p);
      setLoading(false);
    });
  }, [params.id, ubicacion.lat, ubicacion.lng]);

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center bg-white">
        <Loader2 size={32} className="text-brand-500 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-8 text-center min-h-full flex flex-col items-center justify-center gap-4">
        <span className="text-5xl">🤷</span>
        <p className="font-bold">Producto no encontrado</p>
        <button onClick={() => router.back()} className="mt-2 underline text-brand-500">Volver</button>
      </div>
    );
  }

  function add() {
    addToCart(product!.id, qty);
    toast.show(`${qty}× ${product!.nombre} al carrito`, 'success');
  }

  function buyNow() {
    addToCart(product!.id, qty);
    router.push('/carrito');
  }

  return (
    <div className="min-h-full bg-white flex flex-col">
      <div className={`relative bg-gradient-to-br ${product.color} h-72 flex items-end justify-center pt-6`}>
        <header className="absolute top-0 left-0 right-0 z-30 px-3 py-3 flex items-center justify-between">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white/95 backdrop-blur flex items-center justify-center shadow-soft">
            <ChevronLeft size={22} />
          </button>
          <div className="flex gap-2">
            <button onClick={() => setFav(f => !f)} className="w-10 h-10 rounded-full bg-white/95 backdrop-blur flex items-center justify-center shadow-soft">
              <Heart size={20} className={fav ? 'fill-red-500 text-red-500' : 'text-ink-700'} />
            </button>
            <button onClick={() => toast.show('Link copiado', 'info')} className="w-10 h-10 rounded-full bg-white/95 backdrop-blur flex items-center justify-center shadow-soft">
              <Share2 size={18} />
            </button>
          </div>
        </header>

        <span className="text-[10rem] leading-none drop-shadow-2xl">{product.emoji}</span>
      </div>

      <main className="flex-1 -mt-6 bg-white rounded-t-3xl px-5 pt-6 pb-32 relative z-10">
        <p className="text-xs font-bold text-brand-500 uppercase tracking-wide">{product.categoria}</p>
        <h1 className="font-display font-extrabold text-2xl text-ink-900 leading-tight mt-1">{product.nombre}</h1>

        <div className="flex items-center gap-3 text-xs text-ink-500 mt-2">
          <span className="flex items-center gap-1">
            <Star size={13} className="text-amber-500 fill-amber-500" />
            <span className="font-bold text-ink-700">{product.rating}</span>
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <MapPin size={12} /> {product.distancia > 0 ? `${product.distancia} km` : 'cerca'}
          </span>
          <span>·</span>
          <span>{product.stock} disponibles</span>
        </div>

        <div className="flex items-baseline gap-2 mt-4">
          <p className="font-extrabold text-3xl text-brand-500">${product.precio.toLocaleString('es-AR')}</p>
          <p className="text-sm text-ink-500">por {product.unidad}</p>
        </div>

        <div className="bg-cream-100 rounded-2xl p-4 mt-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white font-extrabold flex items-center justify-center">
            {product.proveedor[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate">{product.proveedor}</p>
            <p className="text-[11px] text-ink-500">Proveedor verificado</p>
          </div>
          <button onClick={() => toast.show('Mensaje enviado al proveedor', 'success')} className="w-10 h-10 rounded-xl bg-white text-brand-500 flex items-center justify-center shadow-soft">
            <MessageCircle size={18} />
          </button>
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

        <div className="mt-6 flex items-center justify-between bg-cream-100 rounded-2xl p-3">
          <p className="font-bold text-sm">Cantidad</p>
          <div className="flex items-center gap-3 bg-white rounded-xl px-2 py-1.5">
            <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-8 h-8 rounded-lg bg-cream-100 flex items-center justify-center">
              <Minus size={14} />
            </button>
            <span className="font-extrabold text-lg w-6 text-center">{qty}</span>
            <button onClick={() => setQty(qty + 1)} className="w-8 h-8 rounded-lg bg-brand-500 text-white flex items-center justify-center">
              <Plus size={14} strokeWidth={3} />
            </button>
          </div>
        </div>
      </main>

      <footer className="fixed md:absolute bottom-0 left-0 right-0 bg-white border-t border-ink-100 p-4 flex gap-2 z-20">
        <button onClick={add} className="flex-1 bg-cream-100 active:scale-[0.98] transition rounded-2xl py-3.5 font-bold text-ink-900 text-sm">
          Agregar al carrito
        </button>
        <button onClick={buyNow} className="flex-[1.3] bg-brand-500 active:scale-[0.98] transition rounded-2xl py-3.5 font-bold text-white shadow-pop text-sm">
          Comprar ${(product.precio * qty).toLocaleString('es-AR')}
        </button>
      </footer>
    </div>
  );
}
