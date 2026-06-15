// Fahemtu — client Supabase unique (fondation).
// Lit la config depuis les variables d'environnement Vite (préfixe VITE_).
// Session persistée + rafraîchissement auto du token pour garder l'utilisateur
// connecté entre les visites. Aucune UI/vérification ici : juste le client.

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Configuration Supabase manquante : définis VITE_SUPABASE_URL et " +
      "VITE_SUPABASE_PUBLISHABLE_KEY dans .env.local (voir .env.example).",
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
