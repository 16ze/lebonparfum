/**
 * Mapping entre les slugs d'URL et les noms de collections en base de données
 *
 * Format URL : slug (ex: "cp-king", "note-33")
 * Format DB : nom exact (ex: "CP KING", "NOTE 33")
 */

export const COLLECTION_SLUGS = {
  "casablanca": "Casablanca",
  "cp-king": "CP King Édition",
  "cp-paris": "CP Paris",
  "note-33": "Note 33",
} as const;

export type CollectionSlug = keyof typeof COLLECTION_SLUGS;

/**
 * Convertir un slug URL en nom de collection pour la requête DB
 *
 * @param slug - Le slug de l'URL (ex: "cp-king")
 * @returns Le nom de collection en DB (ex: "CP KING ÉDITION") ou null si non trouvé
 */
export function slugToCollectionName(slug: string): string | null {
  const normalizedSlug = slug.toLowerCase();
  return COLLECTION_SLUGS[normalizedSlug as CollectionSlug] || null;
}

/**
 * Convertir un nom de collection DB en slug URL
 *
 * @param collectionName - Le nom de collection en DB (ex: "CP KING ÉDITION")
 * @returns Le slug pour l'URL (ex: "cp-king") ou null si non trouvé
 */
export function collectionNameToSlug(collectionName: string): CollectionSlug | null {
  const entries = Object.entries(COLLECTION_SLUGS) as [CollectionSlug, string][];
  const found = entries.find(([_, dbName]) => 
    dbName.toLowerCase() === collectionName.toLowerCase()
  );
  return found ? found[0] : null;
}

/**
 * Vérifier si un slug de collection est valide
 *
 * @param slug - Le slug à vérifier
 * @returns true si le slug existe dans le mapping
 */
export function isValidCollectionSlug(slug: string): slug is CollectionSlug {
  return slug.toLowerCase() in COLLECTION_SLUGS;
}

