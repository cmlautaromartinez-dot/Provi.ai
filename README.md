provi.ia
El marketplace B2B donde los locales gastronómicos se abastecen entre sí — con IA que aprende de cada cocina.

Desarrollado en 48 horas durante el Hackathon Y-Hat 2026 · Exactas UBA · 5–7 junio 2026


¿Qué es Provi?
El mercado de abastecimiento gastronómico en Argentina mueve USD 1.300 millones al año. Se gestiona por WhatsApp.

Hay cocinas con potencial productivo que hoy no genera ningún ingreso. A tres cuadras, hay otro local que necesita exactamente lo que esa cocina puede producir. Y hay productores que armaron su negocio para venderle a otros locales y no tienen canal. Nunca se conocieron.

Provi es la infraestructura que los conecta.

El que tiene algo para ofrecer, vende — monetiza lo que ya tiene.
El que necesita insumos elaborados, compra — sin WhatsApp, sin llamadas, sin fricción.
La IA hace la conexión — aprende de cada cocina y mejora con cada transacción.

Foco exclusivo: productos terminados y mise en place entre locales gastronómicos. No commodities.


Cómo funciona
Para el comprador
Onboarding inteligente — grabás tu cocina en video, describís tu negocio por audio, subís tu menú
Claude Vision analiza el equipamiento, tipo de cocina y capacidad de almacenamiento
El motor de matching cruza tu perfil con vendedores cercanos en tiempo real
Recibís sugerencias personalizadas — si tenés cocina china, no te sugerimos tacos
Pedís por chat en lenguaje natural o explorás el catálogo visual
Podés pedir una muestra antes de comprometerte
Pagás con escrow — el dinero se libera cuando confirmás recepción satisfactoria
Para el vendedor
Onboarding — describís tu local, tu producción y lo que querés ofrecer
Publicás productos con fotos, video, precio, cómo se guarda, cómo se traslada, cómo se sirve
Recibís pedidos y los gestionás desde el dashboard
Ves analytics de qué están buscando compradores en tu zona
Pedidos +$100.000 ARS a menos de 5km: Provi coordina el envío
El motor de IA
Video de cocina + Audio del negocio + Foto del menú

           ↓

      Claude Vision + Whisper

           ↓

   Perfil estructurado del local

           ↓

   Matching multidimensional con Claude

   (cocina 40% · distancia 25% · almacenamiento 20% · precio 15%)

           ↓

   Top 4 matches rankeados con razón en lenguaje natural

Cada transacción alimenta match_logs — el sistema aprende qué matches funcionan y cuáles no.


Stack técnico
Capa
Tecnología
Frontend
Next.js 15 + React 19 + Tailwind CSS
Backend
Next.js API Routes (serverless)
Base de datos
Supabase (PostgreSQL + Auth + Storage)
IA — Matching
Claude API (claude-sonnet-4-5)
IA — Chat
Claude API (claude-sonnet-4-5) con system prompt conversacional
WhatsApp
Twilio Sandbox
Auth
Google OAuth via Supabase
Deploy
Vercel



Estructura del repositorio
provi-ai/

├── src/

│   ├── app/

│   │   ├── page.tsx              # Landing — split comprador/vendedor

│   │   ├── auth/                 # Login con Google

│   │   ├── onboarding/

│   │   │   ├── comprador/        # Onboarding del comprador (video, audio, menú)

│   │   │   └── vendedor/         # Onboarding del vendedor (producción, oferta)

│   │   ├── home/                 # Dashboard del comprador

│   │   ├── explorar/             # Catálogo visual de productos

│   │   ├── producto/[id]/        # Página de producto con muestras

│   │   ├── carrito/              # Carrito multi-vendedor

│   │   ├── checkout/             # Checkout con escrow

│   │   ├── pedidos/              # Historial de pedidos del comprador

│   │   ├── provibot/             # Chatbot web con Claude

│   │   │   └── wpp/              # Interfaz WhatsApp

│   │   ├── vendedor/

│   │   │   ├── page.tsx          # Dashboard del vendedor

│   │   │   ├── productos/        # Gestión del catálogo

│   │   │   ├── publicar/         # Publicar nuevo producto

│   │   │   └── pedidos/          # Pedidos entrantes

│   │   ├── perfil/               # Perfil del local

│   │   └── api/

│   │       ├── chat/             # Chatbot conversacional (Claude)

│   │       ├── match/            # Motor de matching (Claude)

│   │       ├── whatsapp/         # Webhook Twilio WhatsApp

│   │       └── kapso/            # Integración Kapso

│   ├── lib/

│   │   ├── matching-core.ts      # Núcleo del matching — reutilizado por chat y WhatsApp

│   │   ├── store.ts              # Estado global (Zustand)

│   │   ├── supabase.ts           # Cliente Supabase (browser)

│   │   ├── supabase-server.ts    # Cliente Supabase (server)

│   │   ├── products.ts           # Queries de productos

│   │   └── orders.ts             # Queries de órdenes

│   └── components/

│       └── Logo.tsx

├── supabase/

│   ├── schema.sql                # Schema completo de la base de datos

│   ├── seed.sql                  # Datos de ejemplo para la demo

│   └── fix-fk.sql                # Fix de foreign keys

├── SETUP.md                      # Guía completa de configuración

├── package.json

└── README.md


Cómo levantarlo localmente
Requisitos
Node.js 18+
Cuenta en Supabase (gratuita)
API Key de Anthropic (Claude)
Cuenta en Twilio para WhatsApp (opcional)
Instalación
# 1. Clonar el repo

git clone https://github.com/Joacooo7/provi-ai.git

cd provi-ai

# 2. Instalar dependencias

npm install

# 3. Configurar variables de entorno

cp .env.example .env.local

# Completar con tus keys (ver sección Variables de Entorno)

# 4. Levantar la base de datos en Supabase

# Ir a Supabase Dashboard → SQL Editor

# Ejecutar supabase/schema.sql

# Ejecutar supabase/seed.sql (datos de demo)

# 5. Correr en desarrollo

npm run dev

Abrís http://localhost:3000 y ya está.


Variables de entorno
Crear .env.local en la raíz con:

# Supabase

NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Anthropic (Claude API)

ANTHROPIC_API_KEY=sk-ant-api03-...

# Twilio WhatsApp (opcional)

TWILIO_ACCOUNT_SID=ACxxxx

TWILIO_AUTH_TOKEN=xxxx

TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# URL base (para callbacks)

NEXT_PUBLIC_SITE_URL=http://localhost:3000

Para la guía completa de configuración de Google OAuth y Twilio ver SETUP.md.


El motor de matching — cómo funciona por dentro
El corazón de Provi es src/lib/matching-core.ts. Es el mismo módulo que usan tres canales distintos:

/api/chat — el chatbot web
/api/match — llamada directa al matching
/api/whatsapp/webhook — el bot de WhatsApp

El flujo:

// 1. Trae el perfil del comprador desde Supabase

const buyer = await supabase.from('profiles').select(...).eq('id', buyerId)

// 2. Trae el catálogo de productos activos con distancia Haversine

const products = await supabase.from('products').select(...)

const enriched = products.map(p => ({

  ...p,

  distancia_km: haversineKm(buyer.lat, buyer.lng, p.seller.lat, p.seller.lng)

}))

// 3. Le pide a Claude que rankee los top 4

const response = await claude.messages.create({

  model: 'claude-sonnet-4-5',

  system: SYSTEM_PROMPT, // criterios de ranking + formato JSON

  messages: [{ role: 'user', content: contexto_del_pedido + catalogo }]

})

// 4. Devuelve matches con score y razón en lenguaje natural

// 5. Loguea en match_logs para aprendizaje futuro

La distancia se calcula con la fórmula de Haversine — sin APIs externas, sin latencia adicional.


Modelo de negocio
5% de comisión por transacción completada
Escrow — el pago queda retenido hasta confirmación de recepción satisfactoria
Logística propia en pedidos +$100.000 ARS a menos de 5km
Sin suscripción. Sin costo fijo. Si no venden, no cobramos.


Tracción
✅ Primera venta B2B confirmada durante el hackathon: 200 postres / semana
✅ 100% de interés en el focus group
✅ MVP funcional en 48 horas con motor de matching real


El equipo
Nombre
Rol
Background
Lautaro Martinez
CEO
Sub Director Comercial en Cheaf — acceso directo a 1000+ locales
Leonardo Caggiari
CTO
Sistemas en Uber Eats — arquitectura de marketplaces a escala
Maia Liparelli
CMO
Marketing en Gunndy's Panadería — voz del cliente gastronómico
Joaquín
Dev
App de descuentos gastronómicos — construyó el MVP en 48hs



Licencia
MIT — Hackathon Y-Hat 2026
