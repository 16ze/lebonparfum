import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Optimisations de production
  compiler: {
    // Supprimer console.* en production (sauf console.error et console.warn)
    removeConsole: process.env.NODE_ENV === "production" ? {
      exclude: ["error", "warn"],
    } : false,
  },

  // Worktree : pointer vers le repo principal où se trouve node_modules
  turbopack: {
    root: path.resolve(__dirname, "../../.."),
  },

  // Autoriser les requêtes cross-origin depuis localhost en dev (preview tools)
  allowedDevOrigins: ["localhost", "127.0.0.1"],

  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    qualities: [75, 90],
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

          // Permissions Policy : désactive les API navigateur non utilisées
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), usb=(), payment=(), fullscreen=(self)",
          },

          // Content Security Policy (CSP)
          // Défense en profondeur contre XSS et injection de code
          {
            key: "Content-Security-Policy",
            value: [
              // Fallback global pour les types de contenu non couverts
              "default-src 'self'",
              // Scripts : unsafe-inline requis par Next.js (hydration inline scripts)
              // unsafe-eval restreint à la prod — Next.js Turbopack en a besoin en dev
              process.env.NODE_ENV === "production"
                ? "script-src 'self' 'unsafe-inline' https://js.stripe.com"
                : "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
              // Styles : unsafe-inline requis par Tailwind (styles générés au runtime)
              "style-src 'self' 'unsafe-inline'",
              // Images : self + data URIs + domaines externes autorisés
              "img-src 'self' data: blob: https://images.unsplash.com https://placehold.co https://*.supabase.co",
              // Fonts : self + data URIs (next/font auto-héberge Google Fonts)
              "font-src 'self' data:",
              // Connexions : self + Supabase + Stripe + Upstash + Sentry (via tunnel /monitoring = self)
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://q.stripe.com https://*.upstash.io",
              // Frames : Stripe uniquement (checkout embedded + 3D Secure)
              "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
              // Workers : Next.js service workers
              "worker-src 'self' blob:",
              // Base URI : interdit les injections via <base>
              "base-uri 'self'",
              // Form action : limite les destinations de formulaires
              "form-action 'self'",
              // Objets (Flash, plugins) : aucun
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

  // Enables automatic instrumentation for Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // automaticVercelMonitors: true,
});
