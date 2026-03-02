/**
 * ============================================================
 * THÈME ACTIF — MODIFIER CE FICHIER POUR CHANGER DE THÈME
 * ============================================================
 *
 * Ce fichier utilise des imports RELATIFS (sans alias @/) pour être importable
 * à la fois par :
 *   - tailwind.config.ts   → génère les CSS Custom Properties au build
 *   - lib/site.config.ts   → expose le thème au runtime (composants, emails)
 *
 * Pour changer de thème :
 *   1. Changer l'import ci-dessous (ex: luxeDoreTheme)
 *   2. Relancer le dev server (npm run dev) pour que Tailwind régénère les CSS vars
 *
 * Thèmes disponibles :
 *   byredoTheme   → ./themes/byredo    (Noir/Blanc brutaliste — défaut)
 *   luxeDoreTheme → ./themes/luxe-dore (Crème/Or chaleureux)
 * ============================================================
 */
export { byredoTheme as activeTheme } from "./themes/byredo"
