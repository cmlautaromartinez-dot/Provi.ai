/**
 * Cliente para la API de Kapso (WhatsApp Cloud API as a Service).
 * Docs: https://docs.kapso.ai
 *
 * Env vars necesarias (todas server-side):
 *   KAPSO_API_KEY            — header X-API-Key
 *   KAPSO_PHONE_NUMBER_ID    — el ID del número de WhatsApp conectado (no es el número, es el ID interno)
 *   KAPSO_WEBHOOK_SECRET     — secret para verificar la firma HMAC del webhook
 */
import crypto from 'crypto';

const KAPSO_BASE = 'https://api.kapso.ai';

export type KapsoConfig = {
  apiKey: string;
  phoneNumberId: string;
};

export function getKapsoConfig(): KapsoConfig | null {
  const apiKey = process.env.KAPSO_API_KEY;
  const phoneNumberId = process.env.KAPSO_PHONE_NUMBER_ID;
  if (!apiKey || !phoneNumberId) return null;
  return { apiKey, phoneNumberId };
}

/**
 * Envía un mensaje de texto plano por WhatsApp.
 * @param to número en formato internacional sin + (ej. "5491100000000")
 */
export async function sendText(to: string, body: string): Promise<{ ok: boolean; status: number; data: any }> {
  const cfg = getKapsoConfig();
  if (!cfg) throw new Error('Kapso no configurado');

  const url = `${KAPSO_BASE}/meta/whatsapp/v24.0/${cfg.phoneNumberId}/messages`;
  const cleanTo = to.replace(/[^\d]/g, '');

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'X-API-Key': cfg.apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: cleanTo,
      type: 'text',
      text: { body: body.slice(0, 4000) }, // WA limit is ~4096
    }),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

/**
 * Verifica la firma HMAC-SHA256 del webhook de Kapso.
 * Header: X-Webhook-Signature (formato esperado: hex del HMAC sobre el raw body con la secret)
 */
export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.KAPSO_WEBHOOK_SECRET;
  if (!secret) {
    // Si no se configuró secret, dejamos pasar (modo dev). En prod conviene exigirlo.
    return true;
  }
  if (!signature) return false;
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  // Soporta tanto "hex" puro como prefijos tipo "sha256=hex"
  const clean = signature.replace(/^sha256=/, '');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(clean, 'hex'));
  } catch {
    return false;
  }
}

/**
 * Extrae el texto y el remitente de un webhook de Kapso.
 * El payload viene en formato Meta WhatsApp Cloud API.
 */
export function parseInboundMessage(payload: any): { from: string; text: string } | null {
  try {
    // Kapso envuelve: { event: "whatsapp.message.received", data: {...} }
    const data = payload?.data || payload;

    // Estructura típica de Cloud API:
    // data.entry[0].changes[0].value.messages[0] = { from, text: { body } }
    const message =
      data?.entry?.[0]?.changes?.[0]?.value?.messages?.[0] ||
      data?.messages?.[0] ||
      data?.message;

    if (!message) return null;

    const from = message.from || data?.contact?.wa_id || '';
    const text =
      message?.text?.body ||
      message?.text ||
      message?.button?.text ||
      message?.interactive?.button_reply?.title ||
      '';

    if (!from || !text) return null;
    return { from, text };
  } catch {
    return null;
  }
}
