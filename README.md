# provi.ia

Marketplace B2B para que locales gastronómicos compren y vendan productos elaborados entre sí, con recomendaciones asistidas por IA.

Desarrollado en 48 horas durante el **Hackathon Y-Hat 2026** (Exactas UBA, 5–7 junio 2026).

## Tabla de contenidos

- [Qué es Provi](#qué-es-provi)
- [Cómo funciona](#cómo-funciona)
- [Stack técnico](#stack-técnico)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Quickstart local](#quickstart-local)
- [Variables de entorno](#variables-de-entorno)
- [Matching por IA](#matching-por-ia)
- [Modelo de negocio](#modelo-de-negocio)
- [Tracción](#tracción)
- [Equipo](#equipo)
- [Licencia](#licencia)

## Qué es Provi

El abastecimiento gastronómico B2B en Argentina se mueve en gran parte por canales informales (WhatsApp, llamadas, contactos directos).

**Provi** conecta oferta y demanda entre cocinas y productores gastronómicos para que:

- quien tiene capacidad productiva ociosa pueda monetizarla;
- quien necesita productos terminados o mise en place encuentre proveedores cercanos;
- el proceso de descubrimiento, pedido y cobro sea más rápido y confiable.

> Foco: productos terminados y mise en place entre locales gastronómicos (no commodities).

## Cómo funciona

### Para compradores

- Onboarding con video/audio/menú para entender el perfil del local.
- Matching inteligente de proveedores según tipo de cocina, distancia, almacenamiento y precio.
- Búsqueda por catálogo visual o chat en lenguaje natural.
- Posibilidad de pedir muestra antes de comprar.
- Pago con esquema de escrow (liberación al confirmar recepción).

### Para vendedores

- Alta de local y capacidad productiva.
- Publicación de productos con fotos, precio y condiciones de conservación/transporte.
- Gestión de pedidos desde dashboard.
- Analytics de demanda local.

## Stack técnico

| Capa | Tecnología |
| --- | --- |
| Frontend | Next.js 15, React 19, Tailwind CSS |
| Backend | Next.js API Routes |
| Base de datos | Supabase (PostgreSQL, Auth, Storage) |
| IA (matching y chat) | Anthropic Claude (`claude-sonnet-4-5`) |
| WhatsApp | Kapso + Webhook |
| Auth | Google OAuth vía Supabase |
| Deploy | Vercel |

## Estructura del repositorio

```text
provi-ai/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/
│   │   │   ├── kapso/
│   │   │   ├── match/
│   │   │   └── whatsapp/
│   │   ├── onboarding/
│   │   ├── vendedor/
│   │   └── ...
│   ├── lib/
│   │   ├── matching-core.ts
│   │   ├── products.ts
│   │   └── orders.ts
│   └── components/
├── supabase/
│   ├── schema.sql
│   ├── seed.sql
│   └── fix-fk.sql
├── SETUP.md
└── README.md
```

## Quickstart local

### Requisitos

- Node.js 18+
- Proyecto Supabase
- API key de Anthropic

### Instalación

```bash
git clone https://github.com/Joacooo7/provi-ai.git
cd provi-ai
npm install
cp .env.local.example .env.local
```

### Base de datos

En Supabase SQL Editor ejecutar:

1. `supabase/schema.sql`
2. `supabase/seed.sql` (demo)

### Ejecutar en desarrollo

```bash
npm run dev
```

Abrí `http://localhost:3000`.

> Configuración detallada de OAuth/WhatsApp: ver [SETUP.md](./SETUP.md).

## Variables de entorno

Archivo: `.env.local` (partiendo de `.env.local.example`).

Variables principales:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ANTHROPIC_API_KEY=
KAPSO_API_KEY=
KAPSO_PHONE_NUMBER_ID=
KAPSO_WEBHOOK_SECRET=
```

## Matching por IA

Módulo central: `src/lib/matching-core.ts`.

Se reutiliza desde:

- `/api/chat`
- `/api/match`
- `/api/whatsapp/webhook`

Flujo de alto nivel:

1. Obtiene perfil del comprador desde Supabase.
2. Trae catálogo de productos activos y calcula cercanía geográfica.
3. Envía contexto a Claude para rankear matches.
4. Devuelve Top 4 con razón en lenguaje natural.
5. Registra información para mejorar matching futuro.

## Modelo de negocio

- 5% de comisión por transacción completada.
- Pago con escrow.
- Sin suscripción ni costo fijo.

## Tracción

- ✅ Primera venta B2B confirmada durante hackathon (200 postres/semana).
- ✅ Interés validado en focus group.
- ✅ MVP funcional en 48 horas con matching real.

## Equipo

| Nombre | Rol | Background |
| --- | --- | --- |
| Lautaro Martinez | CEO | Sub Director Comercial en Cheaf |
| Leonardo Caggiari | CTO | Sistemas en Uber Eats |
| Maia Liparelli | CMO | Marketing en Gunndy's Panadería |
| Joaquín | Dev | App de descuentos gastronómicos |

## Licencia

MIT — Hackathon Y-Hat 2026.
