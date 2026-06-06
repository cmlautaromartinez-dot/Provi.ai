'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { ReactNode } from 'react';

export default function TopBar({
  title,
  subtitle,
  right,
  back = true,
  onBack,
  variant = 'light',
}: {
  title?: string;
  subtitle?: string;
  right?: ReactNode;
  back?: boolean;
  onBack?: () => void;
  variant?: 'light' | 'brand';
}) {
  const router = useRouter();
  const isBrand = variant === 'brand';
  return (
    <header
      className={`sticky top-0 z-30 px-4 py-3 flex items-center gap-3 ${
        isBrand
          ? 'bg-gradient-to-br from-brand-500 to-brand-600 text-white'
          : 'bg-white/95 backdrop-blur text-ink-900 border-b border-ink-100'
      }`}
    >
      {back && (
        <button
          onClick={() => (onBack ? onBack() : router.back())}
          className={`w-10 h-10 rounded-xl flex items-center justify-center -ml-2 ${
            isBrand ? 'bg-white/15 active:bg-white/25' : 'active:bg-ink-100'
          }`}
        >
          <ChevronLeft size={22} />
        </button>
      )}
      <div className="flex-1 min-w-0">
        {title && <h1 className="font-display font-extrabold text-lg leading-tight truncate">{title}</h1>}
        {subtitle && <p className={`text-xs ${isBrand ? 'text-white/85' : 'text-ink-500'}`}>{subtitle}</p>}
      </div>
      {right}
    </header>
  );
}
