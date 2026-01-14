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
