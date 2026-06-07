'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { getSupabase } from '@/lib/supabase';
import WizardShell from '@/components/WizardShell';
import Chip from '@/components/Chip';
import RecordButton from '@/components/RecordButton';
import PhotoButton from '@/components/PhotoButton';
import { useToast } from '@/components/Toast';

const HERRAMIENTAS = [
  { label: 'Heladera comercial', emoji: '🧊' },
  { label: 'Freezer', emoji: '❄️' },
  { label: 'Horno convector', emoji: '♨️' },
  { label: 'Horno pizzero', emoji: '🍕' },
  { label: 'Plancha / parrilla', emoji: '🔥' },
  { label: 'Cafetera profesional', emoji: '☕' },
  { label: 'Microondas industrial', emoji: '📡' },
  { label: 'Procesadora', emoji: '🌀' },
];

const MENU_ACTUAL = [
  { label: 'Café y bebidas', emoji: '☕' },
  { label: 'Sandwiches / paninis', emoji: '🥪' },
  { label: 'Pastelería dulce', emoji: '🧁' },
  { label: 'Pastelería salada', emoji: '🥐' },
  { label: 'Almuerzos / viandas', emoji: '🍱' },
  { label: 'Postres', emoji: '🍰' },
  { label: 'Pizzas', emoji: '🍕' },
  { label: 'Heladería', emoji: '🍦' },
];

const QUE_SUMAR = [
  { label: 'Comida sin TACC', emoji: '🌾' },
  { label: 'Opciones veganas', emoji: '🌱' },
  { label: 'Pastelería gourmet', emoji: '🧁' },
  { label: 'Brunch del finde', emoji: '🥞' },
  { label: 'Saludable / fit', emoji: '🥗' },
  { label: 'Comida congelada', emoji: '🧊' },
  { label: 'Bebidas premium', emoji: '🍹' },
  { label: 'Postres autor', emoji: '🍮' },
];

export default function OnboardingCompradorPage() {
  const router = useRouter();
  const { update, userId } = useStore();
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [nombreLocal, setNombreLocal] = useState('');
  const [herramientas, setHerramientas] = useState<string[]>([]);
  const [menu, setMenu] = useState<string[]>([]);
  const [capacidad, setCapacidad] = useState('');
  const [horarios, setHorarios] = useState('');
  const [notas, setNotas] = useState('');
  const [textoLibre, setTextoLibre] = useState('');
  const [sumar, setSumar] = useState<string[]>([]);
  const [tab, setTab] = useState<'rec' | 'txt'>('rec');
  const [saving, setSaving] = useState(false);

  function toggle<T>(arr: T[], item: T, setter: (a: T[]) => void) {
    setter(arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item]);
  }

  async function persistAndFinish() {
    setSaving(true);
    const supabase = getSupabase();
    if (supabase && userId) {
      await supabase.from('profiles').update({
        nombre_local: nombreLocal || 'Mi Local',
        onboarding_done: true,
      }).eq('id', userId);

      await supabase.from('buyer_profile').upsert({
        id: userId,
        herramientas,
        menu_actual: menu,
        caracteristicas: { capacidad, horarios, notas },
        quiero_sumar: sumar,
        texto_libre: textoLibre || null,
      }, { onConflict: 'id' });
    }
    update({ nombreLocal: nombreLocal || 'Mi Local', onboardingCompradorDone: true });
    toast.show('¡Perfil guardado! Provi ya está aprendiendo 🤖', 'success');
    setTimeout(() => router.push('/home'), 400);
  }

  function next() {
    if (step < 5) setStep(step + 1);
    else persistAndFinish();
  }

  function skip() {
    persistAndFinish();
  }

  return (
    <WizardShell
      step={step}
      total={5}
      title={titulos[step - 1]}
      subtitle={subtitulos[step - 1]}
      onBack={step === 1 ? undefined : () => setStep(step - 1)}
      onNext={next}
      onSkip={skip}
      nextLabel={step === 5 ? (saving ? 'Guardando...' : 'Finalizar') : 'Siguiente'}
      accent="comprador"
    >
      {step === 1 && (
        <div className="space-y-3">
          <input
            value={nombreLocal}
            onChange={(e) => setNombreLocal(e.target.value)}
            placeholder="Ej: Café del Norte"
            className="w-full bg-cream-100 rounded-2xl px-4 py-4 font-medium focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
          <p className="text-xs text-ink-400 text-center">Podés cambiarlo después.</p>
        </div>
      )}

      {step === 2 && (
        <>
          <p className="text-xs font-semibold text-ink-500">Elegí todas las que tengas</p>
          <div className="grid grid-cols-2 gap-2">
            {HERRAMIENTAS.map(h => (
              <Chip
                key={h.label}
                label={h.label}
                emoji={h.emoji}
                selected={herramientas.includes(h.label)}
                onClick={() => toggle(herramientas, h.label, setHerramientas)}
              />
            ))}
          </div>
          <div className="pt-2">
            <p className="text-xs font-semibold text-ink-500 mb-2">O mostranos con fotos</p>
            <PhotoButton label="Sacale fotos a tu cocina" />
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <div className="flex bg-cream-100 rounded-xl p-1">
            <button
              onClick={() => setTab('rec')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold ${tab === 'rec' ? 'bg-white shadow-soft text-ink-900' : 'text-ink-500'}`}
            >
              Elegir del listado
            </button>
            <button
              onClick={() => setTab('txt')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold ${tab === 'txt' ? 'bg-white shadow-soft text-ink-900' : 'text-ink-500'}`}
            >
              Foto / audio / texto
            </button>
          </div>
          {tab === 'rec' ? (
            <div className="grid grid-cols-2 gap-2 pt-2">
              {MENU_ACTUAL.map(m => (
                <Chip key={m.label} label={m.label} emoji={m.emoji} selected={menu.includes(m.label)} onClick={() => toggle(menu, m.label, setMenu)} />
              ))}
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              <PhotoButton label="Sacale una foto a tu carta o vidriera" />
              <RecordButton mode="audio" label="O grabá un audio explicando" />
              <textarea
                value={textoLibre}
                onChange={(e) => setTextoLibre(e.target.value)}
                placeholder="O escribilo: ej. café de especialidad, medialunas, focaccia..."
                className="w-full bg-cream-100 rounded-2xl p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-400"
                rows={3}
              />
            </div>
          )}
        </>
      )}

      {step === 4 && (
        <>
          <p className="text-xs font-semibold text-ink-500">Contanos características clave</p>
          <div className="space-y-3">
            <Field label="Capacidad de almacenamiento" placeholder="Ej: 2 heladeras + depósito chico" icon="📦" value={capacidad} onChange={setCapacidad} />
            <Field label="Horarios de recepción" placeholder="Ej: lunes a viernes 8 a 12 hs" icon="🕐" value={horarios} onChange={setHorarios} />
            <Field label="Algo importante a saber" placeholder="Ej: solo entrada por callejón lateral" icon="📍" value={notas} onChange={setNotas} />
          </div>
          <div className="pt-2">
            <p className="text-xs font-semibold text-ink-500 mb-2">O mostranos con fotos</p>
            <PhotoButton label="Sacale fotos a tu espacio" />
          </div>
        </>
      )}

      {step === 5 && (
        <>
          <p className="text-xs font-semibold text-ink-500">Provi aprende de esto para recomendarte</p>
          <div className="grid grid-cols-2 gap-2">
            {QUE_SUMAR.map(q => (
              <Chip key={q.label} label={q.label} emoji={q.emoji} selected={sumar.includes(q.label)} onClick={() => toggle(sumar, q.label, setSumar)} />
            ))}
          </div>
          <div className="pt-2">
            <p className="text-xs font-semibold text-ink-500 mb-2">¿Algo más específico?</p>
            <RecordButton mode="audio" label="Decile a Provi qué te gustaría sumar" />
          </div>
        </>
      )}
    </WizardShell>
  );
}

const titulos = [
  '¿Cómo se llama tu local?',
  '¿Qué equipamiento tenés?',
  '¿Qué hay en tu menú hoy?',
  'Características del local',
  '¿Qué te gustaría sumar?',
];
const subtitulos = [
  'Así te identificamos en la app.',
  'Provi te recomienda productos compatibles.',
  'Detectamos huecos en tu carta para sugerir productos.',
  'Esto le sirve al proveedor cuando entrega.',
  'Te recomendamos en base a esto + lo que se vende cerca tuyo.',
];

function Field({ label, placeholder, icon, value, onChange }: { label: string; placeholder: string; icon: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs font-semibold text-ink-600 mb-1.5 flex items-center gap-1.5">
        <span>{icon}</span> {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-cream-100 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
      />
    </div>
  );
}
