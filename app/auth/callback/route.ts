import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Route de callback OAuth (Google, etc.)
 *
 * CRITIQUE : Dans une Route API, il faut utiliser createServerClient directement
 * avec cookies() pour que les cookies de session soient correctement persistés.
 *
 * Flow :
 * 1. Google redirige vers /auth/callback?code=...
 * 2. On échange le code contre une session Supabase (avec cookies)
 * 3. On redirige vers /account (ou page spécifiée dans "next")
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  
  // Par défaut, on redirige vers /account si pas de paramètre "next"
  const next = searchParams.get("next") ?? "/account";

  console.log("🔵 [CALLBACK] Début traitement. Code reçu:", code ? "OUI" : "NON");
  console.log("🔵 [CALLBACK] Origin:", origin);
  console.log("🔵 [CALLBACK] Next:", next);

  if (code) {
    try {
      // CRITIQUE : Utiliser cookies() directement dans Route Handler
      const cookieStore = await cookies();

      // CRITIQUE : Créer le client Supabase avec gestion des cookies explicite
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },
            setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
              try {
                cookiesToSet.forEach(({ name, value, options }) =>
                  cookieStore.set(name, value, options)
                );
              } catch (error) {
                // Le `setAll` peut échouer si les cookies sont déjà définis
                // C'est acceptable, on ignore l'erreur
                console.warn("⚠️ [CALLBACK] Erreur setAll cookies (ignorée):", error);
              }
            },
          },
        }
      );

      console.log("🔄 [CALLBACK] Échange du code OAuth contre une session...");

      // Échange du code contre la session
      const { error, data } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        console.log("✅ [CALLBACK] Session créée avec succès !");
        console.log("👤 [CALLBACK] User:", data?.user?.email || "non disponible");

        // Récupérer le host forwarded pour Vercel/production
        const forwardedHost = request.headers.get("x-forwarded-host");
        const isLocal = origin.includes("localhost");

        // Construction de l'URL de redirection
        let redirectUrl: string;

        if (isLocal) {
          redirectUrl = `${origin}${next}`;
        } else if (forwardedHost) {
          redirectUrl = `https://${forwardedHost}${next}`;
        } else {
          redirectUrl = `${origin}${next}`;
        }

        console.log("✅ [CALLBACK] Redirection vers:", redirectUrl);
        return NextResponse.redirect(redirectUrl);
      } else {
        console.error("❌ [CALLBACK] Erreur échange code:", error.message);
        console.error("❌ [CALLBACK] Détails erreur:", {
          code: error.status,
          message: error.message,
          name: error.name,
        });
      }
    } catch (err) {
      console.error("❌ [CALLBACK] Erreur inattendue:", err);
      console.error("❌ [CALLBACK] Stack:", err instanceof Error ? err.stack : "N/A");
    }
  } else {
    console.error("❌ [CALLBACK] Aucun code reçu dans l'URL");
  }

  // Si échec, on renvoie vers une page d'erreur visible
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocal = origin.includes("localhost");
  
  const errorUrl = isLocal
    ? `${origin}/auth/auth-code-error`
    : forwardedHost
    ? `https://${forwardedHost}/auth/auth-code-error`
    : `${origin}/auth/auth-code-error`;

  console.log("⚠️ [CALLBACK] Redirection vers page d'erreur:", errorUrl);
  return NextResponse.redirect(errorUrl);
}
