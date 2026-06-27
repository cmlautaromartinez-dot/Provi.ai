'use client';

import { useState, FormEvent, useEffect } from 'react';
import { X, Check, ArrowRight, Share2 } from 'lucide-react';
import { joinWaitlist } from '@/lib/services/waitlist';

interface Props {
  role: 'comprador' | 'vendedor';
  onClose: () => void;
  onDemo: () => void;
}

const TIPO_NEGOCIO_OPTIONS = [
  { value: 'cafeteria', label: 'Cafetería' },
  { value: 'buffet', label: 'Buffet' },
  { value: 'restaurante', label: 'Restaurante' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'otro', label: 'Otro' },
];

function validateWhatsapp(val: string) {
  const digits = val.replace(/\D/g, '');
  return digits.length >= 8;
}

function validateEmail(val: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
}

export default function WaitlistModal({ role, onClose, onDemo }: Props) {
  const [form, setForm] = useState({
    nombreLocal: '',
    nombre: '',
    whatsapp: '',
    email: '',
    tipoNegocio: '',
    zonadireccion: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [position, setPosition] = useState<number | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  function validate() {
    const next: Record<string, string> = {};
    if (!form.nombreLocal.trim()) next.nombreLocal = 'Ingresá el nombre del local.';
    if (!form.nombre.trim()) next.nombre = 'Ingresá tu nombre y apellido.';
    if (!form.whatsapp.trim()) {
      next.whatsapp = 'El WhatsApp es requerido.';
    } else if (!validateWhatsapp(form.whatsapp)) {
      next.whatsapp = 'Ingresá un número válido (mínimo 8 dígitos).';
    }
    if (form.email.trim() && !validateEmail(form.email)) {
      next.email = 'El email no tiene un formato válido.';
    }
    if (!form.tipoNegocio) next.tipoNegocio = 'Seleccioná el tipo de negocio.';
    if (!form.zonadireccion.trim()) next.zonadireccion = 'Ingresá la zona o dirección.';
    return next;
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSubmitError('');
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    const res = await joinWaitlist({
      nombre: form.nombre.trim(),
      email: form.email.trim() || undefined,
      whatsapp: form.whatsapp.trim(),
      nombreLocal: form.nombreLocal.trim(),
      tipoNegocio: form.tipoNegocio,
      zonadireccion: form.zonadireccion.trim(),
      role,
    });
    setSubmitting(false);
    if (!res.ok) { setSubmitError(res.error || 'Error al anotarte.'); return; }
    setPosition(res.position ?? null);
  }

  function set(field: string) {
    return (v: string) => {
      setForm(f => ({ ...f, [field]: v }));
      if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
    };
  }

  const isComprador = role === 'comprador';
  const headerClass = isComprador ? 'bg-brand-600' : 'bg-leaf-600';
  const btnClass = isComprador
    ? 'bg-brand-600 hover:bg-brand-700'
    : 'bg-leaf-600 hover:bg-leaf-700';
  const ringClass = isComprador ? 'bg-brand-100' : 'bg-leaf-100';
  const dotClass = isComprador ? 'bg-brand-500' : 'bg-leaf-500';
  const barClass = isComprador ? 'bg-brand-500' : 'bg-leaf-500';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[95dvh] flex flex-col">

        {/* Header */}
        <div className={`${headerClass} px-6 pt-6 pb-5 text-white relative flex-shrink-0`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition"
          >
            <X size={16} />
          </button>
          <div className="text-2xl mb-1.5">{isComprador ? '🛒' : '🍳'}</div>
          {position === null ? (
            <>
              <p className="font-display font-extrabold text-xl leading-tight">
                {isComprador ? 'Abastecer tu local, más fácil' : 'Vendé a más locales'}
              </p>
              <p className="text-sm text-white/75 mt-1">
                Anotate y te avisamos cuando lancemos.
              </p>
            </>
          ) : (
            <>
              <p className="font-display font-extrabold text-xl">¡Estás adentro!</p>
              <p className="text-sm text-white/75 mt-1">
                Sos el #{position} de la lista. Te escribimos al lanzar.
              </p>
            </>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto">
          {position !== null ? (
            <SuccessState position={position} onDemo={onDemo} onClose={onClose} ringClass={ringClass} dotClass={dotClass} barClass={barClass} btnClass={btnClass} />
          ) : (
            <form onSubmit={submit} noValidate className="space-y-3.5">
              <Field
                label="Nombre del local"
                type="text"
                placeholder="Ej: Café del Puerto"
                value={form.nombreLocal}
                onChange={set('nombreLocal')}
                error={errors.nombreLocal}
                required
              />
              <Field
                label="Nombre y apellido"
                type="text"
                placeholder="Ej: Ana Martínez"
                value={form.nombre}
                onChange={set('nombre')}
                error={errors.nombre}
                required
              />
              <Field
                label="WhatsApp"
                type="tel"
                placeholder="+54 9 11 1234-5678"
                value={form.whatsapp}
                onChange={set('whatsapp')}
                error={errors.whatsapp}
                required
              />
              <Field
                label="Email (opcional)"
                type="email"
                placeholder="ana@milocal.com"
                value={form.email}
                onChange={set('email')}
                error={errors.email}
                required={false}
              />

              {/* Tipo de negocio */}
              <div>
                <label className="block text-xs font-bold text-ink-700 mb-1.5">
                  Tipo de negocio <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.tipoNegocio}
                  onChange={e => set('tipoNegocio')(e.target.value)}
                  className={`w-full bg-cream-50 border rounded-xl px-4 py-3.5 text-sm text-ink-900 focus:outline-none focus:ring-1 transition appearance-none ${
                    errors.tipoNegocio
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
                      : 'border-cream-200 focus:border-brand-400 focus:ring-brand-200'
                  } ${!form.tipoNegocio ? 'text-ink-400' : ''}`}
                >
                  <option value="" disabled>Seleccioná una opción</option>
                  {TIPO_NEGOCIO_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                {errors.tipoNegocio && (
                  <p className="text-xs text-red-500 mt-1 font-medium">{errors.tipoNegocio}</p>
                )}
              </div>

              <Field
                label="Zona o dirección"
                type="text"
                placeholder="Ej: Palermo Soho, Thames 1800"
                value={form.zonadireccion}
                onChange={set('zonadireccion')}
                error={errors.zonadireccion}
                required
              />

              {submitError && (
                <p className="text-sm text-red-500 font-medium bg-red-50 rounded-xl px-4 py-3">
                  {submitError}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className={`w-full ${btnClass} text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition disabled:opacity-50 mt-1`}
              >
                {submitting ? (
                  <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Anotarme <ArrowRight size={17} /></>
                )}
              </button>

              <p className="text-[11px] text-ink-400 text-center pb-1">
                Sin spam. Solo te avisamos cuando lancemos.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function SuccessState({ position, onDemo, onClose, ringClass, dotClass, barClass, btnClass }: {
  position: number; onDemo: () => void; onClose: () => void;
  ringClass: string; dotClass: string; barClass: string; btnClass: string;
}) {
  function share() {
    if (navigator.share) {
      navigator.share({ title: 'provi.ai', text: '¡Me anoté en provi.ai! Abastecimiento gastronómico con IA. Anotate vos también.', url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  }

  return (
    <div className="text-center py-4">
      <div className={`w-20 h-20 rounded-full ${ringClass} flex items-center justify-center mx-auto`}>
        <div className={`w-14 h-14 rounded-full ${dotClass} flex items-center justify-center`}>
          <Check size={30} className="text-white" strokeWidth={3} />
        </div>
      </div>

      <h3 className="font-display font-extrabold text-xl text-ink-900 mt-4">¡Listo, estás anotado!</h3>
      <p className="text-sm text-ink-500 mt-1 mb-4">
        Te escribimos por WhatsApp cuando lancemos en tu zona.
      </p>

      <div className="flex items-center justify-center gap-2 text-xs text-ink-500 mb-1">
        <span>{position} de 100 anotados</span>
      </div>
      <div className="w-full h-2.5 bg-cream-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${barClass} rounded-full transition-all duration-700`}
          style={{ width: `${Math.min((position / 100) * 100, 100)}%` }}
        />
      </div>
      <p className="text-xs text-ink-400 mt-1.5 mb-6">{Math.max(0, 100 - position)} lugares restantes para el lanzamiento</p>

      <div className="flex flex-col gap-2">
        <button
          onClick={onDemo}
          className={`w-full ${btnClass} text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition`}
        >
          Ver la demo <ArrowRight size={16} />
        </button>
        <button
          onClick={share}
          className="w-full border border-cream-300 text-ink-600 font-semibold py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-cream-50 transition"
        >
          <Share2 size={15} /> Invitá a un colega
        </button>
      </div>
    </div>
  );
}

function Field({ label, type, placeholder, value, onChange, error, required }: {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  required: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-ink-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`w-full bg-cream-50 border rounded-xl px-4 py-3.5 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-1 transition ${
          error
            ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
            : 'border-cream-200 focus:border-brand-400 focus:ring-brand-200'
        }`}
        autoComplete={type === 'email' ? 'email' : type === 'tel' ? 'tel' : 'off'}
      />
      {error && <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>}
    </div>
  );
}
