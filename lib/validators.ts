/**
 * Validation email
 *
 * @param email - Email à valider
 * @returns True si email valide
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validation mot de passe
 *
 * @param password - Mot de passe à valider
 * @returns Objet avec valid boolean et erreurs
 */
export function validatePassword(
  password: string
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Le mot de passe doit contenir au moins 8 caractères");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins une majuscule");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins un chiffre");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Interface pour les données produit
 */
export interface ProductInput {
  name: string;
  slug: string;
  collection: string;
  price: number;
  stock: number;
  category?: string;
  description?: string;
  notes?: string;
  inspiration?: string;
  image_url?: string;
}

/**
 * Validation données produit
 *
 * @param data - Données produit à valider
 * @returns Objet avec valid boolean et erreurs par champ
 */
export function validateProduct(data: ProductInput): {
  valid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  // Champs obligatoires
  if (!data.name || data.name.trim().length === 0) {
    errors.name = "Le nom du produit est obligatoire";
  }

  if (!data.slug || data.slug.trim().length === 0) {
    errors.slug = "Le slug est obligatoire";
  } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)) {
    errors.slug =
      "Le slug doit être en minuscules, sans espaces (ex: mon-produit)";
  }

  if (!data.collection || data.collection.trim().length === 0) {
    errors.collection = "La collection est obligatoire";
  }

  if (data.price === undefined || data.price === null) {
    errors.price = "Le prix est obligatoire";
  } else if (data.price < 0) {
    errors.price = "Le prix ne peut pas être négatif";
  }

  if (data.stock === undefined || data.stock === null) {
    errors.stock = "Le stock est obligatoire";
  } else if (data.stock < 0) {
    errors.stock = "Le stock ne peut pas être négatif";
  }

  // Validation longueurs
  if (data.name && data.name.length > 200) {
    errors.name = "Le nom ne peut pas dépasser 200 caractères";
  }

  if (data.description && data.description.length > 2000) {
    errors.description = "La description ne peut pas dépasser 2000 caractères";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Génère un slug depuis un nom de produit
 *
 * @param name - Nom du produit
 * @returns Slug généré
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD") // Décompose les caractères accentués
    .replace(/[\u0300-\u036f]/g, "") // Supprime les accents
    .replace(/[^a-z0-9\s-]/g, "") // Garde seulement lettres, chiffres, espaces, tirets
    .trim()
    .replace(/\s+/g, "-") // Remplace espaces par tirets
    .replace(/-+/g, "-"); // Supprime tirets multiples
}
