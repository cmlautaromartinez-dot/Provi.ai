'use client';

import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import BottomNav from '@/components/layout/BottomNav';
import TopBar from '@/components/layout/TopBar';
import { useToast } from '@/components/ui/Toast';
import { ChevronRight, MapPin, Bell, Star, HelpCircle, Settings, LogOut, ShoppingBag, BarChart3, BadgeCheck } from 'lucide-react';

export default function VendedorPerfilPage() {
  const router = useRouter();
  const { nombreLocal, reset, update } = useStore();
  const toast = useToast();

  function switchRole() {
    update({ role: 'comprador' });
    toast.show('Cambiaste a modo comprador', 'info');
    setTimeout(() => router.push('/home'), 300);
  }

  function logout() {
    reset();
    router.push('/');
  }

  return (
    <div className="min-h-full bg-cream-50 flex flex-col">
      <TopBar title="Mi cocina" back={false} />
      <main className="flex-1 px-4 py-4 space-y-4">
        <div className="bg-white rounded-3xl p-5 shadow-soft text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-leaf-400 to-leaf-600 mx-auto flex items-center justify-center text-3xl text-white font-extrabold shadow-soft">
            {(nombreLocal || 'C')[0]}
          </div>
          <p className="font-display font-extrabold text-xl mt-3 flex items-center justify-center gap-1">
            {nombreLocal || 'Mi Cocina'}
            <BadgeCheck size={18} className="text-leaf-500" />
          </p>
          <p className="text-xs text-ink-500">Proveedor verificado · Buenos Aires</p>
          <div className="flex justify-center gap-4 mt-4 pt-4 border-t border-ink-100">
            <Stat n="48" l="Ventas mes" />
            <Stat n="4.9" l="Rating" star />
            <Stat n="$284k" l="Facturado" />
          </div>
        </div>

        <button onClick={switchRole} className="w-full bg-gradient-to-br from-brand-500 to-brand-600 text-white rounded-2xl p-4 flex items-center gap-3 active:scale-[0.98] transition shadow-soft">
          <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
            <ShoppingBag size={20} />
          </div>
          <div className="flex-1 text-left">
            <p className="font-bold text-sm">Modo comprador</p>
            <p className="text-[11px] text-white/85">Buscá productos de otros locales</p>
          </div>
          <ChevronRight size={18} />
        </button>

        <div className="bg-white rounded-2xl shadow-soft divide-y divide-ink-100">
          <Row icon={MapPin} label="Datos de mi cocina" sub={nombreLocal} />
          <Row icon={BarChart3} label="Reportes y métricas" sub="Ventas, vistas, conversión" />
          <Row icon={Bell} label="Notificaciones" sub="Pedidos, mensajes" />
          <Row icon={Star} label="Reviews recibidas" sub="4.9 · 87 reviews" />
        </div>

        <div className="bg-white rounded-2xl shadow-soft divide-y divide-ink-100">
          <Row icon={HelpCircle} label="Ayuda" />
          <Row icon={Settings} label="Configuración" />
          <Row icon={LogOut} label="Cerrar sesión" danger onClick={logout} />
        </div>
        <p className="text-[10px] text-center text-ink-400 pt-2">provi AI · v0.1.0 BETA</p>
      </main>
      <BottomNav />
    </div>
  );
}

function Stat({ n, l, star }: any) {
  return (
    <div className="flex-1">
      <p className="font-extrabold text-ink-900 flex items-center justify-center gap-1">
        {star && <Star size={14} className="text-amber-500 fill-amber-500" />}{n}
      </p>
      <p className="text-[11px] text-ink-500">{l}</p>
    </div>
  );
}

function Row({ icon: Icon, label, sub, danger, onClick }: any) {
  return (
    <button onClick={onClick} className="w-full px-4 py-3.5 flex items-center gap-3 active:bg-ink-50 transition text-left">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${danger ? 'bg-red-50 text-red-500' : 'bg-cream-100 text-leaf-600'}`}>
        <Icon size={17} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold ${danger ? 'text-red-500' : 'text-ink-900'}`}>{label}</p>
        {sub && <p className="text-[11px] text-ink-500 truncate">{sub}</p>}
      </div>
      <ChevronRight size={16} className="text-ink-300" />
    </button>
  );
}
