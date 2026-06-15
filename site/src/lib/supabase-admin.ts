// Client Supabase SERVEUR dédié — créé avec la clé secrète (jamais la
// publishable). Réservé au code serveur (endpoints). persistSession: false :
// pas de session à conserver côté serveur. Ne pas réutiliser un client front.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function createSupabaseAdmin(
  url: string,
  secretKey: string,
): SupabaseClient {
  return createClient(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
