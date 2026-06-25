'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { getWaitlistCount } from '@/lib/services/waitlist';
import Logo from '@/components/Logo';
import WaitlistModal from '@/components/ui/WaitlistModal';

export default function LandingPage() {
  const router = useRouter();
  const { update } = useStore();
  const [modal, setModal] = useState<'comprador' | 'vendedor' | null>(null);
  const [count, setCount] = useState(0);
  const [tab, setTab] = useState<'comprador' | 'proveedor'>('comprador');

  useEffect(() => {
    getWaitlistCount().then(setCount);
  }, []);

  function enterApp(role: 'comprador' | 'vendedor') {
    update({ role, userId: 'demo-web', authMethod: 'demo' });
    router.push(role === 'comprador' ? '/home' : '/vendedor');
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#EEECEA' }}>

      {/* ── Navbar ─────────────────────────────────── */}
      <nav className="flex items-center justify-between px-8 md:px-12 py-5">
        <Logo size={36} />

        <div className="hidden md:flex items-center gap-8 text-[15px] font-medium text-ink-700">
          <button onClick={() => setModal('comprador')} className="hover:text-ink-900 transition">Para Compradores</button>
          <button onClick={() => setModal('vendedor')}  className="hover:text-ink-900 transition">Para Vendedores</button>
          <a href="#como-funciona" className="hover:text-ink-900 transition">Cómo funciona</a>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/auth')}
            className="text-[15px] font-semibold text-ink-700 underline underline-offset-2 hover:text-ink-900 transition"
          >
            Ingresar
          </button>
          <button
            onClick={() => setModal('comprador')}
            className="bg-ink-900 text-white text-[14px] font-bold px-5 py-2.5 rounded-full hover:bg-ink-800 active:scale-95 transition"
          >
            Empezar gratis
          </button>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────── */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 md:py-24">
        <h1 className="font-display font-extrabold text-5xl md:text-[4.5rem] lg:text-[5.5rem] text-ink-900 leading-[1.0] max-w-4xl">
          Abastecimiento<br className="hidden md:block" /> Gastronómico con IA
        </h1>

        <p className="text-ink-500 text-[17px] md:text-lg mt-6 max-w-lg leading-relaxed">
          Confiado por 200+ locales en CABA. Primera venta B2B confirmada.<br className="hidden md:block"/>
          Más rápido, más simple, más inteligente.
        </p>

        <button
          onClick={() => setModal('comprador')}
          className="mt-10 bg-ink-900 text-white font-bold text-[16px] px-10 py-4 rounded-full hover:bg-ink-800 active:scale-95 transition shadow-sm"
        >
          Empezar ahora
        </button>

        {/* Contador vivo */}
        {count > 0 && (
          <div className="mt-6 flex flex-col items-center gap-2 w-48">
            <p className="text-sm font-semibold text-ink-600">
              🔥 <span className="font-extrabold text-ink-900">{count}</span> de 100 anotados
            </p>
            <div className="w-full h-1.5 bg-ink-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-500 rounded-full transition-all duration-700"
                style={{ width: `${Math.min((count / 100) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
      </section>

      {/* ── Two cards ──────────────────────────────── */}
      <section className="grid md:grid-cols-2 gap-4 px-4 md:px-6 pb-6">

        {/* Card compradores — naranja */}
        <div className="bg-brand-600 rounded-3xl p-8 md:p-10 text-white min-h-[380px] md:min-h-[440px] flex flex-col justify-between">
          <div>
            <p className="font-display font-extrabold text-3xl md:text-4xl leading-tight">
              Para Compradores
            </p>
            <p className="mt-3 text-white/80 text-[16px] md:text-lg leading-snug">
              Comprá más. Gastá menos.<br/>Recibí más rápido.
            </p>
          </div>
          <div className="flex justify-end mt-8">
            <button
              onClick={() => setModal('comprador')}
              className="bg-white text-brand-600 font-extrabold text-lg md:text-xl px-10 py-5 rounded-full hover:bg-cream-50 active:scale-95 transition shadow-lg"
            >
              Quiero comprar
            </button>
          </div>
        </div>

        {/* Card vendedores — oscuro */}
        <div className="bg-ink-900 rounded-3xl p-8 md:p-10 text-white min-h-[380px] md:min-h-[440px] flex flex-col justify-between">
          <div>
            <p className="font-display font-extrabold text-3xl md:text-4xl leading-tight">
              Para Vendedores
            </p>
            <p className="mt-3 text-white/70 text-[16px] md:text-lg leading-snug">
              Vendé más. Automatizá.<br/>Cobrá más rápido.
            </p>
          </div>
          <div className="flex justify-end mt-8">
            <button
              onClick={() => setModal('vendedor')}
              className="bg-white text-ink-900 font-extrabold text-lg md:text-xl px-10 py-5 rounded-full hover:bg-cream-50 active:scale-95 transition shadow-lg"
            >
              Quiero vender
            </button>
          </div>
        </div>

      </section>

      {/* ── Cómo funciona ──────────────────────────── */}
      <section id="como-funciona" className="px-6 md:px-12 py-16 md:py-20 max-w-5xl mx-auto w-full">
        <h2 className="font-display font-extrabold text-3xl md:text-4xl text-ink-900 text-center mb-3">
          ¿Cómo funciona?
        </h2>
        <p className="text-ink-500 text-center text-[15px] mb-8 max-w-md mx-auto">
          Simple para los dos lados del mostrador.
        </p>

        {/* Tab switcher */}
        <div className="flex justify-center mb-10">
          <div className="bg-white rounded-full p-1 flex gap-1 shadow-card border border-cream-200">
            <button
              onClick={() => setTab('comprador')}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition ${tab === 'comprador' ? 'bg-brand-500 text-white shadow-sm' : 'text-ink-600 hover:text-ink-900'}`}
            >
              🛒 Soy comprador
            </button>
            <button
              onClick={() => setTab('proveedor')}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition ${tab === 'proveedor' ? 'bg-ink-900 text-white shadow-sm' : 'text-ink-600 hover:text-ink-900'}`}
            >
              🍳 Soy proveedor
            </button>
          </div>
        </div>

        {/* Steps */}
        {tab === 'comprador' ? (
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { n: '01', emoji: '📋', title: 'Registrá tu local', desc: 'Cuenta en 2 minutos. Tu zona, tu tipo de local y listo.' },
              { n: '02', emoji: '🎯', title: 'Provi te recomienda', desc: 'IA que aprende qué necesitás y cuándo, según tu historial.' },
              { n: '03', emoji: '🛒', title: 'Pedí en segundos', desc: 'Elegí, confirmás por app o WhatsApp, el proveedor lo prepara.' },
              { n: '04', emoji: '🔒', title: 'Pago protegido', desc: 'El dinero queda retenido hasta que vos confirmás que recibiste todo bien. Si hay problema, te devolvemos.', highlight: true },
            ].map(step => (
              <div key={step.n} className={`rounded-3xl p-6 flex flex-col gap-3 ${step.highlight ? 'bg-leaf-500 text-white' : 'bg-white shadow-card border border-cream-200'}`}>
                <div className="flex items-center gap-2">
                  <span className={`font-display font-extrabold text-3xl ${step.highlight ? 'text-white/30' : 'text-brand-100'}`}>{step.n}</span>
                  <span className="text-2xl">{step.emoji}</span>
                </div>
                <div>
                  <p className={`font-display font-extrabold text-base mb-1 ${step.highlight ? 'text-white' : 'text-ink-900'}`}>{step.title}</p>
                  <p className={`text-xs leading-relaxed ${step.highlight ? 'text-white/80' : 'text-ink-500'}`}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { n: '01', emoji: '📦', title: 'Publicá tus productos', desc: 'Fotos, precio, stock y zona de entrega. Tardás 5 minutos.' },
              { n: '02', emoji: '📱', title: 'Recibís pedidos', desc: 'Notificación por WhatsApp al instante. Aceptás o rechazás en un toque.' },
              { n: '03', emoji: '🚚', title: 'Hacés la entrega', desc: 'El comprador confirma que recibió todo. Coordinás vos la entrega.' },
              { n: '04', emoji: '🔒', title: 'Cobrás garantizado', desc: 'El dinero ya está retenido desde el pedido. A los 7 días se libera automáticamente a tu cuenta.', highlight: true },
            ].map(step => (
              <div key={step.n} className={`rounded-3xl p-6 flex flex-col gap-3 ${step.highlight ? 'bg-leaf-500 text-white' : 'bg-white shadow-card border border-cream-200'}`}>
                <div className="flex items-center gap-2">
                  <span className={`font-display font-extrabold text-3xl ${step.highlight ? 'text-white/30' : 'text-ink-200'}`}>{step.n}</span>
                  <span className="text-2xl">{step.emoji}</span>
                </div>
                <div>
                  <p className={`font-display font-extrabold text-base mb-1 ${step.highlight ? 'text-white' : 'text-ink-900'}`}>{step.title}</p>
                  <p className={`text-xs leading-relaxed ${step.highlight ? 'text-white/80' : 'text-ink-500'}`}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Trust badge pago protegido */}
        <div className="mt-6 bg-leaf-50 border border-leaf-200 rounded-2xl px-6 py-4 flex items-center gap-4 max-w-xl mx-auto">
          <span className="text-2xl">🛡️</span>
          <div>
            <p className="font-bold text-sm text-leaf-800">Pago 100% protegido con escrow</p>
            <p className="text-xs text-leaf-700">El dinero nunca le llega al proveedor hasta que vos confirmás la entrega. Cero riesgo.</p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => setModal(tab === 'comprador' ? 'comprador' : 'vendedor')}
            className="bg-brand-500 text-white font-bold text-[15px] px-8 py-4 rounded-full hover:bg-brand-600 active:scale-95 transition shadow-pop"
          >
            {tab === 'comprador' ? 'Quiero comprar con provi' : 'Quiero vender con provi'}
          </button>
        </div>
      </section>

      {/* ── Roadmap ────────────────────────────────── */}
      <section className="px-6 md:px-12 pb-16 max-w-5xl mx-auto w-full">
        <div className="border-t border-ink-200 pt-12">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-brand-100 text-brand-700 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wide">Roadmap</span>
            <span className="text-xs text-ink-400">Lo que viene en provi</span>
          </div>
          <h3 className="font-display font-extrabold text-2xl md:text-3xl text-ink-900 mb-8">
            Estamos recién arrancando. 🚀
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-3xl p-6 border border-cream-200 shadow-card flex gap-4 items-start opacity-80">
              <div className="w-12 h-12 rounded-2xl bg-brand-100 flex items-center justify-center text-2xl flex-shrink-0">🚚</div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-display font-extrabold text-base text-ink-900">Envíos a cargo de provi</p>
                  <span className="bg-ink-100 text-ink-500 text-[10px] font-bold px-2 py-0.5 rounded-full">Próximamente</span>
                </div>
                <p className="text-xs text-ink-500 leading-relaxed">
                  Hoy coordinás la entrega con el proveedor. En el futuro, provi se encarga de toda la logística — recogemos del proveedor y lo llevamos a tu puerta.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-cream-200 shadow-card flex gap-4 items-start opacity-80">
              <div className="w-12 h-12 rounded-2xl bg-leaf-100 flex items-center justify-center text-2xl flex-shrink-0">💳</div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-display font-extrabold text-base text-ink-900">Crédito para compradores</p>
                  <span className="bg-ink-100 text-ink-500 text-[10px] font-bold px-2 py-0.5 rounded-full">Próximamente</span>
                </div>
                <p className="text-xs text-ink-500 leading-relaxed">
                  Comprá hoy y pagá en cuotas sin interés. Línea de crédito automática basada en tu historial de compras en provi. Sin bancos, sin papeleo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Avales institucionales ─────────────────── */}
      <section className="px-6 py-10 flex flex-col items-center gap-4">
        <p className="text-xs font-semibold text-ink-400 uppercase tracking-widest">Avalado por</p>
        <img
          src="/avales-udesa.png"
          alt="Centro de Entrepreneurship UdeSA · Escuela de Negocios Universidad de San Andrés"
          className="h-10 md:h-12 w-auto object-contain opacity-80"
        />
      </section>

      {/* ── Footer mínimo ──────────────────────────── */}
      <footer className="text-center py-4 text-[12px] text-ink-400">
        provi.AI · 5% comisión por transacción · sin costo fijo · Hackathon Y-Hat 2026
      </footer>

      {/* ── Modal waitlist ─────────────────────────── */}
      {modal && (
        <WaitlistModal
          role={modal}
          onClose={() => setModal(null)}
          onDemo={() => { setModal(null); enterApp(modal); }}
        />
      )}
    </div>
  );
}
