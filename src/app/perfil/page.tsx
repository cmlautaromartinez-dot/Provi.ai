'use client';

import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import BottomNav from '@/components/BottomNav';
import TopBar from '@/components/TopBar';
import { ChevronRight, MessageCircle, MapPin, Bell, Star, HelpCircle, Settings, LogOut, Sparkles, Store } from 'lucide-react';
import { useToast } from '@/components/Toast';

export default function PerfilPage() {
  const router = useRouter();
  const { nombreLocal, reset, role, update } = useStore();
  const toast = useToast();

  function switchRole() {
    const next = role === 'comprador' ? 'vendedor' : 'comprador';
    update({ role: next });
    toast.show(`Cambiaste a modo ${next}`, 'info');
    setTimeout(() => router.push(next === 'vendedor' ? '/vendedor' : '/home'), 300);
  }

  function logout() {
    reset();
    router.push('/');
  }

  return (
    <div className="min-h-full bg-cream-50 flex flex-col">
      <TopBar title="Mi perfil" back={false} />
      <main className="flex-1 px-4 py-4 space-y-4">
        <div className="bg-white rounded-3xl p-5 shadow-soft text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 mx-auto flex items-center justify-center text-3xl text-white font-extrabold shadow-pop">
            {(nombreLocal || 'M')[0]}
          </div>
          <p className="font-display font-extrabold text-xl mt-3">{nombreLocal || 'Mi Local'}</p>
          <p className="text-xs text-ink-500">Cuenta {role === 'vendedor' ? 'proveedor' : 'comprador'} · Buenos Aires</p>
          <div className="flex justify-center gap-4 mt-4 pt-4 border-t border-ink-100">
            <Stat n="12" l="Pedidos" />
            <Stat n="4.8" l="Rating" star />
            <Stat n="$84k" l="Ahorrado" />
          </div>
        </div>

        <button onClick={switchRole} className="w-full bg-gradient-to-br from-leaf-500 to-leaf-600 text-white rounded-2xl p-4 flex items-center gap-3 active:scale-[0.98] transition shadow-soft">
          <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
            {role === 'vendedor' ? <Sparkles size={20} /> : <Store size={20} />}
          </div>
          <div className="flex-1 text-left">
            <p className="font-bold text-sm">{role === 'vendedor' ? 'Modo comprador' : 'Convertite en proveedor'}</p>
            <p className="text-[11px] text-white/80">{role === 'vendedor' ? 'Volvé a comprar productos' : 'Vendé lo que producís en tu cocina'}</p>
          </div>
          <ChevronRight size={18} />
        </button>

        <div className="bg-white rounded-2xl shadow-soft divide-y divide-ink-100">
          <Row icon={MapPin} label="Mi local" sub={nombreLocal || 'Sin nombre'} />
          <Row icon={MessageCircle} label="Conectá WhatsApp" sub="Pedile a Provi por chat" badge="Nuevo" onClick={() => router.push('/provibot/wpp')} />
          <Row icon={Bell} label="Notificaciones" sub="Configurar alertas" />
          <Row icon={Star} label="Calificaciones recibidas" sub="4.8 · 24 reviews" />
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

function Stat({ n, l, star }: { n: string; l: string; star?: boolean }) {
  return (
    <div className="flex-1">
      <p className="font-extrabold text-ink-900 flex items-center justify-center gap-1">
        {star && <Star size={14} className="text-amber-500 fill-amber-500" />}{n}
      </p>
      <p className="text-[11px] text-ink-500">{l}</p>
    </div>
  );
}

function Row({ icon: Icon, label, sub, badge, danger, onClick }: any) {
  return (
    <button onClick={onClick} className="w-full px-4 py-3.5 flex items-center gap-3 active:bg-ink-50 transition text-left">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${danger ? 'bg-red-50 text-red-500' : 'bg-cream-100 text-brand-500'}`}>
        <Icon size={17} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold ${danger ? 'text-red-500' : 'text-ink-900'}`}>{label}</p>
        {sub && <p className="text-[11px] text-ink-500 truncate">{sub}</p>}
      </div>
      {badge && <span className="bg-brand-100 text-brand-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full">{badge}</span>}
      <ChevronRight size={16} className="text-ink-300" />
    </button>
  );
}
