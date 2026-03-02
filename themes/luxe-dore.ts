import type { Theme } from "./types"

/**
 * Thème LUXE DORÉ — Raffinement chaleureux, "Old Money Aesthetic"
 *
 * Identité visuelle : Crème ivoire + Or mat. Sophistiqué sans ostentation.
 * Typographie : Uppercase avec tracking modéré, légèrement plus aéré.
 * Formes : Très légèrement arrondis (2px), ombres subtiles.
 * Inspiration : Hermès, Cartier, maisons de joaillerie.
 *
 * Idéal pour : Bijoux, Horlogerie premium, Vin & Spiritueux,
 *              Hôtellerie de luxe, Cosmétiques prestige.
 *
 * Usage : Dans lib/site.config.ts, remplacer :
 *   theme: byredoTheme → theme: luxeDoreTheme
 */
export const luxeDoreTheme: Theme = {
  name: "Luxe Doré",

  colors: {
    // Or mat chaleureux — couleur primaire identitaire
    primary: "#C9A84C",
    primaryForeground: "#FFFFFF",

    // Crème ivoire — la secondary, chaude et douce
    secondary: "#F5F0E8",
    secondaryForeground: "#1A1208",

    // Or plus profond pour les hover/sélections
    accent: "#A8892E",
    accentForeground: "#FFFFFF",

    // Fond : blanc-cassé légèrement chaud
    background: "#FAFAF7",
    foreground: "#1A1208",

    // Surfaces : ivoire très subtil
    muted: "#F0EBE1",
    mutedForeground: "#7A6A50",

    // Bordures or mat — raffinées
    border: "#C9A84C",

    // Surface des composants : blanc chaud
    surface: "#F5F0E8",
  },

  typography: {
    fontFamily: "Inter",
    // Tracking légèrement moins prononcé — plus élégant
    letterSpacing: "0.10em",
  },

  // Légèrement arrondi — adoucit sans perdre l'élégance
  borderRadius: "2px",

  // Ombres très légères — donne de la profondeur sans vulgarité
  shadows: "sm",
}
