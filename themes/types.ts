/**
 * Interface définissant la structure d'un thème visuel.
 * Chaque propriété correspond à une CSS Custom Property injectée au niveau :root.
 * Pour créer un nouveau thème, implémenter cette interface dans un fichier dédié
 * (ex: themes/mon-nouveau-theme.ts) et le référencer dans lib/site.config.ts.
 */
export interface Theme {
  /** Identifiant lisible du thème (pour debugging) */
  name: string

  colors: {
    /** Couleur principale — boutons CTA, backgrounds sombres, logo */
    primary: string
    /** Texte sur fond primary (contraste garanti) */
    primaryForeground: string

    /** Couleur secondaire — boutons outline, éléments secondaires */
    secondary: string
    /** Texte sur fond secondary */
    secondaryForeground: string

    /** Couleur accent signature — hover states, sélections, highlights */
    accent: string
    /** Texte sur fond accent */
    accentForeground: string

    /** Fond général de la page */
    background: string
    /** Texte principal sur background */
    foreground: string

    /** Fonds subtils — drawers, cards, inputs */
    muted: string
    /** Texte secondaire sur muted */
    mutedForeground: string

    /** Couleur des bordures (1px) */
    border: string

    /** Surface des composants — overlays, modals */
    surface: string
  }

  typography: {
    /**
     * Nom de la famille de police principale.
     * La font doit être importée dans app/layout.tsx via next/font.
     * Exemples : "Inter", "Manrope", "Helvetica Neue"
     */
    fontFamily: string

    /**
     * Letter-spacing de la typographie brand (uppercase tracking).
     * Byredo utilise 0.15em pour l'effet brutaliste clinique.
     */
    letterSpacing: string
  }

  /**
   * Border-radius par défaut pour les composants.
   * "0px" = angles droits (style brutaliste/Byredo)
   * "4px" = légèrement arrondi
   * "9999px" = pill shape
   */
  borderRadius: string

  /**
   * Comportement des ombres.
   * "none" = flat design (Byredo)
   * "sm" = ombres légères (luxe moderne)
   */
  shadows: "none" | "sm" | "md"
}
