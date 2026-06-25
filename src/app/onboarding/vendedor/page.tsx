'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { getSupabase } from '@/lib/supabase/client';
import WizardShell from '@/components/layout/WizardShell';
import Chip from '@/components/ui/Chip';
import RecordButton from '@/components/RecordButton';
import PhotoButton from '@/components/PhotoButton';
import { useToast } from '@/components/ui/Toast';

const VENDIENDO_HOY = [
  { label: 'Café y bebidas', emoji: '☕' },
  { label: 'Pastelería', emoji: '🧁' },
  { label: 'Panadería', emoji: '🥖' },
  { label: 'Viandas', emoji: '🍱' },
  { label: 'Heladería', emoji: '🍦' },
  { label: 'Comida lista', emoji: '🍽️' },
];

const QUE_VENDER = [
  { label: 'A locales gastronómicos', emoji: '🏪' },
  { label: 'Producción mayorista', emoji: '🏭' },
  { label: 'Catering eventos', emoji: '🎉' },
  { label: 'Suscripciones semanales', emoji: '📦' },
];

const TRASLADO = [
  { label: 'Yo entrego', emoji: '🚚' },
  { label: 'El comprador retira', emoji: '🛍️' },
  { label: 'Tercero / app', emoji: '🛵' },
];

const SERVIR = [
  { label: 'Listo para consumir', emoji: '🍴' },
  { label: 'Refrigerado', emoji: '❄️' },
  { label: 'Congelado', emoji: '🧊' },
  { label: 'Para hornear', emoji: '♨️' },
  { label: 'Para preparar', emoji: '🥣' },
];

export default function OnboardingVendedorPage() {
  const router = useRouter();
  const { update, userId } = useStore();
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [nombre, setNombre] = useState('');
  const [capacidad, setCapacidad] = useState(50);
  const [vendiendo, setVendiendo] = useState<string[]>([]);
  const [quiero, setQuiero] = useState<string[]>([]);
  const [traslado, setTraslado] = useState<string[]>([]);
  const [servir, setServir] = useState<string[]>([]);
  const [duracion, setDuracion] = useState('');
  const [conservacion, setConservacion] = useState('');
  const [instrucciones, setInstrucciones] = useState('');
  const [saving, setSaving] = useState(false);

  function toggle<T>(arr: T[], item: T, setter: (a: T[]) => void) {
    setter(arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item]);
  }

  async function persistAndFinish() {
    setSaving(true);
    const supabase = getSupabase();
    if (supabase && userId) {
      await supabase.from('profiles').update({
        nombre_local: nombre || 'Mi Cocina',
        onboarding_done: true,
      }).eq('id', userId);

      await supabase.from('seller_profile').upsert({
        id: userId,
        capacidad_diaria: capacidad,
        vendiendo_hoy: vendiendo,
        quiero_vender: quiero,
        traslado,
        servir,
        duracion: duracion || null,
        conservacion: conservacion || null,
        instrucciones: instrucciones || null,
      }, { onConflict: 'id' });
    }
    update({ nombreLocal: nombre || 'Mi Cocina', onboardingVendedorDone: true });
    toast.show('¡Listo proveedor! 🚀', 'success');
    setTimeout(() => router.push('/vendedor'), 400);
  }

  function next() {
    if (step < 6) setStep(step + 1);
    else persistAndFinish();
  }
  function skip() { persistAndFinish(); }

  return (
    <WizardShell
      step={step}
      total={6}
      title={titulos[step - 1]}
      subtitle={subtitulos[step - 1]}
      onBack={step === 1 ? undefined : () => setStep(step - 1)}
      onNext={next}
      onSkip={skip}
      nextLabel={step === 6 ? (saving ? 'Guardando...' : 'Activar mi cocina') : 'Siguiente'}
      accent="vendedor"
    >
      {step === 1 && (
        <>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Hornero del Barrio"
            className="w-full bg-cream-100 rounded-2xl px-4 py-4 font-medium focus:outline-none focus:ring-2 focus:ring-leaf-400"
          />
          <p className="text-xs text-ink-400 text-center">Así te ven los compradores.</p>
        </>
      )}

      {step === 2 && (
        <>
          <div className="bg-cream-100 rounded-2xl p-4">
            <p className="text-xs font-semibold text-ink-600 mb-3">¿Cuántas unidades por día podés producir?</p>
            <p className="text-center font-display font-extrabold text-4xl text-leaf-600 mb-2">{capacidad}</p>
            <input
              type="range"
              min={10}
              max={500}
              step={10}
              value={capacidad}
              onChange={(e) => setCapacidad(Number(e.target.value))}
              className="w-full accent-leaf-500"
            />
            <div className="flex justify-between text-[11px] text-ink-500 mt-1">
              <span>10</span><span>500+</span>
            </div>
          </div>
          <RecordButton mode="audio" label="O contanos cómo es tu producción" />
        </>
      )}

      {step === 3 && (
        <>
          <p className="text-xs font-semibold text-ink-500">Marcá lo que ya producís</p>
          <div className="grid grid-cols-2 gap-2">
            {VENDIENDO_HOY.map(v => (
              <Chip key={v.label} label={v.label} emoji={v.emoji} selected={vendiendo.includes(v.label)} onClick={() => toggle(vendiendo, v.label, setVendiendo)} accent="leaf" />
            ))}
          </div>
        </>
      )}

      {step === 4 && (
        <>
          <p className="text-xs font-semibold text-ink-500">¿A quién querés llegar?</p>
          <div className="space-y-2">
            {QUE_VENDER.map(v => (
              <Chip key={v.label} label={v.label} emoji={v.emoji} selected={quiero.includes(v.label)} onClick={() => toggle(quiero, v.label, setQuiero)} accent="leaf" />
            ))}
          </div>
          <PhotoButton label="Sacale fotos a tu producto estrella" />
        </>
      )}

      {step === 5 && (
        <>
          <p className="text-xs font-semibold text-ink-500">Conservación y traslado</p>
          <div className="space-y-2">
            <Field label="¿Cuánto dura el producto?" placeholder="Ej: 3 días refrigerado" icon="📅" value={duracion} onChange={setDuracion} />
            <Field label="¿Cómo se conserva?" placeholder="Ej: heladera, freezer, ambiente" icon="❄️" value={conservacion} onChange={setConservacion} />
          </div>
          <p className="text-xs font-semibold text-ink-500 pt-3">¿Cómo se traslada?</p>
          <div className="space-y-2">
            {TRASLADO.map(t => (
              <Chip key={t.label} label={t.label} emoji={t.emoji} selected={traslado.includes(t.label)} onClick={() => toggle(traslado, t.label, setTraslado)} accent="leaf" />
            ))}
          </div>
        </>
      )}

      {step === 6 && (
        <>
          <p className="text-xs font-semibold text-ink-500">¿Cómo lo sirve el comprador?</p>
          <div className="grid grid-cols-2 gap-2">
            {SERVIR.map(s => (
              <Chip key={s.label} label={s.label} emoji={s.emoji} selected={servir.includes(s.label)} onClick={() => toggle(servir, s.label, setServir)} accent="leaf" />
            ))}
          </div>
          <Field label="Instrucciones para el comprador" placeholder="Ej: hornear a 180º durante 10 min" icon="📋" value={instrucciones} onChange={setInstrucciones} />
        </>
      )}
    </WizardShell>
  );
}

const titulos = [
  '¿Cómo se llama tu cocina?',
  '¿Cuál es tu capacidad?',
  '¿Qué vendés hoy?',
  '¿Qué querés vender?',
  'Conservación y entrega',
  'Cómo se sirve',
];
const subtitulos = [
  'Es el nombre que verán los locales que te compran.',
  'Calculamos cuántos pedidos podés cumplir.',
  'Lo que ya tenés en producción.',
  'Esto nos ayuda a matchearte con compradores.',
  'Importante para que el comprador reciba todo OK.',
  'Para que el comprador sepa qué hacer al recibirlo.',
];

function Field({ label, placeholder, icon, value, onChange }: any) {
  return (
    <div>
      <label className="text-xs font-semibold text-ink-600 mb-1.5 flex items-center gap-1.5">
        <span>{icon}</span> {label}
      </label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-cream-100 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-400" />
    </div>
  );
}
