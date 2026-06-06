-- ============================================================
-- FIX: permitir vendedores demo sin auth.users real
-- ============================================================
-- Corré ESTO antes de seed.sql.
-- Quita el FK de profiles.id → auth.users(id) para que los
-- vendedores seed puedan existir sin tener un user en auth.
-- Los usuarios reales siguen funcionando porque el trigger
-- on_auth_user_created sigue insertando el profile cuando se
-- registran.
-- ============================================================

alter table public.profiles
  drop constraint if exists profiles_id_fkey;

-- (opcional) re-agregar como FK no obligatorio si querés
-- mantener la integridad para usuarios reales:
-- No es necesario, el trigger ya asegura la consistencia.
