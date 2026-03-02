import type { Theme } from "./types"

// Re-export des thèmes disponibles
export { byredoTheme } from "./byredo"
export { luxeDoreTheme } from "./luxe-dore"
export type { Theme }

/**
 * Génère un objet de CSS Custom Properties à partir d'un objet Theme.
 * Utilisé par le plugin Tailwind dans tailwind.config.ts pour injecter
 * les CSS vars au niveau :root via addBase().
 *
 * Exemple de sortie :
 * { "--color-primary": "#000000", "--color-background": "#FFFFFF", ... }
 *
 * @param theme - L'objet thème actif (depuis activeTheme dans theme.active.ts)
 * @returns Objet Record<string, string> de CSS Custom Properties
 */
export function generateCSSVarsObject(theme: Theme): Record<string, string> {
  return {
    // Couleurs
    "--color-primary": theme.colors.primary,
    "--color-primary-foreground": theme.colors.primaryForeground,
    "--color-secondary": theme.colors.secondary,
    "--color-secondary-foreground": theme.colors.secondaryForeground,
    "--color-accent": theme.colors.accent,
    "--color-accent-foreground": theme.colors.accentForeground,
    "--color-background": theme.colors.background,
    "--color-foreground": theme.colors.foreground,
    "--color-muted": theme.colors.muted,
    "--color-muted-foreground": theme.colors.mutedForeground,
    "--color-border": theme.colors.border,
    "--color-surface": theme.colors.surface,

    // Typographie
    "--letter-spacing-brand": theme.typography.letterSpacing,

    // Formes
    "--border-radius-brand": theme.borderRadius,
  }
}

/**
 * Registre de tous les thèmes disponibles.
 * Utile pour un futur sélecteur de thème dans l'admin.
 */
export const THEME_REGISTRY = {
  byredo: () => import("./byredo").then((m) => m.byredoTheme),
  "luxe-dore": () => import("./luxe-dore").then((m) => m.luxeDoreTheme),
} as const

export type ThemeKey = keyof typeof THEME_REGISTRY
