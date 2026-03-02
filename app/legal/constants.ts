/**
 * ============================================================
 * CONSTANTES LÉGALES
 * ============================================================
 *
 * Le nom de la marque, l'URL et les coordonnées de base sont
 * dérivés de lib/site.config.ts — source unique de vérité.
 *
 * ⚠️  AVANT LA MISE EN LIGNE : remplissez tous les champs
 *     marqués "À COMPLÉTER". Un seul fichier à modifier,
 *     toutes les pages légales se mettent à jour automatiquement.
 *
 * Pages impactées :
 *  - /legal/mentions     → Mentions légales
 *  - /legal/terms        → CGV
 *  - /legal/privacy      → Politique de confidentialité
 *  - /legal/returns      → Retours & remboursements
 *  - /legal/cookies      → Politique des cookies
 * ============================================================
 */

import { SITE_CONFIG } from "@/lib/site.config";

export const LEGAL_CONSTANTS = {
  // ── IDENTITÉ DE L'ENTREPRISE ──────────────────────────────
  /** Raison sociale — héritée de SITE_CONFIG.company.name */
  companyName: SITE_CONFIG.company.name,

  /** Forme juridique : SAS, SARL, auto-entrepreneur, etc. */
  companyType: SITE_CONFIG.company.type,

  /** Numéro SIRET (14 chiffres) — À compléter dans lib/site.config.ts */
  companySIRET: SITE_CONFIG.company.siret,

  /** Inscription au Registre du Commerce et des Sociétés */
  companyRCS: SITE_CONFIG.company.rcs,

  /** Numéro de TVA intracommunautaire (si assujetti) */
  companyVAT: SITE_CONFIG.company.vat,

  // ── COORDONNÉES ───────────────────────────────────────────
  /** Adresse postale complète du siège social */
  companyAddress: SITE_CONFIG.company.address.street
    ? `${SITE_CONFIG.company.address.street}, ${SITE_CONFIG.company.address.postalCode} ${SITE_CONFIG.company.address.city}, ${SITE_CONFIG.company.address.country}`
    : "À COMPLÉTER — ex : 12 Rue du Commerce, 75015 Paris, France",

  /** Email de contact principal — héritée de SITE_CONFIG.contact.email */
  companyEmail: SITE_CONFIG.contact.email,

  /** Téléphone (optionnel mais recommandé pour les CGV) */
  companyPhone: SITE_CONFIG.contact.phone,

  /** URL du site en production — héritée de SITE_CONFIG.url */
  siteUrl: SITE_CONFIG.url,

  // ── RESPONSABLE LÉGAL ─────────────────────────────────────
  /**
   * Directeur de la publication — OBLIGATOIRE (loi LCEN art. 6-III)
   * À compléter manuellement (Prénom + Nom du gérant)
   */
  directeurPublication: "À COMPLÉTER — Prénom Nom du gérant",

  /**
   * Email DPO / Délégué à la Protection des Données
   * Peut être identique à companyEmail si pas de DPO désigné
   */
  dpoEmail: "À COMPLÉTER — ex : privacy@domain.com",

  // ── HÉBERGEUR ─────────────────────────────────────────────
  // Dérivé de SITE_CONFIG.hosting — ne pas modifier ici
  hostName: SITE_CONFIG.hosting.name,
  hostAddress: SITE_CONFIG.hosting.address,
  hostWebsite: SITE_CONFIG.hosting.website,

  // ── POLITIQUE COMMERCIALE ─────────────────────────────────
  /** Délai de livraison annoncé aux clients */
  deliveryDelay: "3 à 5 jours ouvrés",

  /** Seuil de livraison gratuite en euros (depuis SITE_CONFIG.ecommerce) */
  freeShippingThreshold: String(SITE_CONFIG.ecommerce.freeShippingThreshold / 100),

  /** Frais de port en dessous du seuil (en euros) */
  shippingCost: "5",

  /** Zone de livraison principale */
  deliveryZone: "France métropolitaine",
} as const;
