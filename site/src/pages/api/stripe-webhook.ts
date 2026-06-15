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

// Mapping prix Stripe → produit interne (une entrée pour l'instant).
const PRICE_TO_PRODUCT: Record<string, string> = {};
if (STRIPE_PRICE_PRODUIT_1) PRICE_TO_PRODUCT[STRIPE_PRICE_PRODUIT_1] = "produit-1";

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
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
    const supabase = createSupabaseAdmin(SUPABASE_URL, SUPABASE_SECRET_KEY);
    const { error } = await supabase.from("entitlements").upsert(
      {
        email,
        product,
        source: "stripe",
        stripe_session_id: session.id,
      },
      { onConflict: "email,product" },
    );
    if (error) throw error;

    return json(200, { received: true });
  } catch (err) {
    // Erreur de traitement → 500 : Stripe réessaiera l'événement.
    console.error("[stripe-webhook] échec de traitement :", err);
    return json(500, { error: "processing_failed" });
  }
};
