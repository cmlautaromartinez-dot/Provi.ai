'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { useToast } from '@/components/ui/Toast';
import { getSupabase } from '@/lib/supabase/client';
import TopBar from '@/components/layout/TopBar';
import WhatsAppButton from '@/components/WhatsAppButton';
import { Check, MessageCircle, Sparkles, ChevronRight, Phone, Loader2 } from 'lucide-react';

export default function WppConnectPage() {
  const router = useRouter();
  const { update, whatsappConectado, userId } = useStore();
  const toast = useToast();
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(whatsappConectado);
  const [waNumber, setWaNumber] = useState<string | null>(null);

  // (Opcional) podríamos fetchear el número de Kapso desde un endpoint server-side
  // Por ahora pedimos al user que mande "Hola" al número que le pasaron por mail al darse de alta.

  async function confirmar() {
    if (!phone.trim()) {
      toast.show('Ingresá tu número para vincular', 'error');
      return;
    }
    setSaving(true);
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
              Charlá con el mismo bot que está en la app pero desde tu WhatsApp habitual.
            </p>

            <div className="mt-6 bg-cream-100 rounded-2xl p-4">
              <p className="text-xs font-extrabold uppercase tracking-wide text-ink-700 mb-3">Cómo funciona</p>
              <Step n="1" text="Vinculá tu número abajo" />
              <Step n="2" text="Te llega un mensaje de Provi 🤖 al WhatsApp" />
              <Step n="3" text="Charlá igual que con el bot de la app" />
            </div>

            <div className="mt-5 bg-white border-2 border-ink-100 rounded-2xl p-4">
              <p className="text-xs font-extrabold uppercase tracking-wide text-ink-700 mb-2">Vinculá tu número</p>
              <p className="text-[11px] text-ink-500 mb-3">
                Necesitamos saber qué número va a usar Provi para identificarte.
              </p>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+54 9 11 0000 0000"
                className="w-full bg-cream-100 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-400"
                inputMode="tel"
              />
              <button
                onClick={confirmar}
                disabled={saving}
                className="mt-3 w-full bg-leaf-500 active:scale-[0.98] transition rounded-xl py-3 font-bold text-white disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                {saving ? 'Vinculando...' : 'Vincular WhatsApp'}
              </button>
            </div>

            <div className="mt-4">
              <WhatsAppButton message="Hola Provi" label="Abrir WhatsApp y hablar con Provi" />
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
            <h1 className="font-display font-extrabold text-2xl mt-6">¡WhatsApp vinculado!</h1>
            <p className="text-sm text-ink-500 mt-2 max-w-xs">
              Mandale "<b>Hola</b>" a Provi al número que te llega por mensaje y empezá.
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
                💡 Escribí <code className="bg-ink-100 px-1 rounded font-mono">reset</code> para empezar de nuevo.
              </p>
            </div>

            <div className="mt-6 w-full">
              <WhatsAppButton message="Hola Provi" label="Abrir WhatsApp ahora" />
            </div>

            <button onClick={() => router.push('/home')} className="mt-3 w-full bg-cream-100 text-ink-700 font-bold py-3 rounded-2xl flex items-center justify-center gap-2">
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
