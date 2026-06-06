'use client';

import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { ShoppingBag, Store, ArrowRight, Sparkles } from 'lucide-react';
import Logo from '@/components/Logo';

export default function SplashPage() {
  const router = useRouter();
  const { update } = useStore();

  function elegir(role: 'comprador' | 'vendedor') {
    update({ role });
    router.push('/auth');
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-cream-50 via-white to-cream-100 flex flex-col">
      <div className="px-6 pt-12 pb-8 flex flex-col gap-8 flex-1">
        <div className="animate-fade-in flex items-center justify-between">
          <Logo size={38} />
          <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-3 py-1.5 rounded-full flex items-center gap-1">
            <Sparkles size={12} /> BETA
          </span>
        </div>

        <div className="animate-slide-up">
          <h1 className="font-display font-extrabold text-4xl leading-[1.05] text-ink-900">
            Cocinas que se<br/>
            <span className="bg-gradient-to-r from-brand-500 to-leaf-500 bg-clip-text text-transparent">
              ayudan entre sí.
            </span>
          </h1>
          <p className="text-ink-600 mt-3 text-[15px] leading-relaxed">
            Comprá productos a otros locales o convertí tu cocina en proveedora.
            Todo con IA que aprende lo que tu local necesita.
          </p>
        </div>

        <div className="flex-1 flex items-center justify-center my-2">
          <div className="relative w-64 h-64">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-200 to-leaf-200 rounded-full blur-3xl opacity-60" />
            <div className="absolute inset-4 bg-white rounded-full shadow-soft flex items-center justify-center text-7xl animate-pop">
              🍳
            </div>
            <div className="absolute top-4 -right-2 bg-white rounded-2xl shadow-soft px-3 py-2 text-xs font-semibold animate-fade-in flex items-center gap-1">
              <span>🥖</span> Pan +12
            </div>
            <div className="absolute bottom-6 -left-4 bg-white rounded-2xl shadow-soft px-3 py-2 text-xs font-semibold animate-fade-in flex items-center gap-1">
              <span>🎂</span> 96% match
            </div>
            <div className="absolute bottom-20 right-0 bg-leaf-500 text-white rounded-2xl shadow-soft px-3 py-2 text-xs font-bold animate-fade-in">
              + $24.500
            </div>
          </div>
        </div>

        <div className="space-y-3 pb-2">
          <p className="text-center text-sm font-semibold text-ink-500 mb-2">
            ¿Cómo querés empezar?
          </p>
          <button
            onClick={() => elegir('comprador')}
            className="w-full bg-white border-2 border-ink-100 hover:border-brand-400 active:scale-[0.98] transition rounded-2xl p-4 flex items-center gap-4 text-left shadow-soft"
          >
            <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center text-2xl">
              <ShoppingBag className="text-brand-500" size={26} />
            </div>
            <div className="flex-1">
              <p className="font-display font-extrabold text-ink-900">Quiero comprar</p>
              <p className="text-xs text-ink-500">Productos para mi local</p>
            </div>
            <ArrowRight className="text-ink-400" size={20} />
          </button>

          <button
            onClick={() => elegir('vendedor')}
            className="w-full bg-white border-2 border-ink-100 hover:border-leaf-500 active:scale-[0.98] transition rounded-2xl p-4 flex items-center gap-4 text-left shadow-soft"
          >
            <div className="w-14 h-14 rounded-2xl bg-leaf-50 flex items-center justify-center text-2xl">
              <Store className="text-leaf-600" size={26} />
            </div>
            <div className="flex-1">
              <p className="font-display font-extrabold text-ink-900">Quiero vender</p>
              <p className="text-xs text-ink-500">Mi cocina como proveedora</p>
            </div>
            <ArrowRight className="text-ink-400" size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
