'use client';

import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { ShoppingBag, Store, ArrowRight, CheckCircle2 } from 'lucide-react';
import Logo from '@/components/Logo';

const STATS = [
  { value: '200+', label: 'locales en CABA' },
  { value: '1k+',  label: 'productos activos' },
  { value: '0%',   label: 'costo fijo' },
];

export default function SplashPage() {
  const router = useRouter();
  const { update } = useStore();

  function elegir(role: 'comprador' | 'vendedor') {
    update({ role });
    router.push('/auth');
  }

  return (
    <div className="min-h-full bg-white flex flex-col">

      {/* ── Nav bar ───────────────────────────────── */}
      <header className="px-6 pt-10 pb-2 flex items-center justify-between animate-fade-in">
        <Logo size={36} />
        <span className="text-[11px] font-bold text-brand-600 bg-brand-50 border border-brand-100 px-3 py-1 rounded-full tracking-wide">
          BETA
        </span>
      </header>

      {/* ── Hero ──────────────────────────────────── */}
      <div className="px-6 pt-6 animate-slide-up">
        <p className="text-xs font-semibold text-brand-500 uppercase tracking-widest mb-2">
          Abastecimiento gastronómico B2B
        </p>
        <h1 className="font-display font-extrabold text-[2.1rem] leading-[1.08] text-ink-900">
          Locales que se<br />
          <span className="text-brand-500">abastecen entre sí.</span>
        </h1>
        <p className="text-ink-500 mt-3 text-[15px] leading-relaxed">
          Comprá a cocinas cercanas o convertí tu local en proveedor.
          IA que aprende lo que tu negocio necesita.
        </p>
      </div>

      {/* ── Stats row (kaso-style) ─────────────────── */}
      <div className="mx-6 mt-6 grid grid-cols-3 gap-2 animate-fade-in">
        {STATS.map((s) => (
          <div key={s.label} className="bg-cream-50 border border-cream-200 rounded-2xl p-3 text-center">
            <p className="font-display font-extrabold text-xl text-ink-900">{s.value}</p>
            <p className="text-[10px] text-ink-500 mt-0.5 leading-tight">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Social proof card (kaso-style feature preview) */}
      <div className="mx-6 mt-5 rounded-3xl border border-ink-200 overflow-hidden animate-fade-in">
        <div className="bg-gradient-to-br from-brand-600 to-brand-800 p-4">
          <p className="text-[11px] font-bold text-white/70 uppercase tracking-wide mb-1">Primer match real</p>
          <p className="font-display font-extrabold text-white text-base leading-snug">
            200 postres/semana entre locales de Palermo
          </p>
        </div>
        <div className="bg-white px-4 py-3 space-y-2">
          {[
            'Matching inteligente por IA',
            'Precio acordado sin intermediarios',
            'Pedido y pago en un solo lugar',
          ].map((f) => (
            <div key={f} className="flex items-center gap-2 text-[13px] text-ink-700">
              <CheckCircle2 size={14} className="text-brand-500 flex-shrink-0" />
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* ── Role selection ────────────────────────── */}
      <div className="px-6 pt-6 pb-8 space-y-3 mt-auto animate-slide-up">
        <p className="text-center text-[13px] font-semibold text-ink-500 mb-1">
          ¿Cómo querés empezar?
        </p>

        <button
          onClick={() => elegir('comprador')}
          className="w-full bg-brand-500 active:scale-[0.98] transition rounded-2xl p-4 flex items-center gap-4 text-left shadow-pop"
        >
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <ShoppingBag className="text-white" size={22} />
          </div>
          <div className="flex-1">
            <p className="font-display font-extrabold text-white text-[15px]">Quiero comprar</p>
            <p className="text-[12px] text-white/80">Productos para mi local</p>
          </div>
          <ArrowRight className="text-white/70" size={18} />
        </button>

        <button
          onClick={() => elegir('vendedor')}
          className="w-full bg-white border-2 border-ink-200 hover:border-leaf-500 active:scale-[0.98] transition rounded-2xl p-4 flex items-center gap-4 text-left shadow-card"
        >
          <div className="w-12 h-12 rounded-xl bg-leaf-50 flex items-center justify-center">
            <Store className="text-leaf-600" size={22} />
          </div>
          <div className="flex-1">
            <p className="font-display font-extrabold text-ink-900 text-[15px]">Quiero vender</p>
            <p className="text-[12px] text-ink-500">Mi cocina como proveedora</p>
          </div>
          <ArrowRight className="text-ink-400" size={18} />
        </button>

        <p className="text-center text-[11px] text-ink-400 pt-2">
          5% comisión solo por transacción completada · sin suscripción
        </p>
      </div>
    </div>
  );
}
