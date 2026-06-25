'use client';

import { createBrowserClient } from '@supabase/ssr';

let _client: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabase() {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.warn('[provi] Supabase env vars no seteadas. Las llamadas fallarán suavemente.');
    return null;
  }
  _client = createBrowserClient(url, key);
  return _client;
}

// Helpers tipados (livianos, sin generación)
export type ProfileRow = {
  id: string;
  role: 'comprador' | 'vendedor';
  nombre_local: string | null;
  email: string | null;
  telefono: string | null;
  lat: number | null;
  lng: number | null;
  direccion: string | null;
  barrio: string | null;
  ciudad: string | null;
  perm_ubicacion: boolean;
  perm_camara: boolean;
  perm_microfono: boolean;
  whatsapp_conectado: boolean;
  onboarding_done: boolean;
};
