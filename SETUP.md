# 🚀 Setup provi AI — guía completa

3 integraciones reales: **Claude (Anthropic)** para el bot, **Google OAuth** en Supabase, **Twilio WhatsApp Sandbox** para Provi por wpp.

---

## 1. Claude API key (3 min)

1. Andá a https://console.anthropic.com/settings/keys
2. Hacé login (con Google o email).
3. Si es tu primera vez, te dan ~$5 de créditos gratis. Si no, agregá $5 con tarjeta (alcanza para miles de matches).
4. Click **Create Key** → nombre `provi-ai` → **Create**.
5. Copialo (empieza con `sk-ant-api03-...`).
6. Pegalo en `.env.local`:
   ```
   ANTHROPIC_API_KEY=sk-ant-api03-...
   ```

> Modelo usado: `claude-sonnet-4-5`. Costo por match: ~$0.003. WhatsApp por mensaje: ~$0.002.

---

## 2. Google OAuth (5 min)

### A) Crear OAuth Client en Google Cloud

1. Andá a https://console.cloud.google.com
2. Arriba a la izquierda creá un proyecto nuevo: **New Project** → nombre `provi-ai`.
3. Buscador del header: tipeá `OAuth consent screen` → entrá.
4. **User Type**: External → Create.
5. Llená:
   - App name: `provi AI`
   - User support email: tu email
   - Developer contact: tu email
   - Dejá todo lo demás vacío → Save and continue → Save (repetí hasta volver al dashboard).
6. Buscador: `Credentials` → entrá.
7. **+ Create Credentials** → **OAuth client ID**.
8. Application type: **Web application**. Name: `provi-ai-web`.
9. **Authorized redirect URIs** → **Add URI**:
   ```
   https://hvdkhzssklkxmgbaiwmq.supabase.co/auth/v1/callback
   ```
   (Es tu URL de Supabase + `/auth/v1/callback`. Importante: NO confundir con `/auth/callback` del frontend.)
10. **Create**. Te muestra **Client ID** y **Client Secret**. Copialos.

### B) Pegar en Supabase

1. Andá a https://supabase.com/dashboard/project/hvdkhzssklkxmgbaiwmq/auth/providers
2. Buscá **Google** → activá el toggle.
3. Pegá **Client ID** y **Client Secret**.
4. **Save**.

### C) URL Configuration en Supabase

1. https://supabase.com/dashboard/project/hvdkhzssklkxmgbaiwmq/auth/url-configuration
2. **Site URL**: `http://localhost:3000`
3. **Redirect URLs** (Add URL): agregá:
   ```
   http://localhost:3000/auth/callback
   http://localhost:3000/**
   ```
4. **Save**.

---

## 3. Twilio WhatsApp Sandbox (5 min)

### A) Crear cuenta y activar sandbox

1. Andá a https://www.twilio.com/try-twilio (signup gratis, $15 USD de crédito).
2. Verificá tu mail y tu teléfono.
3. En la consola: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
4. Vas a ver:
   - **Sandbox number**: `+1 415 523 8886`
   - **Sandbox code**: algo como `join ocean-blue` (cambia para cada cuenta)

### B) Conectar tu WhatsApp al sandbox

Desde tu celu:
1. Guardá `+1 415 523 8886` como contacto (ej. "Provi Sandbox").
2. Abrí un chat con ese contacto y mandá: `join ocean-blue` (o el que te muestre Twilio).
3. Twilio te responde "✅ Sandbox connected".

### C) Configurar el webhook

Necesitamos que Twilio sepa a qué URL mandar los mensajes que recibe.

**Como estás en localhost, necesitás `ngrok` para que Twilio llegue a tu compu:**

1. https://ngrok.com/download → descargá e instalá.
2. En una terminal nueva: `ngrok http 3000`
3. Te da una URL pública tipo `https://abc-123.ngrok-free.app`.
4. En Twilio: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
5. Sección **Sandbox Configuration**:
   - **When a message comes in**: pegá `https://abc-123.ngrok-free.app/api/whatsapp/webhook`
   - Method: `HTTP POST`
6. **Save**.

### D) Actualizar el código en la app

En `.env.local`, completá con el código de tu sandbox:
```
NEXT_PUBLIC_TWILIO_WHATSAPP_NUMBER=+1 415 523 8886
NEXT_PUBLIC_TWILIO_SANDBOX_CODE=join ocean-blue
```

---

## 4. Reiniciar dev server

```bash
# Ctrl+C en la terminal de Next.js
npm run dev
```

Next.js sólo lee `.env.local` al arrancar, no en hot-reload.

---

## 5. Probar todo end-to-end

### Login con Google
1. http://localhost:3000 → Quiero comprar → **Continuar con Google** → loguearte
2. Permitir ubicación (de verdad)
3. Completar onboarding
4. En Supabase > Table Editor > `profiles` debería estar tu row

### Provi Bot web con Claude
1. Home → **Hablá con Provi** (o tab Provi)
2. "necesito tortas" → cantidad → fecha → presupuesto → restricción
3. Te devuelve 4 matches con razón generada por Claude
4. Badge del header dice "con IA · Claude"

### Provi Bot por WhatsApp
1. Asegurate de tener `ngrok http 3000` corriendo y el webhook configurado en Twilio
2. Perfil → **Conectá WhatsApp**, vinculá tu número
3. Desde tu celu mandá un wpp al sandbox: `"necesito 30 brownies veganos para mañana, presupuesto $30000"`
4. Claude va a juntar la info que falte (te pregunta lo que no diste)
5. Cuando tiene todo, te manda 4 matches ranqueados con formato bonito

---

## 🔧 Troubleshooting

| Síntoma | Solución |
|---|---|
| Google redirige a 404 | Verificá que el Authorized redirect URI sea **exactamente** `https://hvdkhzssklkxmgbaiwmq.supabase.co/auth/v1/callback` (no el del frontend) |
| Login OK pero no aparece profile | Ejecutaste el `schema.sql`? El trigger `on_auth_user_created` lo crea |
| WhatsApp manda mensaje pero no responde | Revisá ngrok: la URL cambió? Refrescá en Twilio. Mirá los logs de Next.js |
| WhatsApp responde "Provi no está disponible" | Falta `ANTHROPIC_API_KEY`. Reiniciá `npm run dev` después de pegarla |
| Match dice "Matching por reglas" | Falta `ANTHROPIC_API_KEY` |
| Twilio dice "Channel not found" | Mandaste el `join <codigo>` al sandbox number? Hay que rehacerlo cada vez que el sandbox se desconecta (cada 72hs sin actividad) |

---

## 📐 Lo que está corriendo

- **`/api/match`** — POST con `{ buyerId, pedido, cantidad, fecha, presupuesto, extra }` → llama Claude → devuelve top 4
- **`/api/whatsapp/webhook`** — POST que recibe Twilio (form-encoded) → Claude juntando datos conversacionalmente → cuando tiene todo, dispara match y responde
- **`src/lib/matching-core.ts`** — función `runMatch()` compartida entre los 2 endpoints
- **Sesiones de WhatsApp** — en memoria (mapa por número). Para producción usar Redis o tabla Supabase

---

## 💡 Tips para demo

- Antes de demostrar, mandá un par de mensajes al sandbox para "calentar" la sesión.
- ngrok URL cambia cada vez que reiniciás ngrok → mejor activarte una cuenta gratis y fijar un subdominio.
- Si demostrás WhatsApp en vivo, mostrá tu pantalla con la app **abierta en `/perfil`** mientras mandás un wpp del celu — se ve más impactante que solo el celu.
