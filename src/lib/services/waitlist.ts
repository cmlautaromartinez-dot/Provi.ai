import { getSupabase } from '@/lib/supabase/client';

export async function joinWaitlist(data: {
  nombre: string;
  email?: string;
  whatsapp: string;
  nombreLocal: string;
  tipoNegocio: string;
  zonadireccion: string;
  role: 'comprador' | 'vendedor';
}): Promise<{ ok: boolean; error?: string; position?: number }> {
  const supabase = getSupabase();
  if (!supabase) return { ok: true };

  const { error } = await supabase.from('waitlist').insert({
    nombre: data.nombre,
    email: data.email?.trim() || null,
    whatsapp: data.whatsapp,
    nombre_local: data.nombreLocal,
    tipo_negocio: data.tipoNegocio,
    zona_direccion: data.zonadireccion,
    role: data.role,
  });

  if (error) {
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
