// Webhook Stripe — endpoint serveur (rendu à la demande, pas prerendu).
// Vérifie la signature, ne traite que les paiements aboutis, et accorde l'accès
// (entitlement) de façon idempotente. Toutes les clés sont lues côté serveur
// (variables NON préfixées PUBLIC_ → jamais exposées au client).
import type { APIRoute } from "astro";
import Stripe from "stripe";
import { createSupabaseAdmin } from "../../lib/supabase-admin";

export const prerender = false;

// Config serveur (jamais en dur / jamais exposée au client).
const STRIPE_SECRET_KEY = import.meta.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = import.meta.env.STRIPE_WEBHOOK_SECRET;
const SUPABASE_URL = import.meta.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = import.meta.env.SUPABASE_SECRET_KEY;
const STRIPE_PRICE_PRODUIT_1 = import.meta.env.STRIPE_PRICE_PRODUIT_1;

// Email d'accès (Resend) — best-effort, ne bloque jamais le webhook.
const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = import.meta.env.RESEND_FROM_EMAIL;
const APP_URL = import.meta.env.APP_URL;

// Mapping prix Stripe → produit interne (une entrée pour l'instant).
const PRICE_TO_PRODUCT: Record<string, string> = {};
if (STRIPE_PRICE_PRODUIT_1) PRICE_TO_PRODUCT[STRIPE_PRICE_PRODUIT_1] = "produit-1";

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

// Envoie l'email d'accès via l'API Resend. Lève en cas d'échec — l'appelant
// gère en best-effort (log + 200), ça ne doit jamais faire échouer le webhook.
async function sendAccessEmail(to: string): Promise<void> {
  if (!RESEND_API_KEY || !RESEND_FROM_EMAIL || !APP_URL) {
    console.warn("[stripe-webhook] email d'accès non configuré — envoi ignoré");
    return;
  }
  const html =
    `<p>Merci pour ton achat — tu as maintenant accès à Les mots qui débloquent l'arabe.</p>` +
    `<p>Pour commencer, accède au produit : <a href="${APP_URL}">${APP_URL}</a>.</p>` +
    `<p>Connecte-toi avec cette adresse (celle de ton achat) ; c'est elle qui ouvre ton accès. ` +
    `À chaque visite tu recevras un lien de connexion, puis ta session reste active.</p>` +
    `<p>Bon apprentissage.</p>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: RESEND_FROM_EMAIL,
      to,
      subject: "Ton accès à Fahemtu est prêt",
      html,
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Resend ${res.status} ${detail}`);
  }
}

export const POST: APIRoute = async ({ request }) => {
  if (
    !STRIPE_SECRET_KEY ||
    !STRIPE_WEBHOOK_SECRET ||
    !SUPABASE_URL ||
    !SUPABASE_SECRET_KEY
  ) {
    console.error("[stripe-webhook] configuration serveur manquante");
    return json(500, { error: "server_misconfigured" });
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY);

  // Vérification de signature : nécessite le corps BRUT + l'en-tête dédié.
  const signature = request.headers.get("stripe-signature");
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    if (!signature) throw new Error("en-tête stripe-signature manquant");
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("[stripe-webhook] signature invalide :", err);
    return json(400, { error: "invalid_signature" });
  }

  // On ne traite que les sessions de paiement abouties.
  if (event.type !== "checkout.session.completed") {
    return json(200, { received: true });
  }
  const session = event.data.object as Stripe.Checkout.Session;
  if (session.payment_status !== "paid") {
    return json(200, { received: true });
  }

  try {
    const email = session.customer_details?.email?.toLowerCase();
    if (!email) {
      console.error("[stripe-webhook] email client absent", session.id);
      return json(200, { received: true });
    }

    // Récupère le prix acheté pour le mapper à un produit interne.
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      limit: 1,
    });
    const priceId = lineItems.data[0]?.price?.id;
    const product = priceId ? PRICE_TO_PRODUCT[priceId] : undefined;
    if (!product) {
      console.warn("[stripe-webhook] prix non mappé, ignoré :", priceId);
      return json(200, { received: true });
    }

    // Upsert idempotent : un seul entitlement par (email, produit).
    // ignoreDuplicates + .select() → les lignes renvoyées = INSERTIONS réelles.
    // Résultat non vide = nouvel accès (on envoie l'email) ; vide = déjà
    // existant (renvoi du même événement) → pas d'email, pas de doublon.
    const supabase = createSupabaseAdmin(SUPABASE_URL, SUPABASE_SECRET_KEY);
    const { data: inserted, error } = await supabase
      .from("entitlements")
      .upsert(
        {
          email,
          product,
          source: "stripe",
          stripe_session_id: session.id,
        },
        { onConflict: "email,product", ignoreDuplicates: true },
      )
      .select();
    if (error) throw error; // l'upsert est critique → 500 (Stripe réessaiera)

    const isNewAccess = Array.isArray(inserted) && inserted.length > 0;

    // Email d'accès : uniquement sur une autorisation NOUVELLE, et best-effort
    // (un échec d'envoi ne doit pas faire échouer le webhook).
    if (isNewAccess) {
      try {
        await sendAccessEmail(email);
      } catch (mailErr) {
        console.error(
          "[stripe-webhook] envoi de l'email d'accès échoué (best-effort) :",
          mailErr,
        );
      }
    }

    return json(200, { received: true });
  } catch (err) {
    // Erreur de traitement → 500 : Stripe réessaiera l'événement.
    console.error("[stripe-webhook] échec de traitement :", err);
    return json(500, { error: "processing_failed" });
  }
};
