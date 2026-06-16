// URLs signées des assets — endpoint serveur (rendu à la demande, pas prerendu).
// Palier 2 de la protection du contenu : vérifie l'auth + l'autorisation de
// l'appelant, puis renvoie des URLs signées temporaires pour les fichiers du
// bucket PRIVÉ « produit-1 ». Aucune clé exposée au client.
import type { APIRoute } from "astro";
import { createSupabaseAdmin } from "../../lib/supabase-admin";

export const prerender = false;

// Config serveur (jamais en dur / jamais exposée au client).
const SUPABASE_URL = import.meta.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = import.meta.env.SUPABASE_SECRET_KEY;
const APP_ORIGIN = import.meta.env.APP_ORIGIN || "http://localhost:5173";

const BUCKET = "produit-1";
const PRODUCT = "produit-1";
const FOLDERS = ["images", "audio"];
const SIGNED_URL_TTL = 60 * 60 * 4; // ~4 h

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": APP_ORIGIN,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    Vary: "Origin",
  };
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...corsHeaders() },
  });
}

// Préflight CORS (l'app tourne sur une autre origine).
export const OPTIONS: APIRoute = () =>
  new Response(null, { status: 204, headers: corsHeaders() });

export const GET: APIRoute = async ({ request }) => {
  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
    console.error("[asset-urls] configuration serveur manquante");
    return json(500, { error: "server_misconfigured" });
  }

  // 1) Token d'accès dans l'en-tête Authorization: Bearer <token>.
  const auth = request.headers.get("authorization") ?? "";
  const token = auth.toLowerCase().startsWith("bearer ")
    ? auth.slice(7).trim()
    : "";
  if (!token) return json(401, { error: "missing_token" });

  const supabase = createSupabaseAdmin(SUPABASE_URL, SUPABASE_SECRET_KEY);

  try {
    // 2) Valide le token → utilisateur.
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    const email = userData?.user?.email?.toLowerCase();
    if (userErr || !email) return json(401, { error: "invalid_token" });

    // 3) Autorisation : une ligne entitlements pour (email, produit-1) ?
    //    (client admin = pas de RLS → on filtre explicitement par email.)
    const { data: ent, error: entErr } = await supabase
      .from("entitlements")
      .select("product")
      .eq("product", PRODUCT)
      .eq("email", email)
      .maybeSingle();
    if (entErr) throw entErr;
    if (!ent) return json(403, { error: "not_entitled" });

    // 4) Liste le bucket (images/ + audio/) puis signe en lot.
    const paths: string[] = [];
    for (const folder of FOLDERS) {
      const { data: files, error: listErr } = await supabase.storage
        .from(BUCKET)
        .list(folder, { limit: 1000 });
      if (listErr) throw listErr;
      for (const f of files ?? []) {
        // Ignore les dossiers / placeholders (les fichiers ont un id non nul).
        if (!f.id || !f.name) continue;
        paths.push(`${folder}/${f.name}`);
      }
    }

    const { data: signed, error: signErr } = await supabase.storage
      .from(BUCKET)
      .createSignedUrls(paths, SIGNED_URL_TTL);
    if (signErr) throw signErr;

    const assets: Record<string, string> = {};
    for (const s of signed ?? []) {
      if (s.signedUrl && s.path) assets[s.path] = s.signedUrl;
    }

    return json(200, { assets });
  } catch (err) {
    console.error("[asset-urls] erreur serveur :", err);
    return json(500, { error: "internal_error" });
  }
};
