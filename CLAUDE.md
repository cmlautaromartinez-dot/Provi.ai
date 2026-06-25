# CLAUDE.md — provi.ai

## Qué es este proyecto
Marketplace B2B de insumos gastronómicos. Conecta locales (restaurantes, cafés) con proveedores de alimentos. Nació en el Hackathon Y-Hat 2026 (48 hs, Exactas UBA).

## Stack
- Next.js 15 App Router + React 19 RSC
- Supabase (`fmoyramwepdtflnjpamo`)
- Tailwind CSS con tokens custom (paleta naranja: `brand-500 = #ff6b35`)
- Claude AI (Anthropic) para matching de productos

## Repo y deploy
- **Repo**: https://github.com/cmlautaromartinez-dot/Provi.ai *(dueño: Lautaro)*
- **App pública**: https://provi-ai-one.vercel.app
- **Local**: `/Users/mac/Provi.ai`

## Features implementadas
- Landing estilo kaso.ai con waitlist funcional (tabla `waitlist` en Supabase)
- Matching de productos por local: `src/lib/matching-core.ts`
  - Usa Claude AI + distancia Haversine + perfil del comprador
  - Rankea top 4 productos del catálogo
  - Fallback por reglas si no hay `ANTHROPIC_API_KEY`
- Performance P1–P5 completa (RSC, batch queries, skeletons, checkout optimista)
- Modo demo: `userId='demo-web'` cuando no hay auth real

## Features NO implementadas (solo marketing)
- **Escrow**: aparece como badge en la landing pero no hay lógica de pagos real
- **Envíos**: roadmap visual, no funcional
- **Crédito para compradores**: roadmap visual, no funcional

## Env vars necesarias
```
NEXT_PUBLIC_SUPABASE_URL=https://fmoyramwepdtflnjpamo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_Im92ThptayOf2UyXm3MHmg_g7DMJ2mk
ANTHROPIC_API_KEY=
KAPSO_API_KEY=
KAPSO_PHONE_NUMBER_ID=
KAPSO_WEBHOOK_SECRET=
```

## Reglas importantes
- No modificar el modelo de datos de pagos/escrow sin confirmar con Lautaro primero
- El dueño del negocio es Lautaro (CEO, perfil no técnico) — explicar todo sin jerga
