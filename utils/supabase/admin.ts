import { createClient } from "@supabase/supabase-js";

/**
 * createAdminClient - Crée un client Supabase avec SERVICE_ROLE_KEY
 *
 * ⚠️ ATTENTION : Cette clé bypass RLS et donne accès complet à la base
 * Utiliser UNIQUEMENT côté serveur pour les opérations admin (updates, deletes)
 *
 * Utilisation :
 *   const supabase = createAdminClient();
 *   const { data } = await supabase.from('products').update({ stock: 5 });
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définis"
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

