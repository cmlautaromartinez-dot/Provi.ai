'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { getSupabase } from '@/lib/supabase';
import TopBar from '@/components/TopBar';
import { Check, MessageCircle, Sparkles, ChevronRight, Copy, Phone } from 'lucide-react';

// Twilio Sandbox info — el número y el código los configurás vos
// en https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
const SANDBOX_NUMBER = process.env.NEXT_PUBLIC_TWILIO_WHATSAPP_NUMBER || '+1 415 523 8886';
const SANDBOX_CODE = process.env.NEXT_PUBLIC_TWILIO_SANDBOX_CODE || 'join <tu-código>';

export default function WppConnectPage() {
  const router = useRouter();
  const { update, whatsappConectado, userId } = useStore();
  const toast = useToast();
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(whatsappConectado);

  function copy(text: string, label: string) {
    navigator.clipboard.writeText(text);
    toast.show(`${label} copiado ✓`, 'success');
  }

  async function confirmar() {
    if (!phone.trim()) {
      toast.show('Ingresá tu número para vincular', 'error');
      return;
    }
    setSaving(true);

    // Normalizar: solo dígitos con + adelante
    const clean = phone.replace(/[^\d+]/g, '');
    const normalized = clean.startsWith('+') ? clean : `+${clean}`;

    const supabase = getSupabase();
    if (supabase && userId) {
      await supabase
        .from('profiles')
        .update({ telefono: normalized, whatsapp_conectado: true })
        .eq('id', userId);
    }
    update({ whatsappConectado: true });
    toast.show('WhatsApp vinculado ✓', 'success');
    setDone(true);
    setSaving(false);
  }

  const waLink = `https://wa.me/${SANDBOX_NUMBER.replace(/[^\d]/g, '')}?text=${encodeURIComponent(SANDBOX_CODE)}`;

  return (
    <div className="min-h-full bg-white flex flex-col">
      <TopBar title="Provi por WhatsApp" />

      <main className="flex-1 px-6 pt-4 pb-6">
        {!done ? (
          <>
            <div className="flex items-center justify-center my-4">
              <div className="relative">
                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-leaf-400 to-leaf-600 shadow-pop flex items-center justify-center text-7xl">
                  💬
                </div>
                <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl bg-white shadow-soft flex items-center justify-center text-2xl border-4 border-white">
                  🤖
                </div>
              </div>
            </div>

            <h1 className="font-display font-extrabold text-2xl text-center text-ink-900">
              Pedile a Provi por WhatsApp
            </h1>
            <p className="text-sm text-ink-500 text-center mt-2">
              Mandá audios o textos como si hablaras con un amigo y Provi te trae proveedores al toque.
            </p>

            <div className="mt-6 bg-cream-100 rounded-2xl p-4">
              <p className="text-xs font-extrabold uppercase tracking-wide text-ink-700 mb-3">Cómo conectarte</p>

              <Step n="1" text="Guardá este número en tus contactos" />
              <button
                onClick={() => copy(SANDBOX_NUMBER, 'Número')}
                className="mt-2 mb-3 w-full bg-white rounded-xl p-3 flex items-center gap-3 active:scale-[0.98] transition border border-ink-200"
              >
                <Phone size={18} className="text-leaf-600" />
                <span className="font-bold text-sm flex-1 text-left">{SANDBOX_NUMBER}</span>
                <Copy size={16} className="text-ink-400" />
              </button>

              <Step n="2" text="Mandale este mensaje para activarte" />
              <button
                onClick={() => copy(SANDBOX_CODE, 'Código')}
                className="mt-2 mb-3 w-full bg-white rounded-xl p-3 flex items-center gap-3 active:scale-[0.98] transition border border-ink-200"
              >
                <MessageCircle size={18} className="text-leaf-600" />
                <span className="font-bold text-sm flex-1 text-left font-mono">{SANDBOX_CODE}</span>
                <Copy size={16} className="text-ink-400" />
              </button>

              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-leaf-500 text-white text-center font-bold py-3 rounded-xl active:scale-[0.98] transition"
              >
                Abrir WhatsApp y unirse
              </a>
            </div>

            <div className="mt-5 bg-white border-2 border-ink-100 rounded-2xl p-4">
              <p className="text-xs font-extrabold uppercase tracking-wide text-ink-700 mb-2">Vinculá tu número</p>
              <p className="text-[11px] text-ink-500 mb-3">Para que Provi sepa quién sos cuando le escribís.</p>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+54 9 11 0000 0000"
                className="w-full bg-cream-100 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-400"
              />
              <button
                onClick={confirmar}
                disabled={saving}
                className="mt-3 w-full bg-leaf-500 active:scale-[0.98] transition rounded-xl py-3 font-bold text-white disabled:opacity-70"
              >
                {saving ? 'Guardando...' : 'Confirmar vinculación'}
              </button>
            </div>

            <button onClick={() => router.back()} className="w-full mt-3 py-3 text-ink-500 font-semibold text-sm">
              Más tarde
            </button>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center text-center pt-4 animate-fade-in">
            <div className="w-24 h-24 rounded-full bg-leaf-100 flex items-center justify-center animate-pop">
              <div className="w-16 h-16 rounded-full bg-leaf-500 flex items-center justify-center">
                <Check size={36} className="text-white" strokeWidth={3} />
              </div>
            </div>
            <h1 className="font-display font-extrabold text-2xl mt-6">¡WhatsApp conectado!</h1>
            <p className="text-sm text-ink-500 mt-2 max-w-xs">
              Mandale a Provi al <b className="text-ink-900 break-all">{SANDBOX_NUMBER}</b> lo que necesites.
            </p>

            <div className="mt-6 bg-cream-100 rounded-2xl p-4 w-full text-left">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={14} className="text-brand-500" />
                <p className="text-xs font-extrabold text-ink-700 uppercase tracking-wide">Probá decirle</p>
              </div>
              <div className="space-y-2">
                {[
                  '"Necesito 30 medialunas para mañana, presupuesto $15.000"',
                  '"Mandame proveedores de tortas sin TACC cerca"',
                  '"Quiero brownies veganos, 20 unidades para el viernes"',
                ].map((s) => (
                  <div key={s} className="bg-white rounded-xl px-3 py-2 text-xs italic text-ink-600">
                    {s}
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-ink-400 mt-3">
                💡 Escribí <code className="bg-ink-100 px-1 rounded font-mono">reset</code> en cualquier momento para empezar de nuevo.
              </p>
            </div>

            <button onClick={() => router.push('/home')} className="mt-auto w-full bg-brand-500 text-white font-bold py-4 rounded-2xl shadow-pop flex items-center justify-center gap-2">
              Volver al inicio <ChevronRight size={18} />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function Step({ n, text }: { n: string; text: string }) {
  return (
    <div className="flex items-center gap-3 mb-1">
      <span className="w-6 h-6 rounded-full bg-leaf-500 text-white text-xs font-extrabold flex items-center justify-center flex-shrink-0">{n}</span>
      <p className="text-sm font-semibold text-ink-700">{text}</p>
    </div>
  );
}
