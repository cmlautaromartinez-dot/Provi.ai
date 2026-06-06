'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { listOrdersForBuyer } from '@/lib/orders';
import { Pedido } from '@/types';
import BottomNav from '@/components/BottomNav';
import TopBar from '@/components/TopBar';
import { ChevronRight, Package, Loader2 } from 'lucide-react';

const COLORS: Record<string, string> = {
  pendiente: 'bg-amber-100 text-amber-700',
  aceptado: 'bg-blue-100 text-blue-700',
  'en camino': 'bg-brand-100 text-brand-700',
  entregado: 'bg-leaf-100 text-leaf-700',
  cancelado: 'bg-red-100 text-red-700',
};

export default function PedidosPage() {
  const { userId } = useStore();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    listOrdersForBuyer(userId).then((p) => {
      setPedidos(p);
      setLoading(false);
    });
  }, [userId]);

  return (
    <div className="min-h-full bg-cream-50 flex flex-col">
      <TopBar title="Mis pedidos" back={false} />
      <main className="flex-1 px-4 py-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={24} className="text-brand-500 animate-spin" />
          </div>
        ) : pedidos.length === 0 ? (
          <div className="text-center py-16">
            <Package size={40} className="mx-auto text-ink-300" />
            <p className="font-bold mt-3">Aún no tenés pedidos</p>
            <p className="text-xs text-ink-500">Tu primer pedido va a aparecer acá</p>
          </div>
        ) : (
          pedidos.map(p => (
            <div key={p.id} className="bg-white rounded-2xl p-4 shadow-soft flex items-center gap-3 active:scale-[0.99] transition">
              <div className="w-14 h-14 rounded-2xl bg-cream-100 flex items-center justify-center text-3xl">
                {p.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{p.producto}</p>
                <p className="text-xs text-ink-500 truncate">{p.proveedor} · {p.cantidad} u</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${COLORS[p.estado]}`}>
                    {p.estado.toUpperCase()}
                  </span>
                  <span className="text-[11px] text-ink-400">{p.fecha}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-extrabold text-sm text-ink-900">${p.total.toLocaleString('es-AR')}</p>
                <ChevronRight size={16} className="text-ink-300 ml-auto mt-1" />
              </div>
            </div>
          ))
        )}
      </main>
      <BottomNav />
    </div>
  );
}
