// Fahemtu — récupère les URLs signées des assets et alimente le store.
// Appelé par l'AuthGate une fois l'utilisateur autorisé, avant de rendre l'app.
// Chemin racine-absolu /api/asset-urls (slash initial) → insensible à la base
// /app/ ; proxifié vers le site en dev (cf. vite.config), même origine en prod.

import { supabase } from "./supabase";
import { setAssetUrls } from "./assetUrls";

export async function fetchAssetUrls(): Promise<void> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Aucun token de session (non connecté).");

  const res = await fetch("/api/asset-urls", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`Échec /api/asset-urls (${res.status}).`);
  }

  const body = (await res.json()) as { assets?: Record<string, string> };
  if (!body || typeof body.assets !== "object" || body.assets === null) {
    throw new Error("Réponse /api/asset-urls inattendue.");
  }
  setAssetUrls(body.assets);
}
