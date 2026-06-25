'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';
type Toast = { id: number; text: string; type: ToastType };

const ToastCtx = createContext<{ show: (text: string, type?: ToastType) => void }>({ show: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((text: string, type: ToastType = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, text, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2600);
  }, []);

  return (
    <ToastCtx.Provider value={{ show }}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none w-[90%] max-w-[380px]">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`animate-slide-up flex items-center gap-2 px-4 py-3 rounded-2xl shadow-lg backdrop-blur text-sm font-medium ${
              t.type === 'success' ? 'bg-leaf-500 text-white' :
              t.type === 'error' ? 'bg-red-500 text-white' :
              'bg-ink-900 text-white'
            }`}
          >
            {t.type === 'success' && <CheckCircle2 size={18} />}
            {t.type === 'error' && <AlertCircle size={18} />}
            {t.type === 'info' && <Info size={18} />}
            <span className="flex-1">{t.text}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  return useContext(ToastCtx);
}
