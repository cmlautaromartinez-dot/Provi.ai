'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function WizardShell({
  step,
  total,
  title,
  subtitle,
  onBack,
  onNext,
  nextLabel = 'Siguiente',
  canSkip = true,
  onSkip,
  children,
  accent = 'comprador',
}: {
  step: number;
  total: number;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  canSkip?: boolean;
  onSkip?: () => void;
  children: ReactNode;
  accent?: 'comprador' | 'vendedor';
}) {
  const router = useRouter();
  const accentColor = accent === 'vendedor' ? 'leaf' : 'brand';

  return (
    <div className="min-h-full bg-white flex flex-col">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur px-4 py-3 border-b border-ink-100">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => (onBack ? onBack() : router.back())}
            className="w-9 h-9 rounded-xl active:bg-ink-100 flex items-center justify-center -ml-2"
          >
            <ChevronLeft size={22} />
          </button>
          <p className="text-xs font-semibold text-ink-500">
            Paso {step} de {total}
          </p>
          {canSkip && onSkip && (
            <button onClick={onSkip} className="ml-auto text-xs font-semibold text-ink-500">
              Saltar
            </button>
          )}
        </div>
        <div className="flex gap-1">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1.5 rounded-full transition ${
                i < step ? `bg-${accentColor}-500` : 'bg-ink-200'
              }`}
              style={i < step ? { background: accent === 'vendedor' ? '#06a77d' : '#ff6b35' } : undefined}
            />
          ))}
        </div>
      </header>

      <div className="px-6 pt-6 pb-4 flex-1 animate-fade-in">
        <h1 className="font-display font-extrabold text-2xl text-ink-900 leading-tight">{title}</h1>
        {subtitle && <p className="text-ink-500 text-sm mt-2">{subtitle}</p>}
        <div className="mt-6 space-y-4">{children}</div>
      </div>

      <div className="sticky bottom-0 bg-white border-t border-ink-100 p-4">
        <button
          onClick={onNext}
          className={`w-full active:scale-[0.98] transition rounded-2xl py-4 font-bold text-white shadow-pop flex items-center justify-center gap-2`}
          style={{ background: accent === 'vendedor' ? '#06a77d' : '#ff6b35' }}
        >
          {nextLabel} <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
