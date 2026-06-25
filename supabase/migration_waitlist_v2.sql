-- Migration: waitlist v2 — campaña Palermo/UDESA
-- Seguro correr sobre datos existentes: solo agrega columnas y relaja restricciones.
-- Correr en: Supabase Dashboard → SQL Editor → New query → pegar y ejecutar.

-- 1. Nuevos campos para la campaña
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS tipo_negocio  text;
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS zona_direccion text;

-- 2. Email pasa a ser opcional (no todos los dueños de local lo tienen a mano)
ALTER TABLE waitlist ALTER COLUMN email DROP NOT NULL;

-- 3. Quitar unique constraint de email (emails nulos no pueden ser únicos)
ALTER TABLE waitlist DROP CONSTRAINT IF EXISTS waitlist_email_key;

-- Verificación: ver estructura actualizada
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'waitlist'
ORDER BY ordinal_position;
