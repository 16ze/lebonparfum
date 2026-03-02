import type { Theme } from "./types"

/**
 * Thème BYREDO — Minimalisme brutaliste, "Unapologetic Luxury"
 *
 * Identité visuelle : Noir pur + Blanc. Zéro compromis.
 * Typographie : Uppercase avec tracking prononcé.
 * Formes : Angles droits (0px radius), plat (aucune ombre).
 * Inspiration : byredo.com, Maison Margiela, Rick Owens.
 *
 * C'est le thème par défaut de la template.
 * Idéal pour : Parfums, Cosmétiques niche, Mode, Horlogerie.
 */
export const byredoTheme: Theme = {
  name: "Byredo",

  colors: {
    // Noir absolu — la couleur primaire dans l'univers brutaliste
    primary: "#000000",
    primaryForeground: "#FFFFFF",

    // Blanc — la couleur secondaire, le vide, le silence
    secondary: "#FFFFFF",
    secondaryForeground: "#000000",

    // L'accent reste dans le noir pour rester cohérent
    accent: "#000000",
    accentForeground: "#FFFFFF",

    // Fond de page : blanc pur
    background: "#FFFFFF",
    foreground: "#000000",

    // Off-white subtil pour les surfaces (drawers, cards, inputs)
    muted: "#F9F9F9",
    mutedForeground: "#6B6B6B",

    // Bordures 1px noires — la seule décoration autorisée
    border: "#000000",

    // Surface des overlays et modals
    surface: "#FFFFFF",
  },

  typography: {
    fontFamily: "Inter",
    // Tracking prononcé = signature visuelle Byredo
    letterSpacing: "0.15em",
  },

  // Angles droits — aucun compromis
  borderRadius: "0px",

  // Flat design — zéro ombre portée
  shadows: "none",
}
