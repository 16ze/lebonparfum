import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Route de callback OAuth (Google, etc.)
 *
 * Gère le retour après authentification OAuth
 * Échange le code OAuth contre une session Supabase
 * Redirige vers /account (ou page personnalisée via paramètre "next")
 *
 * Flow :
 * 1. Google redirige vers /auth/callback?code=...
 * 2. On échange le code contre une session Supabase
 * 3. On redirige vers /account (ou page spécifiée dans "next")
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  
  // Si un paramètre "next" est fourni, on l'utilise, sinon /account par défaut
  const next = searchParams.get("next") ?? "/account";

  if (code) {
    const supabase = await createClient();

    // Échanger le code OAuth contre une session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Récupérer le host forwarded pour Vercel/production
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocal = origin.includes("localhost");

      // Construction de l'URL de redirection
      let redirectUrl: string;
      
      if (isLocal) {
        // En local, utiliser l'origin directement
        redirectUrl = `${origin}${next}`;
      } else if (forwardedHost) {
        // En production (Vercel), utiliser le host forwarded
        redirectUrl = `https://${forwardedHost}${next}`;
      } else {
        // Fallback : utiliser l'origin
        redirectUrl = `${origin}${next}`;
      }

      console.log("✅ OAuth callback réussi - Redirection vers:", redirectUrl);
      return NextResponse.redirect(redirectUrl);
    } else {
      // Erreur lors de l'échange du code
      console.error("❌ Erreur échange code OAuth:", error.message);
    }
  }

  // Si erreur ou pas de code, retour vers la page d'erreur
  const errorUrl = origin.includes("localhost")
    ? `${origin}/auth/auth-code-error`
    : forwardedHost
    ? `https://${forwardedHost}/auth/auth-code-error`
    : `${origin}/auth/auth-code-error`;

  return NextResponse.redirect(errorUrl);
}
