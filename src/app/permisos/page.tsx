'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { getSupabase } from '@/lib/supabase';
import { useToast } from '@/components/Toast';
import { MapPin, Camera, Mic, Check, ChevronRight, Loader2 } from 'lucide-react';
import TopBar from '@/components/TopBar';

type PermKey = 'ubicacion' | 'camara' | 'microfono';

const PERMS: { key: PermKey; title: string; subtitle: string; icon: any; color: string; reason: string }[] = [
  {
    key: 'ubicacion',
    title: 'Ubicación',
    subtitle: 'Detectá oportunidades cerca tuyo',
    icon: MapPin,
    color: 'from-brand-400 to-brand-600',
    reason: 'La IA aprende qué se mueve en tu zona y te recomienda productos que potencian tu menú actual.',
  },
  {
    key: 'camara',
    title: 'Cámara',
    subtitle: 'Para conocer mejor tu local',
    icon: Camera,
    color: 'from-leaf-400 to-leaf-600',
    reason: 'Cuanto más sepa la IA sobre tu cocina, más podemos potenciar lo que ya tenés (equipamiento, espacio, vibra).',
  },
  {
    key: 'microfono',
    title: 'Micrófono',
    subtitle: 'Hablale a Provi como si fuera un amigo',
    icon: Mic,
    color: 'from-brand-400 to-brand-600',
    reason: 'La IA entiende tu pedido en lenguaje natural y arma la mejor combinación para tu negocio.',
  },
];

const BARRIOS = ['Palermo', 'Belgrano', 'Recoleta', 'San Telmo', 'Caballito', 'Villa Crespo', 'Núñez', 'Boedo', 'Almagro', 'Microcentro', 'Otro'];

export default function PermisosPage() {
  const router = useRouter();
  const { update, userId, role } = useStore();
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [granted, setGranted] = useState<Record<PermKey, boolean>>({ ubicacion: false, camara: false, microfono: false });
  const [requesting, setRequesting] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [showManual, setShowManual] = useState(false);
  const [manualBarrio, setManualBarrio] = useState('');
  const [manualDireccion, setManualDireccion] = useState('');

  const current = PERMS[step];

  async function persistProfile(patch: Record<string, any>) {
    const supabase = getSupabase();
    if (!supabase || !userId) return;
    await supabase.from('profiles').update(patch).eq('id', userId);
  }

  async function requestUbicacion() {
    setRequesting(true);
    if (!('geolocation' in navigator)) {
      setShowManual(true);
      setRequesting(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });
        const next = { ...granted, ubicacion: true };
        setGranted(next);
        update({
          permisos: next,
          ubicacion: { lat, lng, barrio: null, direccion: null },
        });
        await persistProfile({ lat, lng, perm_ubicacion: true });
        toast.show('Ubicación detectada ✓', 'success');
        setRequesting(false);
        setTimeout(() => advance(), 700);
      },
      () => {
        setRequesting(false);
        setShowManual(true);
        toast.show('No pudimos detectar tu ubicación', 'info');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  async function saveManual() {
    if (!manualBarrio && !manualDireccion) return;
    const next = { ...granted, ubicacion: true };
    setGranted(next);
    update({
      permisos: next,
      ubicacion: { lat: null, lng: null, barrio: manualBarrio, direccion: manualDireccion },
    });
    await persistProfile({
      perm_ubicacion: true,
      barrio: manualBarrio,
      direccion: manualDireccion,
    });
    toast.show('Ubicación guardada ✓', 'success');
    setShowManual(false);
    advance();
  }

  async function requestCamara() {
    setRequesting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(t => t.stop());
      const next = { ...granted, camara: true };
      setGranted(next);
      update({ permisos: next });
      await persistProfile({ perm_camara: true });
      toast.show('Cámara habilitada ✓', 'success');
      advance();
    } catch {
      toast.show('Sin permiso de cámara, podés activarla luego', 'info');
      advance();
    } finally {
      setRequesting(false);
    }
  }

  async function requestMic() {
    setRequesting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
      const next = { ...granted, microfono: true };
      setGranted(next);
      update({ permisos: next });
      await persistProfile({ perm_microfono: true });
      toast.show('Micrófono habilitado ✓', 'success');
      advance();
    } catch {
      toast.show('Sin permiso de micrófono, podés activarlo luego', 'info');
      advance();
    } finally {
      setRequesting(false);
    }
  }

  function deny() {
    advance();
  }

  function advance() {
    if (step < PERMS.length - 1) {
      setStep(step + 1);
    } else {
      router.push(role === 'vendedor' ? '/onboarding/vendedor' : '/onboarding/comprador');
    }
  }

  const Icon = current.icon;

  const handleAllow = () => {
    if (current.key === 'ubicacion') return requestUbicacion();
    if (current.key === 'camara') return requestCamara();
    if (current.key === 'microfono') return requestMic();
  };

  return (
    <div className="min-h-full bg-white flex flex-col">
      <TopBar
        back={step > 0}
        onBack={() => setStep(step - 1)}
        title=""
        right={
          <button
            onClick={() => router.push(role === 'vendedor' ? '/onboarding/vendedor' : '/onboarding/comprador')}
            className="text-xs font-semibold text-ink-500"
          >
            Saltar
          </button>
        }
      />

      <div className="px-6 pt-2 pb-6 flex-1 flex flex-col">
        <div className="flex gap-1.5 mb-8">
          {PERMS.map((_, i) => (
            <div key={i} className={`flex-1 h-1.5 rounded-full transition ${i <= step ? 'bg-brand-500' : 'bg-ink-200'}`} />
          ))}
        </div>

        {!showManual && (
          <div key={current.key} className="flex-1 flex flex-col items-center text-center animate-slide-up">
            <div className={`relative w-32 h-32 rounded-full bg-gradient-to-br ${current.color} flex items-center justify-center shadow-pop mt-6`}>
              <Icon size={56} className="text-white" strokeWidth={2.2} />
              <span className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-white shadow-soft flex items-center justify-center">
                <span className="text-2xl">{current.key === 'ubicacion' ? '📍' : current.key === 'camara' ? '🎥' : '🎙️'}</span>
              </span>
            </div>
            <h1 className="font-display font-extrabold text-3xl text-ink-900 mt-8">{current.title}</h1>
            <p className="text-ink-500 text-[15px] mt-2 max-w-xs">{current.subtitle}</p>
            <div className="mt-8 bg-gradient-to-br from-brand-50 to-leaf-50 border border-brand-100 rounded-2xl p-4 text-left w-full">
              <p className="text-xs font-extrabold text-brand-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                <span>✨</span> Potenciá tu negocio con IA
              </p>
              <p className="text-sm text-ink-700 leading-relaxed">{current.reason}</p>
            </div>
            {coords && current.key === 'ubicacion' && (
              <div className="mt-3 bg-leaf-50 border border-leaf-200 rounded-2xl p-3 w-full text-left">
                <p className="text-xs font-bold text-leaf-800">Coordenadas detectadas</p>
                <p className="text-[11px] text-leaf-700 font-mono">{coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}</p>
              </div>
            )}
          </div>
        )}

        {showManual && (
          <div className="flex-1 flex flex-col animate-slide-up">
            <div className="text-center mb-6">
              <span className="text-5xl">📍</span>
              <h2 className="font-display font-extrabold text-2xl mt-3">Ingresá tu ubicación</h2>
              <p className="text-sm text-ink-500 mt-1">No pudimos detectarla automáticamente</p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-ink-700 mb-1.5 block">Barrio</label>
                <select
                  value={manualBarrio}
                  onChange={(e) => setManualBarrio(e.target.value)}
                  className="w-full bg-cream-100 rounded-2xl px-4 py-4 font-medium focus:outline-none focus:ring-2 focus:ring-brand-400"
                >
                  <option value="">Elegir barrio...</option>
                  {BARRIOS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-700 mb-1.5 block">Dirección (opcional)</label>
                <input
                  value={manualDireccion}
                  onChange={(e) => setManualDireccion(e.target.value)}
                  placeholder="Ej: Av. Corrientes 1234"
                  className="w-full bg-cream-100 rounded-2xl px-4 py-4 font-medium focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3 pt-4">
          {showManual ? (
            <>
              <button
                onClick={saveManual}
                disabled={!manualBarrio && !manualDireccion}
                className="w-full bg-brand-500 active:scale-[0.98] transition rounded-2xl py-4 font-bold text-white shadow-pop flex items-center justify-center gap-2 disabled:opacity-50"
              >
                Guardar y continuar <ChevronRight size={20} />
              </button>
              <button onClick={() => { setShowManual(false); requestUbicacion(); }} className="w-full bg-cream-100 active:scale-[0.98] transition rounded-2xl py-4 font-semibold text-ink-600">
                Intentar detectar de nuevo
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleAllow}
                disabled={requesting}
                className="w-full bg-brand-500 active:scale-[0.98] transition rounded-2xl py-4 font-bold text-white shadow-pop flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {requesting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    {current.key === 'ubicacion' ? 'Detectando...' : 'Pidiendo permiso...'}
                  </>
                ) : (
                  <>Permitir <ChevronRight size={20} /></>
                )}
              </button>
              <button onClick={deny} className="w-full bg-cream-100 active:scale-[0.98] transition rounded-2xl py-4 font-semibold text-ink-600">
                Ahora no
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
