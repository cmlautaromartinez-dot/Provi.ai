'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase/client';
import { useStore } from '@/lib/store';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const router = useRouter();
  const { update, role } = useStore();

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      router.push('/');
      return;
    }
    (async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        router.push('/auth');
        return;
      }
      const userId = data.session.user.id;
      const email = data.session.user.email;
      // upsert profile
      await supabase.from('profiles').upsert(
        { id: userId, role: role || 'comprador', email },
        { onConflict: 'id' }
      );
      update({ userId, authMethod: 'oauth' });
      router.push('/permisos');
    })();
  }, [router, update, role]);

  return (
    <div className="min-h-full flex flex-col items-center justify-center gap-4 p-8">
      <Loader2 size={42} className="text-brand-500 animate-spin" />
      <p className="text-ink-500 text-sm">Iniciando sesión...</p>
    </div>
  );
}
