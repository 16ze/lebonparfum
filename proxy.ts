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
 * Proxy Next.js - Rate Limiting Global
 *
 * Applique des limites de taux différentes selon le type de route :
 * - Auth routes : 5 req/15min (protection brute force)
 * - Admin routes : 20 req/min
 * - API routes : 30 req/min
 * - Public routes : 100 req/min
 */

/**
 * Circuit breaker : après le premier échec réseau Upstash,
 * toutes les requêtes suivantes bypassent instantanément le rate limiting.
 * Reset uniquement au redémarrage du serveur.
 */
let upstashCircuitOpen = false;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip rate limiting si Upstash n'est pas configuré
  if (!authRateLimit || !adminRateLimit || !apiRateLimit || !publicRateLimit) {
    return NextResponse.next();
  }

  // Circuit breaker ouvert → bypass immédiat (0ms overhead)
  if (upstashCircuitOpen) {
    return NextResponse.next();
  }

  // Obtenir l'identifiant du client (IP)
  const identifier = getClientIdentifier(request);

  // Déterminer quel rate limiter utiliser selon la route
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

  try {
    // Timeout 500ms : si Upstash ne répond pas en 500ms, on fail-open
    const { success, limit, remaining, reset } = await Promise.race([
      rateLimit.limit(`${limitType}_${identifier}`),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("UPSTASH_TIMEOUT")), 500)
      ),
    ]);

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
            headers: { "Content-Type": "application/json" },
          }
        );

    response.headers.set("X-RateLimit-Limit", limit.toString());
    response.headers.set("X-RateLimit-Remaining", remaining.toString());
    response.headers.set("X-RateLimit-Reset", new Date(reset).toISOString());

    if (!success) {
      response.headers.set(
        "Retry-After",
        Math.floor((reset - Date.now()) / 1000).toString()
      );
      console.warn(
        `🚨 Rate limit dépassé : ${limitType} | IP: ${identifier} | Path: ${pathname}`
      );
    }

    return response;
  } catch (error) {
    // Erreur réseau ou timeout → ouvrir le circuit breaker
    const cause = (error as { cause?: { code?: string } })?.cause;
    const isNetworkError =
      cause?.code === "ENOTFOUND" || cause?.code === "ECONNREFUSED";
    const isTimeout = (error as Error).message === "UPSTASH_TIMEOUT";

    if (isNetworkError || isTimeout) {
      // Ouvrir le circuit : toutes les requêtes suivantes passent sans attente
      upstashCircuitOpen = true;
      console.warn(
        "⚠️  Rate limiting désactivé (circuit ouvert) : Upstash Redis injoignable. Toutes les requêtes passent en fail-open."
      );
    } else {
      console.error("❌ Erreur rate limiting inattendue:", error);
    }

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
