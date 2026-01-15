/**
 * Image placeholders et helpers pour Next.js Image
 *
 * Placeholders générés avec https://blurha.sh/
 * Alternative: https://png-pixel.com/
 */

/**
 * Placeholder blur pour les images de produits (gris clair neutre)
 * Utilisé pour améliorer la perception de performance pendant le chargement
 */
export const PRODUCT_PLACEHOLDER_BLUR =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+F9PQAJBwN+FbNp5gAAAABJRU5ErkJggg==";

/**
 * Placeholder blur pour les images de catégories (gris légèrement plus foncé)
 */
export const CATEGORY_PLACEHOLDER_BLUR =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88OhxPQAJJwN7tYlT0QAAAABJRU5ErkJggg==";

/**
 * Placeholder blur pour les images lifestyle/campagne (blanc cassé)
 */
export const LIFESTYLE_PLACEHOLDER_BLUR =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/9//fwYGBgYAXQYGBv9+r4EAAAAASUVORK5CYII=";

/**
 * Placeholder générique (gris neutre)
 */
export const GENERIC_PLACEHOLDER_BLUR = PRODUCT_PLACEHOLDER_BLUR;

/**
 * Helper pour obtenir le bon placeholder selon le type d'image
 */
export function getImagePlaceholder(type: "product" | "category" | "lifestyle" | "generic" = "generic"): string {
  switch (type) {
    case "product":
      return PRODUCT_PLACEHOLDER_BLUR;
    case "category":
      return CATEGORY_PLACEHOLDER_BLUR;
    case "lifestyle":
      return LIFESTYLE_PLACEHOLDER_BLUR;
    default:
      return GENERIC_PLACEHOLDER_BLUR;
  }
}

/**
 * Génère un SVG shimmer pour les placeholders dynamiques
 * Utilisé pour créer des placeholders avec des dimensions personnalisées
 */
export function shimmer(width: number, height: number): string {
  return `
    <svg width="${width}" height="${height}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
        <linearGradient id="g">
          <stop stop-color="#f6f7f8" offset="0%" />
          <stop stop-color="#edeef1" offset="20%" />
          <stop stop-color="#f6f7f8" offset="40%" />
          <stop stop-color="#f6f7f8" offset="100%" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="#f6f7f8" />
      <rect id="r" width="${width}" height="${height}" fill="url(#g)" />
      <animate xlink:href="#r" attributeName="x" from="-${width}" to="${width}" dur="1s" repeatCount="indefinite"  />
    </svg>
  `;
}

/**
 * Convertit une chaîne en base64
 * Utilisé pour encoder les placeholders SVG
 */
export function toBase64(str: string): string {
  if (typeof window === 'undefined') {
    // Server-side (Node.js)
    return Buffer.from(str).toString('base64');
  } else {
    // Client-side (Browser)
    return window.btoa(str);
  }
}
