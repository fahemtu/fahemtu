// Inscription email (Beehiiv) — endpoint serveur (rendu à la demande, pas prerendu).
// Reçoit l'email du « pic » de la démo et l'inscrit à la newsletter Beehiiv.
// La clé API reste côté serveur (jamais exposée au client, jamais logguée).
import type { APIRoute } from "astro";

export const prerender = false;

// Config serveur (jamais en dur / jamais exposée au client).
const BEEHIIV_API_KEY = import.meta.env.BEEHIIV_API_KEY;
const BEEHIIV_PUBLICATION_ID = import.meta.env.BEEHIIV_PUBLICATION_ID;
const APP_ORIGIN = import.meta.env.APP_ORIGIN || "http://localhost:5173";

// Validation email basique (côté serveur aussi).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": APP_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...corsHeaders() },
  });
}

// Préflight CORS (la démo peut tourner sur une autre origine en dev).
export const OPTIONS: APIRoute = () =>
  new Response(null, { status: 204, headers: corsHeaders() });

export const POST: APIRoute = async ({ request }) => {
  if (!BEEHIIV_API_KEY || !BEEHIIV_PUBLICATION_ID) {
    console.error("[subscribe] configuration Beehiiv manquante");
    return json(500, { error: "server_misconfigured" });
  }

  // Lecture + validation de l'email.
  let email: unknown;
  try {
    const body = (await request.json()) as { email?: unknown };
    email = body?.email;
  } catch {
    return json(400, { error: "invalid_body" });
  }
  if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    return json(400, { error: "invalid_email" });
  }
  const normalized = email.trim().toLowerCase();

  try {
    const res = await fetch(
      `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${BEEHIIV_API_KEY}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          email: normalized,
          reactivate_existing: true,
          utm_source: "fahemtu-decouvrir",
        }),
      },
    );

    // Beehiiv traite « déjà inscrit » comme un succès (réactivation) ; certaines
    // configs renvoient 200/201. On considère 2xx comme un succès.
    if (res.ok) {
      return json(200, { ok: true });
    }

    // Erreur côté Beehiiv : on logge le statut (jamais la clé) et on reste sobre.
    const detail = await res.text().catch(() => "");
    console.error(`[subscribe] Beehiiv ${res.status} ${detail}`);
    return json(502, { error: "subscribe_failed" });
  } catch (err) {
    console.error("[subscribe] erreur réseau :", err);
    return json(502, { error: "subscribe_failed" });
  }
};
