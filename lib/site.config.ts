import { activeTheme } from "@/theme.active"

/**
 * ============================================================
 * FICHIER DE CONFIGURATION CENTRALE — À MODIFIER POUR CHAQUE MARQUE
 * ============================================================
 *
 * Ce fichier est le SEUL point de configuration à changer pour déployer
 * cette template sur un nouveau produit/marque.
 *
 * Workflow pour une nouvelle marque :
 * 1. Modifier les valeurs ci-dessous (name, tagline, contact, company)
 * 2. Changer le thème : remplacer `byredoTheme` par un autre (ex: luxeDoreTheme)
 * 3. Mettre à jour les variables d'environnement (.env.local / Vercel)
 * 4. Ajouter les produits en DB
 *
 * Les champs marqués [ENV] doivent aussi avoir leur correspondant en .env.local
 * ============================================================
 */

export const SITE_CONFIG = {
  // ─── Identité de marque ───────────────────────────────────────────────
  /** Nom de la marque — affiché dans le header, footer, emails, SEO */
  name: "THE PARFUMERIEE",

  /** Tagline courte — utilisée dans les sous-titres et descriptions */
  tagline: "Parfums de Niche & Collections Exclusives",

  /** Description longue — utilisée pour les meta description et JSON-LD */
  description:
    "Découvrez notre sélection de parfums de niche et collections exclusives. Des fragrances d'exception pour les esprits indépendants.",

  // ─── URLs [ENV] ───────────────────────────────────────────────────────
  /** URL publique du site — doit correspondre à NEXT_PUBLIC_SITE_URL */
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://lebonparfum.com",

  // ─── Contact [ENV] ────────────────────────────────────────────────────
  contact: {
    /** Email public affiché dans le footer, emails transactionnels */
    email: process.env.CONTACT_EMAIL || "contact@lebonparfum.com",
    /** Email admin pour les notifications internes [ENV: ADMIN_EMAIL] */
    adminEmail: process.env.ADMIN_EMAIL || "admin@lebonparfum.com",
    phone: "+33 1 23 45 67 89",
  },

  // ─── Réseaux sociaux ─────────────────────────────────────────────────
  social: {
    instagram: "@lebonparfum",
    twitter: "@lebonparfum",
    instagramUrl: "https://instagram.com/lebonparfum",
    facebookUrl: "https://facebook.com/lebonparfum",
  },

  // ─── Entreprise (légal) ───────────────────────────────────────────────
  company: {
    /** Raison sociale officielle */
    name: "THE PARFUMERIEE",
    /** Nom légal complet — utilisé dans les schémas JSON-LD Organization */
    legalName: "THE PARFUMERIEE",
    /** Type de structure — À compléter avant mise en production */
    type: "À COMPLÉTER — ex : SAS / Auto-entrepreneur",
    /** Numéro SIRET — À compléter une fois obtenu */
    siret: "À COMPLÉTER",
    /** Numéro RCS — À compléter */
    rcs: "À COMPLÉTER",
    /** Numéro TVA intracommunautaire — À compléter */
    vat: "À COMPLÉTER",
    /** Adresse du siège social */
    address: {
      street: "À COMPLÉTER",
      city: "À COMPLÉTER",
      postalCode: "À COMPLÉTER",
      country: "France",
    },
  },

  // ─── Hébergement (légal) ─────────────────────────────────────────────
  hosting: {
    name: "Vercel Inc.",
    address: "340 Pine Street, Suite 701, San Francisco, CA 94104, USA",
    website: "https://vercel.com",
  },

  // ─── Thème visuel ─────────────────────────────────────────────────────
  /**
   * Thème actif — changer l'import en haut du fichier pour switcher.
   * Thèmes disponibles :
   *   - byredoTheme     → Noir/Blanc brutaliste (parfums, mode, cosmétiques niche)
   *   - luxeDoreTheme   → Crème/Or chaleureux (bijoux, vin, hôtellerie)
   *
   * Pour créer un nouveau thème :
   *   1. Créer themes/mon-theme.ts en implémentant l'interface Theme
   *   2. Importer ici et remplacer byredoTheme
   */
  // Thème injecté depuis theme.active.ts — modifier ce fichier pour changer de thème
  theme: activeTheme,

  // ─── Paramètres e-commerce ────────────────────────────────────────────
  ecommerce: {
    /** Devise — utilisée pour le formatage des prix */
    currency: "EUR",
    /** Locale — utilisée pour Intl.NumberFormat */
    locale: "fr-FR",
    /** Nombre de points de fidélité par euro dépensé */
    loyaltyPointsPerEuro: 1,
    /** Seuil de stock bas déclenchant l'alerte admin */
    lowStockThreshold: 3,
    /** Livraison gratuite au-dessus de ce montant (en centimes) */
    freeShippingThreshold: 5000, // 50€
  },
} as const

/** Type inféré de SITE_CONFIG pour usage dans les composants */
export type SiteConfig = typeof SITE_CONFIG
