'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { getSupabase } from '@/lib/supabase';
import { useToast } from '@/components/Toast';
import TopBar from '@/components/TopBar';
import Logo from '@/components/Logo';
import { Role } from '@/types';
import { Mail, ArrowRight, Loader2 } from 'lucide-react';

type Step = 'pick' | 'email' | 'sent' | 'loading';

export default function AuthPage() {
  const router = useRouter();
  const { update, role } = useStore();
  const toast = useToast();
  const supabase = getSupabase();
  const [step, setStep] = useState<Step>('pick');
  const [email, setEmail] = useState('');

  // Si vuelve del callback con sesión activa, avanzar
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(async ({ data }: any) => {
      if (data?.session) {
        const userId = data.session.user.id;
        await ensureProfile(userId, role);
        update({ userId, authMethod: 'oauth' });
        router.push('/permisos');
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      if (event === 'SIGNED_IN' && session) {
        const userId = session.user.id;
        await ensureProfile(userId, role);
        update({ userId, authMethod: 'magic_link' });
        router.push('/permisos');
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase, role, update, router]);

  async function ensureProfile(userId: string, r: Role) {
    if (!supabase || !r) return;
    await supabase.from('profiles').upsert({ id: userId, role: r }, { onConflict: 'id' });
  }

  async function signInGoogle() {
    if (!supabase) {
      toast.show('Faltan credenciales de Supabase', 'error');
      return demoSignIn();
    }
    setStep('loading');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback`, queryParams: { role: role || 'comprador' } },
    });
    if (error) {
      toast.show('Error con Google: ' + error.message, 'error');
      setStep('pick');
    }
  }

  async function sendMagicLink() {
    if (!email.trim()) return;
    if (!supabase) {
      toast.show('Faltan credenciales de Supabase', 'error');
      return demoSignIn();
    }
    setStep('loading');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback`, data: { role: role || 'comprador' } },
    });
    if (error) {
      toast.show('No pudimos enviar el link: ' + error.message, 'error');
      setStep('email');
    } else {
      setStep('sent');
    }
  }

  // Fallback "demo" cuando todavía no configuraron Supabase
  function demoSignIn() {
    const fakeId = 'demo-' + Math.random().toString(36).slice(2, 10);
    update({ userId: fakeId, authMethod: 'demo' });
    setTimeout(() => router.push('/permisos'), 600);
  }

  return (
    <div className="min-h-full flex flex-col bg-white">
      <TopBar back={step !== 'pick'} onBack={() => setStep('pick')} variant="light" />
      <div className="px-6 pt-2 pb-6 flex-1 flex flex-col">
        <div className="mb-6 animate-fade-in">
          <Logo size={32} />
          <h1 className="font-display font-extrabold text-3xl text-ink-900 mt-6">
            {step === 'pick' && 'Creá tu cuenta'}
            {step === 'email' && 'Ingresá tu mail'}
            {step === 'sent' && 'Revisá tu mail'}
            {step === 'loading' && 'Conectando...'}
          </h1>
          <p className="text-ink-500 text-sm mt-2">
            {step === 'pick' && `Sumate a provi como ${role === 'vendedor' ? 'proveedor' : 'comprador'}.`}
            {step === 'email' && 'Te mandamos un link mágico para entrar sin contraseña.'}
            {step === 'sent' && `Mandamos un link a ${email}. Clickealo y volvés acá logueado.`}
          </p>
        </div>

        {step === 'pick' && (
          <div className="space-y-3 animate-slide-up">
            <button onClick={signInGoogle} className="w-full bg-white border-2 border-ink-200 active:scale-[0.98] transition rounded-2xl p-4 font-semibold text-ink-900 flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-white border border-ink-200 text-ink-900 flex items-center justify-center font-extrabold text-sm">G</span>
              Continuar con Google
            </button>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-ink-200" />
              <span className="text-xs text-ink-400 font-medium">o</span>
              <div className="flex-1 h-px bg-ink-200" />
            </div>

            <button onClick={() => setStep('email')} className="w-full flex items-center gap-3 bg-cream-100 active:scale-[0.98] transition rounded-2xl p-4 font-semibold text-ink-900">
              <Mail size={20} className="text-brand-500" />
              Con email (link mágico)
              <ArrowRight size={18} className="ml-auto text-ink-400" />
            </button>

            <button onClick={demoSignIn} className="w-full text-xs text-ink-400 underline mt-4">
              Saltar (modo demo sin login)
            </button>
          </div>
        )}

        {step === 'email' && (
          <div className="space-y-4 animate-slide-up">
            <div>
              <label className="text-sm font-semibold text-ink-700 mb-2 block">Email</label>
              <input
                autoFocus
                type="email"
                placeholder="cocina@provi.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-cream-100 rounded-2xl px-4 py-4 text-base font-medium focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
            <button onClick={sendMagicLink} className="w-full bg-brand-500 active:scale-[0.98] transition rounded-2xl py-4 font-bold text-white shadow-pop">
              Enviar link mágico
            </button>
          </div>
        )}

        {step === 'sent' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 animate-fade-in">
            <span className="text-6xl">📬</span>
            <p className="text-sm text-ink-500">Cuando hagas click en el link te traemos de vuelta acá.</p>
            <button onClick={() => setStep('email')} className="text-brand-500 text-sm font-semibold mt-4">
              Mandar de nuevo
            </button>
          </div>
        )}

        {step === 'loading' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <Loader2 size={42} className="text-brand-500 animate-spin" />
            <p className="text-ink-500 text-sm">Conectando con tu proveedor de auth...</p>
          </div>
        )}

        <p className="text-[11px] text-ink-400 text-center mt-auto pt-6">
          Al continuar aceptás los Términos y la Política de Privacidad.
        </p>
      </div>
    </div>
  );
}
