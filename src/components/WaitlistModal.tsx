'use client';

import { useState, FormEvent, useEffect } from 'react';
import { X, Check, ArrowRight, Share2 } from 'lucide-react';
import { joinWaitlist } from '@/lib/waitlist';

interface Props {
  role: 'comprador' | 'vendedor';
  onClose: () => void;
  onDemo: () => void;
}

export default function WaitlistModal({ role, onClose, onDemo }: Props) {
  const [form, setForm] = useState({ nombre: '', email: '', whatsapp: '', nombreLocal: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [position, setPosition] = useState<number | null>(null);

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.nombre.trim() || !form.email.trim()) return;
    setSubmitting(true);
    const res = await joinWaitlist({
      nombre: form.nombre.trim(),
      email: form.email.trim(),
      whatsapp: form.whatsapp.trim() || undefined,
      nombreLocal: form.nombreLocal.trim() || undefined,
      role,
    });
    setSubmitting(false);
    if (!res.ok) { setError(res.error || 'Error al anotarte.'); return; }
    setPosition(res.position ?? null);
  }

  const isComprador = role === 'comprador';
  const accent = isComprador ? 'brand' : 'leaf';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className={`bg-${accent}-600 px-7 pt-7 pb-6 text-white relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition"
          >
            <X size={16} />
          </button>
          <div className="text-3xl mb-2">{isComprador ? '🛒' : '🍳'}</div>
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
        <div className="px-7 py-6">
          {position !== null ? (
            <SuccessState position={position} onDemo={onDemo} onClose={onClose} accent={accent} />
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <Field
                label="Nombre completo *"
                type="text"
                placeholder="Juan García"
                value={form.nombre}
                onChange={v => setForm(f => ({ ...f, nombre: v }))}
              />
              <Field
                label="Email *"
                type="email"
                placeholder="juan@milocal.com"
                value={form.email}
                onChange={v => setForm(f => ({ ...f, email: v }))}
              />
              <Field
                label="WhatsApp"
                type="tel"
                placeholder="+54 9 11 1234-5678"
                value={form.whatsapp}
                onChange={v => setForm(f => ({ ...f, whatsapp: v }))}
              />
              <Field
                label={isComprador ? 'Nombre del local' : '¿Qué producís?'}
                type="text"
                placeholder={isComprador ? 'Mi Cafetería' : 'Panadería artesanal, empanadas...'}
                value={form.nombreLocal}
                onChange={v => setForm(f => ({ ...f, nombreLocal: v }))}
              />

              {error && (
                <p className="text-sm text-red-500 font-medium">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting || !form.nombre || !form.email}
                className={`w-full bg-${accent}-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-${accent}-700 active:scale-[0.98] transition disabled:opacity-50 mt-2`}
              >
                {submitting ? (
                  <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Anotarme <ArrowRight size={17} /></>
                )}
              </button>

              <p className="text-[11px] text-ink-400 text-center">
                Sin spam. Solo te avisamos cuando lancemos.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function SuccessState({ position, onDemo, onClose, accent }: {
  position: number; onDemo: () => void; onClose: () => void; accent: string;
}) {
  function share() {
    if (navigator.share) {
      navigator.share({ title: 'provi.ai', text: '¡Me anoté en provi.ai! Abastecimiento gastronómico con IA. Anotate vos también.', url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  }

  return (
    <div className="text-center py-2">
      <div className={`w-16 h-16 rounded-full bg-${accent}-100 flex items-center justify-center mx-auto`}>
        <div className={`w-12 h-12 rounded-full bg-${accent}-500 flex items-center justify-center`}>
          <Check size={26} className="text-white" strokeWidth={3} />
        </div>
      </div>

      <div className="mt-4 mb-1">
        <div className="flex items-center justify-center gap-2 text-xs text-ink-500 mb-1">
          <span>{position} de 100 anotados</span>
        </div>
        <div className="w-full h-2 bg-cream-200 rounded-full overflow-hidden">
          <div
            className={`h-full bg-${accent}-500 rounded-full transition-all duration-700`}
            style={{ width: `${Math.min((position / 100) * 100, 100)}%` }}
          />
        </div>
        <p className="text-xs text-ink-400 mt-1">{100 - position} lugares restantes para el lanzamiento</p>
      </div>

      <div className="flex flex-col gap-2 mt-6">
        <button
          onClick={onDemo}
          className={`w-full bg-${accent}-600 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-${accent}-700 active:scale-[0.98] transition`}
        >
          Ver la demo <ArrowRight size={16} />
        </button>
        <button
          onClick={share}
          className="w-full border border-cream-300 text-ink-600 font-semibold py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-cream-50 transition"
        >
          <Share2 size={15} /> Invitá a un colega
        </button>
      </div>
    </div>
  );
}

function Field({ label, type, placeholder, value, onChange }: {
  label: string; type: string; placeholder: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-ink-700 mb-1.5">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-cream-50 border border-cream-200 rounded-xl px-4 py-3 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-200 transition"
      />
    </div>
  );
}
