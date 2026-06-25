'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { listOrdersForSeller, updateOrderStatus } from '@/lib/services/orders';
import { Pedido } from '@/types';
import BottomNav from '@/components/layout/BottomNav';
import TopBar from '@/components/layout/TopBar';
import { useToast } from '@/components/ui/Toast';
import { Check, X, MessageCircle, Loader2 } from 'lucide-react';

const COLORS: Record<string, string> = {
  pendiente: 'bg-amber-100 text-amber-700',
  aceptado: 'bg-blue-100 text-blue-700',
  'en camino': 'bg-brand-100 text-brand-700',
  entregado: 'bg-leaf-100 text-leaf-700',
  cancelado: 'bg-red-100 text-red-700',
};

const TABS = ['Todos', 'Pendientes', 'En curso', 'Entregados'];

export default function VendedorPedidosPage() {
  const { userId } = useStore();
  const toast = useToast();
  const [tab, setTab] = useState('Todos');
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  async function reload() {
    if (!userId) { setLoading(false); return; }
    const data = await listOrdersForSeller(userId);
    setPedidos(data);
    setLoading(false);
  }

  useEffect(() => { reload(); /* eslint-disable-next-line */ }, [userId]);

  let lista = [...pedidos];
  if (tab === 'Pendientes') lista = lista.filter(p => p.estado === 'pendiente');
  if (tab === 'En curso') lista = lista.filter(p => p.estado === 'aceptado' || p.estado === 'en camino');
  if (tab === 'Entregados') lista = lista.filter(p => p.estado === 'entregado');

  async function accept(id: string) {
    const res = await updateOrderStatus(id, 'aceptado');
    if (res.ok) {
      toast.show('Pedido aceptado ✓', 'success');
      reload();
    } else {
      toast.show('No se pudo aceptar', 'error');
    }
  }

  async function reject(id: string) {
    const res = await updateOrderStatus(id, 'cancelado');
    if (res.ok) {
      toast.show('Pedido rechazado', 'info');
      reload();
    }
  }

  return (
    <div className="min-h-full bg-cream-50 flex flex-col">
      <TopBar title="Pedidos" back={false} />

      <div className="bg-white border-b border-ink-100 px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`whitespace-nowrap px-4 py-1.5 rounded-xl text-xs font-bold transition ${tab === t ? 'bg-leaf-500 text-white' : 'bg-cream-100 text-ink-600'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <main className="flex-1 px-4 py-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={24} className="text-leaf-500 animate-spin" />
          </div>
        ) : lista.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-2">📭</p>
            <p className="font-semibold">Sin pedidos en esta sección</p>
          </div>
        ) : (
          lista.map(p => (
            <div key={p.id} className="bg-white rounded-2xl p-4 shadow-soft">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-cream-100 flex items-center justify-center text-3xl">{p.emoji}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">{p.producto}</p>
                  <p className="text-xs text-ink-500">{p.comprador || 'Comprador'} · {p.cantidad} u</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${COLORS[p.estado]}`}>{p.estado.toUpperCase()}</span>
                    <span className="text-[11px] text-ink-400">{p.fecha}</span>
                  </div>
                </div>
                <p className="font-extrabold text-sm text-leaf-600">${p.total.toLocaleString('es-AR')}</p>
              </div>
              {p.estado === 'pendiente' && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-ink-100">
                  <button onClick={() => accept(p.id)} className="flex-1 bg-leaf-500 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1">
                    <Check size={14} /> Aceptar
                  </button>
                  <button onClick={() => toast.show('Mensaje enviado', 'info')} className="w-11 h-10 bg-cream-100 rounded-xl flex items-center justify-center text-ink-600">
                    <MessageCircle size={16} />
                  </button>
                  <button onClick={() => reject(p.id)} className="w-11 h-10 bg-red-50 rounded-xl text-red-500 flex items-center justify-center">
                    <X size={16} />
                  </button>
                </div>
              )}
              {p.estado === 'aceptado' && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-ink-100">
                  <button
                    onClick={async () => {
                      await updateOrderStatus(p.id, 'en camino');
                      toast.show('Marcado en camino', 'success');
                      reload();
                    }}
                    className="flex-1 bg-brand-500 text-white font-bold text-xs py-2.5 rounded-xl"
                  >
                    Marcar en camino
                  </button>
                </div>
              )}
              {p.estado === 'en camino' && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-ink-100">
                  <button
                    onClick={async () => {
                      await updateOrderStatus(p.id, 'entregado');
                      toast.show('Marcado entregado ✓', 'success');
                      reload();
                    }}
                    className="flex-1 bg-leaf-500 text-white font-bold text-xs py-2.5 rounded-xl"
                  >
                    Marcar entregado
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </main>

      <BottomNav />
    </div>
  );
}
