'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Send, Mic, ChevronLeft, MessageCircle, Sparkles, Plus, AlertCircle, RotateCcw } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useToast } from '@/components/Toast';

type Msg = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  matches?: any[];
};

const QUICK_REPLIES = [
  'Necesito tortas para un evento',
  'Quiero pan de masa madre',
  'Tengo que sumar opciones sin TACC',
  'Estoy buscando café de especialidad',
];

export default function ProviBotPage() {
  const router = useRouter();
  const { addToCart, userId } = useStore();
  const toast = useToast();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [strategy, setStrategy] = useState<string | null>(null);
  const [showQuick, setShowQuick] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);
  const inited = useRef(false);

  // Mensaje de bienvenida al montar
  useEffect(() => {
    if (inited.current) return;
    inited.current = true;
    sendToServer([]);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, typing]);

  async function sendToServer(history: { role: 'user' | 'assistant'; content: string }[]) {
    setTyping(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyerId: userId, history }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'error');

      const botMsg: Msg = {
        id: String(Date.now()) + Math.random(),
        role: 'assistant',
        content: data.reply || '...',
        matches: data.matches || undefined,
      };
      setMsgs((m) => [...m, botMsg]);
      if (data.strategy) setStrategy(data.strategy);
    } catch (e: any) {
      setMsgs((m) => [
        ...m,
        {
          id: String(Date.now()),
          role: 'assistant',
          content: `Tuve un problema: ${e.message}. Revisá que ANTHROPIC_API_KEY esté seteada y reiniciá npm run dev.`,
        },
      ]);
    } finally {
      setTyping(false);
    }
  }

  function send(text: string) {
    const txt = text.trim();
    if (!txt) return;
    setShowQuick(false);
    setInput('');
    const userMsg: Msg = { id: String(Date.now()), role: 'user', content: txt };
    const nextMsgs = [...msgs, userMsg];
    setMsgs(nextMsgs);
    // Construir historial sin matches (solo texto plano va al modelo)
    const history = nextMsgs.map((m) => ({ role: m.role, content: m.content }));
    sendToServer(history);
  }

  function restart() {
    setMsgs([]);
    setStrategy(null);
    setShowQuick(true);
    inited.current = false;
    setTimeout(() => {
      inited.current = true;
      sendToServer([]);
    }, 100);
  }

  return (
    <div className="absolute inset-0 bg-cream-50 flex flex-col">
      <header className="sticky top-0 z-30 bg-white border-b border-ink-100 px-3 py-3 flex items-center gap-2">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-xl active:bg-ink-100 flex items-center justify-center">
          <ChevronLeft size={22} />
        </button>
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-xl">🤖</div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-leaf-500 rounded-full border-2 border-white" />
        </div>
        <div className="flex-1">
          <p className="font-display font-extrabold leading-tight">Provi Bot</p>
          <p className="text-[11px] text-leaf-600 font-semibold">
            {strategy === 'llm_claude' ? 'con IA · Claude' : 'en línea · responde al instante'}
          </p>
        </div>
        <button onClick={restart} className="w-9 h-9 rounded-xl bg-cream-100 text-ink-600 flex items-center justify-center" title="Reiniciar">
          <RotateCcw size={16} />
        </button>
        <Link href="/provibot/wpp" className="w-9 h-9 rounded-xl bg-leaf-100 text-leaf-700 flex items-center justify-center">
          <MessageCircle size={18} />
        </Link>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {msgs.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
            <div className={`max-w-[85%] ${m.role === 'user' ? 'bg-brand-500 text-white rounded-2xl rounded-br-md' : 'bg-white text-ink-900 rounded-2xl rounded-bl-md shadow-soft'} px-4 py-2.5`}>
              <p className="text-sm leading-relaxed whitespace-pre-line">{m.content}</p>

              {m.matches && (
                <div className="mt-3 space-y-2">
                  {m.matches.map((p: any) => (
                    <div key={p.id} className="bg-cream-50 rounded-2xl p-3 border border-ink-100">
                      <div className="flex gap-3">
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${p.color || 'from-brand-400 to-brand-600'} flex items-center justify-center text-2xl flex-shrink-0`}>
                          {p.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <p className="font-bold text-xs text-ink-900 truncate">{p.nombre}</p>
                            <span className="bg-brand-100 text-brand-700 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full whitespace-nowrap">
                              {p.match}%
                            </span>
                          </div>
                          <p className="text-[10px] text-ink-500 truncate">
                            {p.proveedor} · {p.distancia ? `${p.distancia.toFixed(1)}km · ` : ''}⭐ {p.rating}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="font-extrabold text-sm text-brand-500">${p.precio.toLocaleString('es-AR')}</p>
                            <button
                              onClick={() => { addToCart(p.id, 1); toast.show('Agregado al carrito', 'success'); }}
                              className="bg-brand-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"
                            >
                              <Plus size={12} strokeWidth={3} /> Agregar
                            </button>
                          </div>
                        </div>
                      </div>
                      {p.razon && (
                        <div className="mt-2 pt-2 border-t border-ink-100 flex items-start gap-1.5">
                          <Sparkles size={10} className="text-brand-500 mt-0.5 flex-shrink-0" />
                          <p className="text-[10px] text-ink-600 italic leading-snug">{p.razon}</p>
                        </div>
                      )}
                    </div>
                  ))}
                  <Link href="/carrito" className="block bg-ink-900 text-white text-center font-bold text-xs py-3 rounded-2xl mt-2 active:scale-[0.98] transition">
                    Ver carrito y pedir
                  </Link>
                </div>
              )}
            </div>
          </div>
        ))}

        {typing && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-md shadow-soft px-4 py-3 flex gap-1">
              <span className="typing-dot w-2 h-2 bg-ink-400 rounded-full" />
              <span className="typing-dot w-2 h-2 bg-ink-400 rounded-full" style={{ animationDelay: '0.2s' }} />
              <span className="typing-dot w-2 h-2 bg-ink-400 rounded-full" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}

        {showQuick && msgs.length === 1 && !typing && (
          <div className="flex flex-wrap gap-1.5 pl-2 animate-fade-in">
            {QUICK_REPLIES.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="bg-white border border-brand-200 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full active:scale-95 shadow-soft"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {strategy === 'rules_only' && msgs.some((m) => m.matches) && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-start gap-2 animate-fade-in">
            <AlertCircle size={14} className="text-amber-600 mt-0.5" />
            <p className="text-[11px] text-amber-800">
              Matching por reglas (sin IA). Agregá <code className="bg-amber-100 px-1 rounded">ANTHROPIC_API_KEY</code> en <code className="bg-amber-100 px-1 rounded">.env.local</code> para usar IA real.
            </p>
          </div>
        )}

        <div ref={endRef} />
      </main>

      <footer className="sticky bottom-0 bg-white border-t border-ink-100 px-3 py-3 flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send(input)}
          placeholder="Escribile a Provi..."
          className="flex-1 bg-cream-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
        <button className="w-11 h-11 rounded-xl bg-cream-100 text-brand-500 flex items-center justify-center">
          <Mic size={18} />
        </button>
        <button onClick={() => send(input)} disabled={typing || !input.trim()} className="w-11 h-11 rounded-xl bg-brand-500 text-white flex items-center justify-center shadow-pop active:scale-95 disabled:opacity-50">
          <Send size={18} />
        </button>
      </footer>
    </div>
  );
}
