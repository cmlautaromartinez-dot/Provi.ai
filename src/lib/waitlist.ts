import { getSupabase } from './supabase';

export async function joinWaitlist(data: {
  nombre: string;
  email: string;
  whatsapp?: string;
  nombreLocal?: string;
  role: 'comprador' | 'vendedor';
}): Promise<{ ok: boolean; error?: string; position?: number }> {
  const supabase = getSupabase();
  if (!supabase) return { ok: true }; // demo sin Supabase — mostramos éxito igual

  const { error } = await supabase.from('waitlist').insert({
    nombre: data.nombre,
    email: data.email,
    whatsapp: data.whatsapp || null,
    nombre_local: data.nombreLocal || null,
    role: data.role,
  });

  if (error) {
    if (error.code === '23505') return { ok: false, error: 'Este email ya está anotado.' };
    return { ok: false, error: 'Algo salió mal. Intentá de nuevo.' };
  }

  const count = await getWaitlistCount();
  return { ok: true, position: count };
}

export async function getWaitlistCount(): Promise<number> {
  const supabase = getSupabase();
  if (!supabase) return 0;
  const { count } = await supabase
    .from('waitlist')
    .select('*', { count: 'exact', head: true });
  return count || 0;
}
