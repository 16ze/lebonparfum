import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Créer un client Supabase pour Server Components et Server Actions
 *
 * Utilise les cookies pour maintenir la session utilisateur
 * Compatible avec Next.js 15 (async cookies)
 */
export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Variables d'environnement Supabase manquantes : NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY sont requises."
    );
  }

  const cookieStore = await cookies();

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Le `setAll` peut échouer dans Server Components
            // Cela est acceptable car les cookies sont déjà définis
          }
        },
      },
    }
  );
}
