import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  authRateLimit,
  adminRateLimit,
  apiRateLimit,
  publicRateLimit,
  getClientIdentifier,
} from "@/lib/rate-limit";

/**
 * Middleware Next.js - Rate Limiting Global
 *
 * Applique des limites de taux différentes selon le type de route :
 * - Auth routes : 5 req/15min (protection brute force)
 * - Admin routes : 20 req/min
 * - API routes : 30 req/min
 * - Public routes : 100 req/min
 */

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip rate limiting en développement si Upstash n'est pas configuré
  if (!authRateLimit || !adminRateLimit || !apiRateLimit || !publicRateLimit) {
    console.warn(
      "⚠️  Rate limiting désactivé : Variables Upstash manquantes (UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN)"
    );
    return NextResponse.next();
  }

  // Obtenir l'identifiant du client (IP)
  const identifier = getClientIdentifier(request);

  // Déterminer quel rate limiter utiliser
  let rateLimit;
  let limitType = "public";

  if (pathname.startsWith("/api/auth/")) {
    rateLimit = authRateLimit;
    limitType = "auth";
  } else if (pathname.startsWith("/api/admin/")) {
    rateLimit = adminRateLimit;
    limitType = "admin";
  } else if (pathname.startsWith("/api/")) {
    rateLimit = apiRateLimit;
    limitType = "api";
  } else {
    rateLimit = publicRateLimit;
    limitType = "public";
  }

  // Vérifier la limite
  try {
    const { success, limit, remaining, reset } = await rateLimit.limit(
      `${limitType}_${identifier}`
    );

    // Headers de rate limiting (standard RFC)
    const response = success
      ? NextResponse.next()
      : NextResponse.json(
          {
            error: "Trop de requêtes. Veuillez réessayer plus tard.",
            type: "RATE_LIMIT_EXCEEDED",
            retryAfter: Math.floor((reset - Date.now()) / 1000),
          },
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

    // Ajouter les headers de rate limiting à toutes les réponses
    response.headers.set("X-RateLimit-Limit", limit.toString());
    response.headers.set("X-RateLimit-Remaining", remaining.toString());
    response.headers.set("X-RateLimit-Reset", new Date(reset).toISOString());

    // Si rate limit dépassé, ajouter Retry-After header
    if (!success) {
      const retryAfter = Math.floor((reset - Date.now()) / 1000);
      response.headers.set("Retry-After", retryAfter.toString());

      console.warn(
        `🚨 Rate limit dépassé : ${limitType} | IP: ${identifier} | Path: ${pathname}`
      );
    }

    return response;
  } catch (error) {
    // En cas d'erreur Redis, laisser passer la requête (fail-open)
    console.error("❌ Erreur rate limiting:", error);
    return NextResponse.next();
  }
}

/**
 * Configuration du matcher
 * Applique le middleware sur toutes les routes sauf :
 * - Assets statiques (_next/static, _next/image)
 * - Favicon et autres fichiers publics
 */
export const config = {
  matcher: [
    /*
     * Match toutes les routes sauf :
     * - _next/static (fichiers statiques)
     * - _next/image (optimisation d'images)
     * - favicon.ico (favicon)
     * - Fichiers publics (.svg, .png, .jpg, .jpeg, .gif, .webp)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
