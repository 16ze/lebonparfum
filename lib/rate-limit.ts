import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Rate Limiting avec Upstash Redis
 *
 * Protection contre les attaques par force brute et les abus d'API.
 * Utilise un système de sliding window pour limiter les requêtes.
 */

// Créer l'instance Redis (ne s'initialise que si les variables d'env sont présentes)
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

/**
 * TIER 1 : Routes d'authentification (STRICT)
 * Limite : 5 tentatives par 15 minutes
 * Appliqué sur : /api/auth/*, login, register, reset-password
 */
export const authRateLimit = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(5, "15 m"),
      analytics: true,
      prefix: "@ratelimit/auth",
    })
  : null;

/**
 * TIER 2 : Routes API Admin (MODÉRÉ)
 * Limite : 20 requêtes par minute
 * Appliqué sur : /api/admin/*
 */
export const adminRateLimit = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(20, "1 m"),
      analytics: true,
      prefix: "@ratelimit/admin",
    })
  : null;

/**
 * TIER 3 : Routes API générales (NORMAL)
 * Limite : 30 requêtes par minute
 * Appliqué sur : /api/* (sauf auth et admin)
 */
export const apiRateLimit = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(30, "1 m"),
      analytics: true,
      prefix: "@ratelimit/api",
    })
  : null;

/**
 * TIER 4 : Pages publiques (GÉNÉREUX)
 * Limite : 100 requêtes par minute
 * Appliqué sur : toutes les autres routes
 */
export const publicRateLimit = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(100, "1 m"),
      analytics: true,
      prefix: "@ratelimit/public",
    })
  : null;

/**
 * Helper pour obtenir un identifiant unique par requête
 * Utilise l'IP du client, ou un fallback pour le développement local
 */
export function getClientIdentifier(request: Request): string {
  // Vérifier les headers de proxies (Vercel, Cloudflare, etc.)
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  // Fallback pour développement local
  return "development-ip";
}

/**
 * Types pour les réponses de rate limiting
 */
export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}
