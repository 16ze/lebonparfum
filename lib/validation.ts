import { z } from "zod";
import DOMPurify from "isomorphic-dompurify";

/**
 * Schémas de validation Zod pour l'application
 * Utilisés pour valider les inputs utilisateur côté serveur
 */

// ===================================
// SCHÉMAS COMMUNS
// ===================================

/**
 * Schéma pour les slugs (URL-friendly)
 * Format: lowercase, alphanumeric + hyphens, pas de caractères spéciaux
 */
export const slugSchema = z
  .string()
  .min(1, "Le slug est requis")
  .max(100, "Le slug ne peut pas dépasser 100 caractères")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Le slug doit être en minuscules, sans espaces ni caractères spéciaux (seulement a-z, 0-9, et -)"
  );

/**
 * Schéma pour les prix (en centimes)
 * Minimum 1 centime (0.01€), maximum 1 million d'euros (100000000 centimes)
 */
export const priceSchema = z
  .number()
  .int("Le prix doit être un nombre entier (en centimes)")
  .min(1, "Le prix doit être au minimum 1 centime")
  .max(100000000, "Le prix ne peut pas dépasser 1 million d'euros");

/**
 * Schéma pour le stock
 * Minimum 0, maximum 10000 unités
 */
export const stockSchema = z
  .number()
  .int("Le stock doit être un nombre entier")
  .min(0, "Le stock ne peut pas être négatif")
  .max(10000, "Le stock ne peut pas dépasser 10000 unités");

/**
 * Schéma pour les descriptions HTML
 * Longueur max 5000 caractères avant sanitization
 */
export const htmlDescriptionSchema = z
  .string()
  .max(5000, "La description ne peut pas dépasser 5000 caractères")
  .optional()
  .nullable();

/**
 * Schéma pour les URLs d'images
 */
export const imageUrlSchema = z
  .string()
  .url("L'URL de l'image doit être valide")
  .optional()
  .nullable();

// ===================================
// SCHÉMAS PRODUITS
// ===================================

/**
 * Schéma de validation pour la création/modification d'un produit
 */
export const productSchema = z.object({
  name: z
    .string()
    .min(1, "Le nom du produit est requis")
    .max(200, "Le nom ne peut pas dépasser 200 caractères")
    .trim(),

  slug: slugSchema,

  brand: z
    .string()
    .min(1, "La marque est requise")
    .max(100, "La marque ne peut pas dépasser 100 caractères")
    .trim(),

  description: htmlDescriptionSchema,

  price: priceSchema,

  stock: stockSchema,

  image_url: imageUrlSchema,

  // Champs optionnels
  notes: z
    .string()
    .max(1000, "Les notes ne peuvent pas dépasser 1000 caractères")
    .optional()
    .nullable(),

  inspiration: z
    .string()
    .max(1000, "L'inspiration ne peut pas dépasser 1000 caractères")
    .optional()
    .nullable(),
});

/**
 * Type TypeScript inféré du schéma produit
 */
export type ProductInput = z.infer<typeof productSchema>;

// ===================================
// SCHÉMAS CATÉGORIES
// ===================================

/**
 * Schéma de validation pour les catégories
 */
export const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Le nom de la catégorie est requis")
    .max(100, "Le nom ne peut pas dépasser 100 caractères")
    .trim(),

  slug: slugSchema,

  description: htmlDescriptionSchema,

  image_url: imageUrlSchema,
});

/**
 * Type TypeScript inféré du schéma catégorie
 */
export type CategoryInput = z.infer<typeof categorySchema>;

// ===================================
// SCHÉMAS TAGS
// ===================================

/**
 * Schéma de validation pour les tags
 */
export const tagSchema = z.object({
  name: z
    .string()
    .min(1, "Le nom du tag est requis")
    .max(50, "Le nom ne peut pas dépasser 50 caractères")
    .trim(),

  slug: slugSchema,
});

/**
 * Type TypeScript inféré du schéma tag
 */
export type TagInput = z.infer<typeof tagSchema>;

// ===================================
// VALIDATION FICHIERS UPLOAD
// ===================================

/**
 * Extensions d'images autorisées
 */
const ALLOWED_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif"] as const;

/**
 * Types MIME autorisés pour les images
 */
const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

/**
 * Taille maximale pour les images (5MB)
 */
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB en bytes

/**
 * Validation d'un fichier image uploadé
 *
 * Vérifie :
 * - Taille < 5MB
 * - Extension valide (.jpg, .jpeg, .png, .webp, .gif)
 * - Type MIME valide
 *
 * @param file - Fichier à valider
 * @returns Objet { valid: boolean, error?: string }
 */
export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  // Vérifier la taille
  if (file.size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: `L'image est trop volumineuse (${(file.size / 1024 / 1024).toFixed(2)}MB). Taille maximale : 5MB.`,
    };
  }

  // Vérifier le type MIME
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type as any)) {
    return {
      valid: false,
      error: `Type de fichier non autorisé (${file.type}). Types acceptés : JPEG, PNG, WebP, GIF.`,
    };
  }

  // Vérifier l'extension
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!extension || !ALLOWED_IMAGE_EXTENSIONS.includes(extension as any)) {
    return {
      valid: false,
      error: `Extension de fichier non autorisée (.${extension}). Extensions acceptées : .jpg, .jpeg, .png, .webp, .gif.`,
    };
  }

  return { valid: true };
}

// ===================================
// SANITIZATION HTML
// ===================================

/**
 * Configuration DOMPurify pour la sanitization HTML
 *
 * Permet uniquement les balises de formatage de texte simples :
 * - Gras, italique, souligné
 * - Listes (ul, ol, li)
 * - Paragraphes
 * - Liens (avec attributs limités)
 *
 * Bloque :
 * - Scripts (<script>)
 * - Styles inline dangereux
 * - Événements (onclick, onerror, etc.)
 * - Iframes
 */
const DOMPURIFY_CONFIG = {
  ALLOWED_TAGS: [
    "p",
    "br",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "ul",
    "ol",
    "li",
    "a",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
  ],
  ALLOWED_ATTR: ["href", "target", "rel"],
  ALLOW_DATA_ATTR: false,
  KEEP_CONTENT: true,
};

/**
 * Sanitize une chaîne HTML pour enlever tout code dangereux
 *
 * Utilise DOMPurify pour :
 * - Supprimer les scripts
 * - Supprimer les événements inline (onclick, etc.)
 * - Supprimer les styles dangereux
 * - Garder uniquement les balises de formatage autorisées
 *
 * @param html - Chaîne HTML potentiellement dangereuse
 * @returns Chaîne HTML nettoyée et sécurisée
 *
 * @example
 * sanitizeHtml('<p>Hello</p><script>alert("XSS")</script>')
 * // Retourne: '<p>Hello</p>'
 */
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return "";

  // Nettoyer le HTML avec DOMPurify
  const clean = DOMPurify.sanitize(html, DOMPURIFY_CONFIG);

  return clean;
}

/**
 * Validation et sanitization combinées pour les descriptions produits
 *
 * 1. Valide que la longueur est acceptable
 * 2. Sanitize le HTML pour enlever le code dangereux
 * 3. Retourne la version nettoyée
 *
 * @param description - Description HTML brute
 * @returns Objet { valid: boolean, sanitized: string, error?: string }
 */
export function validateAndSanitizeDescription(description: string | null | undefined): {
  valid: boolean;
  sanitized: string;
  error?: string;
} {
  // Valider avec Zod
  const result = htmlDescriptionSchema.safeParse(description);

  if (!result.success) {
    return {
      valid: false,
      sanitized: "",
      error: result.error.issues[0]?.message || "Description invalide",
    };
  }

  // Sanitizer le HTML
  const sanitized = sanitizeHtml(result.data);

  return {
    valid: true,
    sanitized,
  };
}

// ===================================
// HELPERS DE VALIDATION
// ===================================

/**
 * Valide des données avec un schéma Zod et retourne un format uniforme
 *
 * @param schema - Schéma Zod à utiliser
 * @param data - Données à valider
 * @returns Objet { valid: boolean, data?: T, errors?: string[] }
 */
export function validateWithSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): {
  valid: boolean;
  data?: T;
  errors?: string[];
} {
  const result = schema.safeParse(data);

  if (result.success) {
    return {
      valid: true,
      data: result.data,
    };
  }

  return {
    valid: false,
    errors: result.error.issues.map((err) => `${err.path.join(".")}: ${err.message}`),
  };
}
