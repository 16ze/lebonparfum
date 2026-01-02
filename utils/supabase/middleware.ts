import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Middleware helper pour rafraîchir la session Auth Supabase
 * Utilise les cookies request/response pour propager les tokens
 *
 * Usage dans middleware.ts :
 * import { updateSession } from '@/utils/supabase/middleware'
 * export async function middleware(request: NextRequest) {
 *   return await updateSession(request)
 * }
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Set cookies dans la request (pour le reste du middleware chain)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );

          // Créer une nouvelle response avec les cookies mis à jour
          supabaseResponse = NextResponse.next({
            request,
          });

          // Set cookies dans la response (pour le client)
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // CRITICAL : Ne pas utiliser uniquement `await supabase.auth.getUser()`
  // getUser() ne vérifie pas le JWT et peut être falsifié
  // getUser() est plus rapide mais moins sécurisé
  // Pour plus de sécurité, utilisez getSession() qui valide le token
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Pas de logique de redirection ici pour l'instant
  // On retourne juste la response avec les cookies rafraîchis
  return supabaseResponse;
}

