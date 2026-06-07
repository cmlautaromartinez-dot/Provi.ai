'use client';

import { useRef, useState } from 'react';
import { Camera, Check, X } from 'lucide-react';

export default function PhotoButton({
  label,
  onSelected,
}: {
  label?: string;
  onSelected?: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const url = URL.createObjectURL(file);
    setPreview(url);
    onSelected?.(file);
  }

  function discard() {
    setPreview(null);
    setFileName(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  if (preview) {
    return (
      <div className="bg-leaf-50 border-2 border-leaf-200 rounded-2xl p-3 flex items-center gap-3 animate-fade-in">
        <img src={preview} alt="" className="w-14 h-14 rounded-xl object-cover" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-leaf-800 flex items-center gap-1 text-sm">
            <Check size={14} /> Foto cargada
          </p>
          <p className="text-[11px] text-leaf-700 truncate">{fileName}</p>
        </div>
        <button
          onClick={discard}
          className="w-9 h-9 rounded-xl bg-white text-ink-500 flex items-center justify-center flex-shrink-0"
        >
          <X size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-cream-100 rounded-2xl p-5 flex flex-col items-center gap-3">
      {label && <p className="text-xs font-semibold text-ink-600 text-center">{label}</p>}
      <button
        onClick={() => inputRef.current?.click()}
        className="relative w-20 h-20 rounded-full flex items-center justify-center text-white shadow-pop bg-gradient-to-br from-leaf-400 to-leaf-600 active:scale-95 transition"
      >
        <Camera size={32} strokeWidth={2.4} />
      </button>
      <p className="text-xs text-ink-500 font-medium">Tocá para sacar / subir foto</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onChange}
        className="hidden"
      />
    </div>
  );
}
