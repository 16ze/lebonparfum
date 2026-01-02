import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Crée un client Supabase pour les Server Components et Server Actions (Next.js 15)
 * IMPORTANT : cookies() est async dans Next.js 15 → await cookies()
 *
 * Usage :
 * - Server Components : const supabase = await createClient()
 * - Server Actions : const supabase = await createClient()
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
            // setAll peut être appelé depuis un Server Component
            // Le middleware gère le refresh des sessions, donc on ignore l'erreur
          }
        },
      },
    }
  );
}



