'use client';

import { Check } from 'lucide-react';

export default function Chip({
  label,
  emoji,
  selected,
  onClick,
  accent = 'brand',
}: {
  label: string;
  emoji?: string;
  selected?: boolean;
  onClick?: () => void;
  accent?: 'brand' | 'leaf';
}) {
  const isLeaf = accent === 'leaf';
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-2xl p-3 border-2 transition flex items-center gap-3 ${
        selected
          ? isLeaf
            ? 'bg-leaf-50 border-leaf-500'
            : 'bg-brand-50 border-brand-500'
          : 'bg-white border-ink-200 active:scale-[0.98]'
      }`}
    >
      {emoji && <span className="text-2xl">{emoji}</span>}
      <span className={`flex-1 font-semibold text-sm ${selected ? 'text-ink-900' : 'text-ink-700'}`}>
        {label}
      </span>
      {selected && (
        <span className={`w-6 h-6 rounded-full ${isLeaf ? 'bg-leaf-500' : 'bg-brand-500'} text-white flex items-center justify-center`}>
          <Check size={14} strokeWidth={3} />
        </span>
      )}
    </button>
  );
}
