import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";
import { activeTheme } from "./theme.active";
import { generateCSSVarsObject } from "./themes/index";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Tokens absolus (Byredo baseline — inchangés dans tout le code) ──
        black: "#000000",
        white: "#FFFFFF",
        "off-white": "#F9F9F9",

        // ── Tokens semantiques brand (pilotés par CSS Custom Properties) ───
        // Ces couleurs changent automatiquement selon le thème actif défini
        // dans theme.active.ts. Les CSS vars sont injectées via le plugin
        // Tailwind ci-dessous (addBase → :root).
        //
        // Usage dans les composants : bg-brand-primary, text-brand-fg, etc.
        "brand-primary": "var(--color-primary)",
        "brand-primary-fg": "var(--color-primary-foreground)",
        "brand-secondary": "var(--color-secondary)",
        "brand-secondary-fg": "var(--color-secondary-foreground)",
        "brand-accent": "var(--color-accent)",
        "brand-accent-fg": "var(--color-accent-foreground)",
        "brand-bg": "var(--color-background)",
        "brand-fg": "var(--color-foreground)",
        "brand-muted": "var(--color-muted)",
        "brand-muted-fg": "var(--color-muted-foreground)",
        "brand-border": "var(--color-border)",
        "brand-surface": "var(--color-surface)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        // Tracking fixe (legacy, toujours utilisé dans le code existant)
        "widest-plus": "0.15em",
        // Tracking brand dynamique (suit le thème actif)
        brand: "var(--letter-spacing-brand)",
      },
      borderRadius: {
        // Border-radius brand dynamique (suit le thème actif)
        brand: "var(--border-radius-brand)",
      },
    },
  },
  plugins: [
    /**
     * Injecte les CSS Custom Properties du thème actif au niveau :root.
     * Pour changer de thème : modifier theme.active.ts + relancer npm run dev.
     */
    plugin(function ({ addBase }) {
      addBase({
        ":root": generateCSSVarsObject(activeTheme),
      });
    }),
  ],
};

export default config;
