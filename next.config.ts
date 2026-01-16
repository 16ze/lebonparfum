import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimisations de production
  compiler: {
    // Supprimer console.* en production (sauf console.error et console.warn)
    removeConsole: process.env.NODE_ENV === "production" ? {
      exclude: ["error", "warn"],
    } : false,
  },

  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
        port: "",
        pathname: "/**",
      },
    ],
  },

  /**
   * Headers de sécurité HTTP
   * Protection contre XSS, clickjacking, MIME sniffing, etc.
   */
  async headers() {
    return [
      {
        // Appliquer à toutes les routes
        source: "/:path*",
        headers: [
          // DNS Prefetch Control : contrôle la résolution DNS anticipée
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },

          // Prévient le clickjacking (iframe embedding non autorisé)
          {
            key: "X-Frame-Options",
            value: "DENY",
          },

          // Prévient le MIME type sniffing (force le respect du Content-Type)
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },

          // Force HTTPS sur le domaine pendant 2 ans (63072000 secondes)
          // includeSubDomains : applique aussi aux sous-domaines
          // preload : permet l'inscription dans la liste HSTS preload des navigateurs
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },

          // Contrôle le référent envoyé lors de la navigation
          // origin-when-cross-origin : envoie l'origine complète en same-origin,
          // seulement l'origine en cross-origin
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },

          // Permissions Policy (anciennement Feature-Policy)
          // Désactive les fonctionnalités dangereuses non utilisées
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },

          // Content Security Policy (CSP)
          // Défense en profondeur contre XSS et injection de code
          {
            key: "Content-Security-Policy",
            value: [
              // Script sources : self + inline (pour Next.js) + eval (pour dev)
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
              // Styles : self + inline (pour Tailwind)
              "style-src 'self' 'unsafe-inline'",
              // Images : self + data URIs + domaines externes autorisés
              "img-src 'self' data: https://images.unsplash.com https://placehold.co https://*.supabase.co",
              // Fonts : self + data URIs
              "font-src 'self' data:",
              // Connexions (fetch, XHR, WebSocket) : self + Supabase + Stripe + Upstash
              "connect-src 'self' https://*.supabase.co https://api.stripe.com https://*.upstash.io wss://*.supabase.co",
              // Frames : Stripe uniquement (pour checkout embedded)
              "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
              // Base URI : limite les URLs de base
              "base-uri 'self'",
              // Form action : limite les destinations de formulaires
              "form-action 'self'",
              // Objets (Flash, etc.) : aucun
              "object-src 'none'",
              // Upgrade insecure requests : force HTTPS
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

// Make sure adding Sentry options is the last code to run before exporting
export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: "kairo-digital",
  project: "javascript-nextjs-lx",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for better debugging
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation for Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // automaticVercelMonitors: true,
});
