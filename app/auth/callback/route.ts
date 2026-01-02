import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Route de callback OAuth (Google, etc.)
 *
 * Gère le retour après authentification OAuth
 * Échange le code OAuth contre une session Supabase
 * Redirige vers /account pour déterminer le rôle
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();

    // Échanger le code OAuth contre une session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("❌ Erreur échange code OAuth:", error.message);
      // Rediriger vers login avec erreur
      return NextResponse.redirect(
        `${origin}/login?error=auth_callback_error`
      );
    }
  }

  // Rediriger vers /account qui fera la redirection intelligente (admin vs client)
  return NextResponse.redirect(`${origin}/account`);
}
