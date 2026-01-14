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

          // Force HTTPS sur le domaine pendant 2 ans (31536000 secondes)
          // includeSubDomains : applique aussi aux sous-domaines
          // preload : permet l'inscription dans la liste HSTS preload des navigateurs
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },

          // Contrôle le référent envoyé lors de la navigation
          // strict-origin-when-cross-origin : envoie l'origine complète en same-origin,
          // seulement l'origine en cross-origin HTTPS, rien en HTTP
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
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

export default nextConfig;
