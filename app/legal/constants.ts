/**
 * ============================================================
 * CONSTANTES LÉGALES — THE PARFUMERIEE
 * ============================================================
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

export const LEGAL_CONSTANTS = {
  // ── IDENTITÉ DE L'ENTREPRISE ──────────────────────────────
  /** Raison sociale exacte telle qu'enregistrée */
  companyName: "THE PARFUMERIEE",

  /** Forme juridique : SAS, SARL, auto-entrepreneur, etc. */
  companyType: "À COMPLÉTER — ex : Auto-entrepreneur / SAS",

  /** Numéro SIRET (14 chiffres) — obtenu à l'immatriculation */
  companySIRET: "À COMPLÉTER — ex : 123 456 789 00012",

  /** Inscription au Registre du Commerce et des Sociétés */
  companyRCS: "À COMPLÉTER — ex : RCS Paris B 123 456 789",

  /** Numéro de TVA intracommunautaire (si assujetti) */
  companyVAT: "À COMPLÉTER — ex : FR12 123456789",

  // ── COORDONNÉES ───────────────────────────────────────────
  /** Adresse postale complète du siège social */
  companyAddress: "À COMPLÉTER — ex : 12 Rue du Commerce, 75015 Paris, France",

  /** Email de contact principal (affiché publiquement) */
  companyEmail: "À COMPLÉTER — ex : contact@theparfumeriee.com",

  /** Téléphone (optionnel mais recommandé pour les CGV) */
  companyPhone: "À COMPLÉTER — ex : +33 6 XX XX XX XX",

  /** URL du site en production */
  siteUrl: "À COMPLÉTER — ex : https://www.theparfumeriee.com",

  // ── RESPONSABLE LÉGAL ─────────────────────────────────────
  /**
   * Directeur de la publication — OBLIGATOIRE (loi LCEN art. 6-III)
   * Prénom + Nom du gérant / représentant légal
   */
  directeurPublication: "À COMPLÉTER — Prénom Nom du gérant",

  /**
   * Email DPO / Délégué à la Protection des Données
   * Peut être identique à companyEmail si pas de DPO désigné
   */
  dpoEmail: "À COMPLÉTER — ex : privacy@theparfumeriee.com",

  // ── HÉBERGEUR ─────────────────────────────────────────────
  // Vercel — ne pas modifier
  hostName: "Vercel Inc.",
  hostAddress: "340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis",
  hostWebsite: "https://vercel.com",

  // ── POLITIQUE COMMERCIALE ─────────────────────────────────
  /** Délai de livraison annoncé aux clients */
  deliveryDelay: "3 à 5 jours ouvrés",

  /** Seuil de livraison gratuite en euros */
  freeShippingThreshold: "100",

  /** Frais de port en dessous du seuil (en euros) */
  shippingCost: "5",

  /** Zone de livraison principale */
  deliveryZone: "France métropolitaine",
} as const;
