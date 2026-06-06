-- ============================================================
-- provi AI · Seed de vendedores y productos demo
-- ============================================================
-- IMPORTANTE: Estos vendedores son perfiles "demo" sin auth real.
-- Para que aparezcan en matching, los insertamos directo en profiles
-- usando UUIDs fijos. Las RLS permiten que sean leídos por cualquiera.
-- ============================================================

-- Insertar usuarios fake en auth (solo para satisfacer el FK)
-- Si no podés crear users en auth, usá la versión de abajo con UUIDs sueltos.

-- Vendedores demo
insert into public.profiles (id, role, nombre_local, email, lat, lng, direccion, barrio, ciudad, onboarding_done)
values
  ('11111111-1111-1111-1111-111111111111'::uuid, 'vendedor', 'La Dulce Carola',       'carola@demo.com',  -34.5875, -58.4400, 'Palermo Soho 1234',    'Palermo',  'CABA', true),
  ('22222222-2222-2222-2222-222222222222'::uuid, 'vendedor', 'Hornero del Barrio',    'hornero@demo.com', -34.6037, -58.3816, 'San Telmo 456',        'San Telmo', 'CABA', true),
  ('33333333-3333-3333-3333-333333333333'::uuid, 'vendedor', 'Cocina Libre',          'libre@demo.com',   -34.5760, -58.4200, 'Belgrano 789',         'Belgrano', 'CABA', true),
  ('44444444-4444-4444-4444-444444444444'::uuid, 'vendedor', 'Plant Bakery',          'plant@demo.com',   -34.6157, -58.4333, 'Caballito 321',        'Caballito', 'CABA', true),
  ('55555555-5555-5555-5555-555555555555'::uuid, 'vendedor', 'La Bodeguita',          'bodega@demo.com',  -34.5980, -58.3920, 'Recoleta 111',         'Recoleta', 'CABA', true),
  ('66666666-6666-6666-6666-666666666666'::uuid, 'vendedor', 'Verde Que Te Quiero',   'verde@demo.com',   -34.5630, -58.4570, 'Núñez 222',            'Núñez', 'CABA', true),
  ('77777777-7777-7777-7777-777777777777'::uuid, 'vendedor', 'Tostadores del Sur',    'tost@demo.com',    -34.6280, -58.4030, 'Boedo 333',            'Boedo', 'CABA', true),
  ('88888888-8888-8888-8888-888888888888'::uuid, 'vendedor', 'Tambo Cerca',           'tambo@demo.com',   -34.5500, -58.4800, 'Vicente López 444',    'GBA Norte', 'GBA', true),
  ('99999999-9999-9999-9999-999999999999'::uuid, 'vendedor', 'Nonna Lucia',           'nonna@demo.com',   -34.5900, -58.4150, 'Villa Crespo 555',     'Villa Crespo', 'CABA', true)
on conflict (id) do nothing;

-- Seller profiles
insert into public.seller_profile (id, capacidad_diaria, vendiendo_hoy, quiero_vender, traslado, servir, duracion, conservacion, instrucciones, rating, total_ventas, verificado)
values
  ('11111111-1111-1111-1111-111111111111'::uuid, 80, '{"Pastelería"}',           '{"A locales gastronómicos"}',    '{"Yo entrego"}',    '{"Listo para consumir"}', '3 días refrigerado', 'Heladera', 'Mantener entre 2 y 8°C',         4.9, 234, true),
  ('22222222-2222-2222-2222-222222222222'::uuid, 200, '{"Panadería","Pastelería"}', '{"A locales gastronómicos"}',  '{"Yo entrego"}',    '{"Listo para consumir"}', '24 hs ambiente',     'Ambiente', 'Consumir el día de entrega',     4.8, 412, true),
  ('33333333-3333-3333-3333-333333333333'::uuid, 150, '{"Viandas"}',              '{"Suscripciones semanales"}',     '{"El comprador retira"}', '{"Refrigerado","Listo para consumir"}', '4 días refrigerado', 'Heladera', 'Calentar 2 min microondas', 4.7, 320, true),
  ('44444444-4444-4444-4444-444444444444'::uuid, 100, '{"Pastelería","Comida lista"}', '{"A locales gastronómicos","Catering eventos"}', '{"Yo entrego"}', '{"Para hornear","Congelado"}', '30 días freezer', 'Freezer', 'Plancha 6 min de cada lado', 4.9, 178, true),
  ('55555555-5555-5555-5555-555555555555'::uuid, 300, '{"Comida lista"}',         '{"A locales gastronómicos"}',    '{"Yo entrego","Tercero / app"}', '{"Congelado","Para hornear"}', '60 días freezer', 'Freezer', 'Horno 12 min a 200°C', 4.6, 156, true),
  ('66666666-6666-6666-6666-666666666666'::uuid, 120, '{"Café y bebidas"}',       '{"A locales gastronómicos"}',    '{"Yo entrego"}',    '{"Refrigerado"}',         '5 días refrigerado',  'Heladera', 'Agitar antes de servir',     4.8, 198, true),
  ('77777777-7777-7777-7777-777777777777'::uuid, 60, '{"Café y bebidas"}',        '{"A locales gastronómicos"}',    '{"El comprador retira"}', '{"Para preparar"}',       '60 días sellado',     'Ambiente', 'Mantener seco y al fresco',  4.9, 87, true),
  ('88888888-8888-8888-8888-888888888888'::uuid, 250, '{"Comida lista"}',         '{"A locales gastronómicos"}',    '{"Yo entrego"}',    '{"Refrigerado"}',         '7 días refrigerado',  'Heladera', 'Servir frío',                4.8, 312, true),
  ('99999999-9999-9999-9999-999999999999'::uuid, 90, '{"Comida lista"}',          '{"A locales gastronómicos","Catering eventos"}', '{"Yo entrego"}', '{"Refrigerado","Para preparar"}', '5 días refrigerado', 'Heladera', 'Hervir 4 min', 4.9, 134, true)
on conflict (id) do nothing;

-- Productos
insert into public.products (id, seller_id, nombre, descripcion, categoria, tags, emoji, color, precio, unidad, stock, vencimiento, como_se_sirve)
values
  ('a1111111-1111-1111-1111-111111111111'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'Torta Red Velvet artesanal', 'Torta húmeda con frosting de queso crema. Porciones para 12.', 'Pastelería', '{"postre","dulce","sin conservantes"}', '🎂', 'from-pink-400 to-rose-500', 8500, 'unidad', 8, '3 días refrigerado', 'Cortar en porciones'),
  ('a2222222-2222-2222-2222-222222222222'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'Pan de masa madre', 'Pan rústico con 36hs de fermentación. Ideal para sandwich de autor.', 'Panadería', '{"pan","fermentado","artesanal"}', '🥖', 'from-amber-400 to-orange-500', 1800, 'kg', 24, '24 hs ambiente', 'Cortar rebanadas gruesas'),
  ('a3333333-3333-3333-3333-333333333333'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, 'Viandas sin TACC', 'Menú rotativo apto celíacos certificado. Mínimo 10 porciones.', 'Viandas', '{"sin tacc","celíaco","saludable"}', '🥗', 'from-leaf-400 to-leaf-600', 3200, 'porción', 50, '4 días refrigerado', 'Calentar 2 min microondas'),
  ('a4444444-4444-4444-4444-444444444444'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 'Brownie vegano premium', 'Brownie 100% plant-based con nueces. Sin huevo ni lácteos.', 'Pastelería', '{"vegano","postre","cacao puro"}', '🍫', 'from-amber-700 to-stone-800', 950, 'unidad', 60, '7 días ambiente', 'Templar 5 min antes de servir'),
  ('a5555555-5555-5555-5555-555555555555'::uuid, '55555555-5555-5555-5555-555555555555'::uuid, 'Empanadas gourmet x12', 'Variedades clásicas + carne picante. Cocción en horno 12 min.', 'Salado', '{"salado","congelado","horno"}', '🥟', 'from-yellow-400 to-amber-500', 6800, 'docena', 30, '60 días freezer', 'Horno 12 min a 200°C'),
  ('a6666666-6666-6666-6666-666666666666'::uuid, '66666666-6666-6666-6666-666666666666'::uuid, 'Jugos prensados en frío', 'Frutas y verduras orgánicas. Vence en 5 días refrigerado.', 'Bebidas', '{"saludable","fresco","detox"}', '🥤', 'from-leaf-300 to-leaf-500', 1400, 'botella 330ml', 40, '5 días refrigerado', 'Agitar antes de servir'),
  ('a7777777-7777-7777-7777-777777777777'::uuid, '77777777-7777-7777-7777-777777777777'::uuid, 'Café especialidad x kg', 'Blend de Brasil + Colombia. Tueste medio, perfecto espresso.', 'Bebidas', '{"café","specialty","tostado"}', '☕', 'from-stone-700 to-stone-900', 12500, 'kg', 18, '60 días sellado', 'Moler al momento'),
  ('a8888888-8888-8888-8888-888888888888'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'Alfajores de maicena x24', 'Tapas hechas a mano + dulce de leche colonial.', 'Pastelería', '{"postre","tradicional"}', '🍪', 'from-amber-200 to-amber-400', 5400, 'caja', 22, '15 días ambiente', 'Conservar en lugar fresco'),
  ('a9999999-9999-9999-9999-999999999999'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 'Hamburguesas vegetales x10', 'Base de lentejas y remolacha. Plancha 6 min.', 'Salado', '{"vegano","congelado"}', '🍔', 'from-leaf-500 to-emerald-700', 7200, 'pack', 35, '90 días freezer', 'Plancha 6 min cada lado'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '88888888-8888-8888-8888-888888888888'::uuid, 'Yogur natural artesanal x6', 'Yogur entero sin aditivos. Refrigerado.', 'Lácteos', '{"lácteo","fresco","probiótico"}', '🥛', 'from-blue-200 to-blue-400', 4200, 'pack', 28, '7 días refrigerado', 'Servir frío'),
  ('abbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'Cookies con chips x20', 'Cookies estilo americano con chips de chocolate semi amargo.', 'Pastelería', '{"postre","horneado"}', '🍪', 'from-amber-400 to-amber-600', 3600, 'caja', 45, '20 días ambiente', 'Conservar en lugar fresco'),
  ('acccccc1-cccc-cccc-cccc-cccccccccccc'::uuid, '99999999-9999-9999-9999-999999999999'::uuid, 'Pasta fresca rellena', 'Sorrentinos jamón y queso o ricota y nuez. Hervir 4 min.', 'Salado', '{"fresco","salado","italiano"}', '🍝', 'from-yellow-300 to-orange-400', 3800, 'kg', 15, '5 días refrigerado', 'Hervir 4 min en agua con sal')
on conflict (id) do nothing;
