'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { listOrdersForSeller, updateOrderStatus, sellerStats } from '@/lib/orders';
import { Pedido } from '@/types';
import { RECOMENDACIONES_IA } from '@/lib/mock';
import BottomNav from '@/components/BottomNav';
import Link from 'next/link';
import { useToast } from '@/components/Toast';
import { Bell, TrendingUp, Package, DollarSign, Star, Sparkles, ChevronRight } from 'lucide-react';

export default function VendedorDashboard() {
  const { nombreLocal, userId } = useStore();
  const toast = useToast();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [stats, setStats] = useState({ ventasHoy: 0, pedidosTotales: 0, pendientes: 0, facturadoMes: 0 });
  const [loading, setLoading] = useState(true);

  async function reload() {
    if (!userId) { setLoading(false); return; }
    const [p, s] = await Promise.all([listOrdersForSeller(userId), sellerStats(userId)]);
    setPedidos(p);
    setStats(s);
    setLoading(false);
  }

  useEffect(() => { reload(); /* eslint-disable-next-line */ }, [userId]);

  const pendientes = pedidos.filter(p => p.estado === 'pendiente');

  async function accept(id: string) {
    const res = await updateOrderStatus(id, 'aceptado');
    if (res.ok) { toast.show('Pedido aceptado ✓', 'success'); reload(); }
  }
  async function reject(id: string) {
    const res = await updateOrderStatus(id, 'cancelado');
    if (res.ok) { toast.show('Pedido rechazado', 'info'); reload(); }
  }

  return (
    <div className="min-h-full bg-cream-50 flex flex-col">
      <header className="sticky top-0 z-30 bg-gradient-to-br from-leaf-500 to-leaf-700 text-white px-5 pt-5 pb-6 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-white/80">Buenas! 👋</p>
            <p className="font-display font-extrabold text-lg">{nombreLocal || 'Mi Cocina'}</p>
          </div>
          <Link href="/vendedor/pedidos" className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center relative">
            <Bell size={18} />
            {pendientes.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-500 text-[10px] font-extrabold rounded-full flex items-center justify-center">{pendientes.length}</span>}
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Stat icon={DollarSign} label="Ventas hoy" value={`$${Math.round(stats.ventasHoy / 1000)}k`} />
          <Stat icon={Package} label="Pedidos" value={String(stats.pedidosTotales)} />
          <Stat icon={Star} label="Rating" value="4.9" />
        </div>
      </header>

      <main className="flex-1 px-5 pt-6 pb-6 space-y-6">
        <Link href="/vendedor/publicar" className="block bg-gradient-to-br from-brand-500 to-brand-600 text-white rounded-3xl p-5 shadow-pop active:scale-[0.98] transition">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-3xl">➕</div>
            <div className="flex-1">
              <p className="font-display font-extrabold text-lg">Publicar nuevo producto</p>
              <p className="text-xs text-white/85">Llegá a +200 locales en tu zona</p>
            </div>
            <ChevronRight size={22} />
          </div>
        </Link>

        {loading ? (
          <div className="space-y-2.5 animate-pulse">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border-l-4 border-cream-200 flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-cream-200 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-cream-200 rounded-full w-2/3" />
                  <div className="h-3 bg-cream-200 rounded-full w-1/2" />
                  <div className="h-3 bg-cream-200 rounded-full w-1/3" />
                </div>
                <div className="space-y-2">
                  <div className="h-7 w-16 bg-cream-200 rounded-lg" />
                  <div className="h-7 w-16 bg-cream-200 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : pendientes.length > 0 ? (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-extrabold text-lg">⏰ Pedidos pendientes</h2>
              <Link href="/vendedor/pedidos" className="text-xs font-semibold text-leaf-600">Ver todos</Link>
            </div>
            <div className="space-y-2.5">
              {pendientes.slice(0, 3).map(p => (
                <div key={p.id} className="bg-white rounded-2xl p-4 shadow-soft border-l-4 border-brand-500 flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-cream-100 flex items-center justify-center text-3xl">{p.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{p.producto}</p>
                    <p className="text-xs text-ink-500 truncate">{p.comprador || 'Comprador'} · {p.cantidad} u</p>
                    <p className="text-[11px] text-brand-600 font-semibold mt-0.5">{p.fecha}</p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <button onClick={() => accept(p.id)} className="bg-leaf-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg">Aceptar</button>
                    <button onClick={() => reject(p.id)} className="bg-cream-100 text-ink-600 text-[11px] font-semibold px-3 py-1.5 rounded-lg">Rechazar</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section>
          <h2 className="font-display font-extrabold text-lg mb-3 flex items-center gap-2">
            <TrendingUp size={18} className="text-leaf-500" /> Tus ventas
          </h2>
          <div className="bg-white rounded-2xl shadow-soft p-4">
            <div className="flex items-end justify-between gap-2 h-32">
              {[40, 60, 35, 80, 55, 92, 75].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-gradient-to-t from-leaf-500 to-leaf-300 rounded-t-lg" style={{ height: `${h}%` }} />
                  <span className="text-[10px] text-ink-400">{['L','M','M','J','V','S','D'][i]}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-ink-100">
              <div>
                <p className="text-xs text-ink-500">Facturado mes</p>
                <p className="font-extrabold text-ink-900">${stats.facturadoMes.toLocaleString('es-AR')}</p>
              </div>
              <span className="bg-leaf-100 text-leaf-700 text-xs font-bold px-3 py-1 rounded-full">↑ +18%</span>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-display font-extrabold text-lg mb-3 flex items-center gap-2">
            <Sparkles size={18} className="text-brand-500" /> Provi te recomienda producir
          </h2>
          <div className="space-y-2">
            {RECOMENDACIONES_IA.map(r => (
              <div key={r.tag} className="bg-white rounded-2xl shadow-soft p-3 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-2xl">{r.emoji}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">{r.tag}</p>
                  <p className="text-[11px] text-ink-500">{r.motivo}</p>
                </div>
                <button onClick={() => toast.show('Próximamente', 'info')} className="bg-brand-100 text-brand-700 text-[11px] font-bold px-3 py-1.5 rounded-lg">
                  Sumar
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}

function Stat({ icon: Icon, label, value }: any) {
  return (
    <div className="bg-white/15 backdrop-blur rounded-2xl p-3 text-center">
      <Icon size={16} className="mx-auto opacity-80" />
      <p className="font-extrabold text-base mt-1">{value}</p>
      <p className="text-[10px] text-white/80">{label}</p>
    </div>
  );
}
