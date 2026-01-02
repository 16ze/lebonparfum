import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

/**
 * Middleware Next.js 15 - Gestion de la session Supabase
 *
 * Ce middleware s'exécute sur toutes les routes pour rafraîchir
 * automatiquement les tokens d'authentification Supabase.
 *
 * Pas de logique de redirection pour l'instant - uniquement le refresh des sessions.
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

/**
 * Matcher configuration
 * Exclut les fichiers statiques pour éviter de surcharger le middleware
 */
export const config = {
  matcher: [
    /*
     * Match toutes les routes SAUF :
     * - _next/static (fichiers statiques Next.js)
     * - _next/image (optimisation d'images)
     * - favicon.ico (icône du site)
     * - Images, fonts, etc. (.*\\.(?:jpg|jpeg|gif|png|svg|ico|webp|woff|woff2|ttf|otf))
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf)$).*)",
  ],
};

