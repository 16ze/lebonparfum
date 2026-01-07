import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

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
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // Par défaut, on redirige vers /account si pas de paramètre "next"
  const next = searchParams.get("next") ?? "/account";

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
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
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    // C'EST ICI QUE LA MAGIE OPÈRE : Echange du code contre la session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Si ça marche, on redirige vers le site connecté
      const forwardedHost = request.headers.get("x-forwarded-host"); // Pour Vercel
      const isLocal = origin.includes("localhost");

      if (isLocal) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // Si erreur ou pas de code, retour à l'accueil avec erreur
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
