-- ============================================================
-- provi AI · Schema para Supabase
-- ============================================================
-- Pegá este SQL completo en Supabase > SQL Editor > Run
-- ============================================================

-- Extensiones
create extension if not exists "uuid-ossp";

-- ============================================================
-- profiles: información común a comprador y vendedor
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text check (role in ('comprador', 'vendedor')) not null,
  nombre_local text,
  email text,
  telefono text,
  -- Ubicación
  lat double precision,
  lng double precision,
  direccion text,
  barrio text,
  ciudad text default 'CABA',
  -- Permisos otorgados
  perm_ubicacion boolean default false,
  perm_camara boolean default false,
  perm_microfono boolean default false,
  whatsapp_conectado boolean default false,
  -- Onboarding
  onboarding_done boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- buyer_profile: respuestas del onboarding de comprador
-- ============================================================
create table if not exists public.buyer_profile (
  id uuid primary key references public.profiles(id) on delete cascade,
  herramientas text[] default '{}',           -- ej: ['Heladera comercial', 'Horno convector']
  menu_actual text[] default '{}',             -- ej: ['Café y bebidas', 'Sandwiches']
  caracteristicas jsonb,                       -- {capacidad, horarios, notas}
  quiero_sumar text[] default '{}',            -- ej: ['Sin TACC', 'Vegano']
  audio_url text,                              -- URL del audio grabado (opcional)
  video_url text,
  texto_libre text,                            -- transcripción/texto libre
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- seller_profile: respuestas del onboarding de vendedor
-- ============================================================
create table if not exists public.seller_profile (
  id uuid primary key references public.profiles(id) on delete cascade,
  capacidad_diaria int,                        -- unidades por día
  vendiendo_hoy text[] default '{}',           -- ej: ['Pastelería', 'Café']
  quiero_vender text[] default '{}',           -- ej: ['Catering eventos']
  traslado text[] default '{}',                -- ej: ['Yo entrego']
  servir text[] default '{}',                  -- ej: ['Listo para consumir']
  duracion text,                               -- "3 días refrigerado"
  conservacion text,
  instrucciones text,
  rating numeric(3, 2) default 4.5,
  total_ventas int default 0,
  verificado boolean default false,
  audio_url text,
  video_url text,
  texto_libre text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- products: productos publicados por vendedores
-- ============================================================
create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  seller_id uuid references public.profiles(id) on delete cascade,
  nombre text not null,
  descripcion text,
  categoria text,                              -- 'Pastelería', 'Panadería', etc
  tags text[] default '{}',                    -- ['vegano', 'sin tacc']
  emoji text default '🍽️',
  color text default 'from-brand-400 to-brand-600',
  precio numeric(10, 2) not null,
  unidad text default 'unidad',
  stock int default 0,
  vencimiento text,
  como_se_sirve text,
  activo boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_products_categoria on public.products(categoria);
create index if not exists idx_products_activo on public.products(activo);
create index if not exists idx_products_seller on public.products(seller_id);

-- ============================================================
-- orders: pedidos hechos por compradores
-- ============================================================
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  buyer_id uuid references public.profiles(id),
  seller_id uuid references public.profiles(id),
  product_id uuid references public.products(id),
  cantidad int not null,
  total numeric(10, 2) not null,
  estado text default 'pendiente' check (estado in ('pendiente', 'aceptado', 'en camino', 'entregado', 'cancelado')),
  fecha_entrega timestamptz,
  notas text,
  created_at timestamptz default now()
);

-- ============================================================
-- match_logs: registro de matches generados por Provi Bot
-- ============================================================
create table if not exists public.match_logs (
  id uuid primary key default uuid_generate_v4(),
  buyer_id uuid references public.profiles(id),
  pedido text,                                 -- "necesito tortas"
  cantidad text,
  fecha text,
  presupuesto text,
  extra text,
  resultado jsonb,                             -- top matches con score y razón
  created_at timestamptz default now()
);

-- ============================================================
-- RLS · Row Level Security
-- ============================================================
alter table public.profiles        enable row level security;
alter table public.buyer_profile   enable row level security;
alter table public.seller_profile  enable row level security;
alter table public.products        enable row level security;
alter table public.orders          enable row level security;
alter table public.match_logs      enable row level security;

-- profiles: cada usuario ve y edita SOLO su perfil; todos pueden leer info pública de vendedores
drop policy if exists "profiles_self_select" on public.profiles;
create policy "profiles_self_select" on public.profiles
  for select using (auth.uid() = id or role = 'vendedor');

drop policy if exists "profiles_self_insert" on public.profiles;
create policy "profiles_self_insert" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update" on public.profiles
  for update using (auth.uid() = id);

-- buyer_profile
drop policy if exists "buyer_profile_self_all" on public.buyer_profile;
create policy "buyer_profile_self_all" on public.buyer_profile
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- seller_profile: el dueño escribe; cualquiera autenticado lee (para matching)
drop policy if exists "seller_profile_self_write" on public.seller_profile;
create policy "seller_profile_self_write" on public.seller_profile
  for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "seller_profile_public_read" on public.seller_profile;
create policy "seller_profile_public_read" on public.seller_profile
  for select using (true);

-- products: el seller dueño escribe; cualquiera lee productos activos
drop policy if exists "products_public_read" on public.products;
create policy "products_public_read" on public.products
  for select using (activo = true);

drop policy if exists "products_owner_write" on public.products;
create policy "products_owner_write" on public.products
  for all using (auth.uid() = seller_id) with check (auth.uid() = seller_id);

-- orders: ambos lados ven sus órdenes
drop policy if exists "orders_party_read" on public.orders;
create policy "orders_party_read" on public.orders
  for select using (auth.uid() = buyer_id or auth.uid() = seller_id);

drop policy if exists "orders_buyer_insert" on public.orders;
create policy "orders_buyer_insert" on public.orders
  for insert with check (auth.uid() = buyer_id);

drop policy if exists "orders_party_update" on public.orders;
create policy "orders_party_update" on public.orders
  for update using (auth.uid() = buyer_id or auth.uid() = seller_id);

-- match_logs: el comprador ve sus logs
drop policy if exists "match_logs_self" on public.match_logs;
create policy "match_logs_self" on public.match_logs
  for all using (auth.uid() = buyer_id) with check (auth.uid() = buyer_id);

-- ============================================================
-- Trigger: crear profile al registrarse
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'role', 'comprador'))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- Función de distancia (Haversine en km)
-- ============================================================
create or replace function public.distance_km(lat1 double precision, lng1 double precision, lat2 double precision, lng2 double precision)
returns double precision as $$
  select 6371 * 2 * asin(sqrt(
    power(sin(radians(lat2 - lat1) / 2), 2) +
    cos(radians(lat1)) * cos(radians(lat2)) * power(sin(radians(lng2 - lng1) / 2), 2)
  ));
$$ language sql immutable;
