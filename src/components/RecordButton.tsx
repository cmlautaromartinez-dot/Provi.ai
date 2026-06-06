'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic, Video, Check, X, Play } from 'lucide-react';

type Mode = 'audio' | 'video';

export default function RecordButton({
  mode = 'audio',
  onDone,
  label,
}: {
  mode?: Mode;
  onDone?: (durSec: number) => void;
  label?: string;
}) {
  const [recording, setRecording] = useState(false);
  const [secs, setSecs] = useState(0);
  const [done, setDone] = useState<number | null>(null);
  const ref = useRef<any>(null);

  useEffect(() => {
    if (recording) {
      ref.current = setInterval(() => setSecs(s => s + 1), 1000);
    } else if (ref.current) {
      clearInterval(ref.current);
    }
    return () => ref.current && clearInterval(ref.current);
  }, [recording]);

  function start() {
    if (done !== null) {
      setDone(null);
      setSecs(0);
    }
    setRecording(true);
  }

  function stop() {
    setRecording(false);
    setDone(secs || 1);
    onDone?.(secs || 1);
  }

  function discard() {
    setDone(null);
    setSecs(0);
  }

  const Icon = mode === 'video' ? Video : Mic;

  if (done !== null) {
    return (
      <div className="bg-leaf-50 border-2 border-leaf-200 rounded-2xl p-4 flex items-center gap-3 animate-fade-in">
        <button className="w-12 h-12 rounded-xl bg-leaf-500 text-white flex items-center justify-center shadow-soft">
          <Play size={20} fill="white" />
        </button>
        <div className="flex-1">
          <p className="font-bold text-leaf-800 flex items-center gap-1">
            <Check size={16} /> {mode === 'video' ? 'Video grabado' : 'Audio grabado'}
          </p>
          <p className="text-xs text-leaf-700">Duración: 0:{String(done).padStart(2, '0')}</p>
        </div>
        <button onClick={discard} className="w-9 h-9 rounded-xl bg-white text-ink-500 flex items-center justify-center">
          <X size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-cream-100 rounded-2xl p-5 flex flex-col items-center gap-3">
      {label && <p className="text-xs font-semibold text-ink-600 text-center">{label}</p>}
      <button
        onClick={recording ? stop : start}
        className={`relative w-20 h-20 rounded-full flex items-center justify-center text-white shadow-pop transition ${
          recording ? 'bg-red-500 pulse-ring' : 'bg-gradient-to-br from-brand-400 to-brand-600 active:scale-95'
        }`}
      >
        <Icon size={32} strokeWidth={2.4} />
      </button>

      {recording ? (
        <div className="flex flex-col items-center gap-2">
          <p className="font-bold text-red-500 text-lg tabular-nums">
            0:{String(secs).padStart(2, '0')}
          </p>
          <div className="flex items-end gap-1 h-7">
            {[0.6, 0.9, 0.4, 1, 0.7, 0.3, 0.8, 0.5, 0.9].map((h, i) => (
              <span
                key={i}
                className="wave-bar w-1 rounded-full bg-red-500"
                style={{ height: `${h * 100}%`, animationDelay: `${i * 0.08}s` }}
              />
            ))}
          </div>
          <p className="text-xs text-ink-500">Tocá para finalizar</p>
        </div>
      ) : (
        <p className="text-xs text-ink-500 font-medium">
          Tocá para {mode === 'video' ? 'grabar video' : 'grabar audio'}
        </p>
      )}
    </div>
  );
}
