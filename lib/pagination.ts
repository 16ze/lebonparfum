/**
 * Helpers de pagination pour Supabase
 *
 * Gère la pagination côté serveur avec:
 * - Calcul automatique des offsets
 * - Comptage total de résultats
 * - Validation des paramètres
 */

export const ITEMS_PER_PAGE = 12; // Nombre d'items par page (divisible par 2, 3, 4 pour grids)

/**
 * Interface des paramètres de pagination
 */
export interface PaginationParams {
  page: number; // Numéro de page (1-indexed)
  limit: number; // Nombre d'items par page
}

/**
 * Interface du résultat de pagination
 */
export interface PaginationResult {
  page: number; // Page actuelle
  totalPages: number; // Nombre total de pages
  totalItems: number; // Nombre total d'items
  from: number; // Index de départ (0-indexed pour Supabase)
  to: number; // Index de fin (0-indexed pour Supabase)
}

/**
 * Parse et valide les paramètres de pagination depuis les query params
 *
 * @param searchParams - URLSearchParams ou objet avec clé "page"
 * @param itemsPerPage - Nombre d'items par page (défaut: ITEMS_PER_PAGE)
 * @returns Paramètres de pagination validés
 *
 * @example
 * const params = getPaginationParams(searchParams);
 * // { page: 1, limit: 12 }
 */
export function getPaginationParams(
  searchParams: URLSearchParams | { page?: string },
  itemsPerPage: number = ITEMS_PER_PAGE
): PaginationParams {
  const pageParam =
    searchParams instanceof URLSearchParams
      ? searchParams.get("page")
      : searchParams.page;

  let page = parseInt(pageParam || "1", 10);

  // Validation: page doit être >= 1
  if (isNaN(page) || page < 1) {
    page = 1;
  }

  return {
    page,
    limit: itemsPerPage,
  };
}

/**
 * Calcule les infos de pagination (range Supabase, total pages, etc.)
 *
 * @param page - Numéro de page (1-indexed)
 * @param totalItems - Nombre total d'items
 * @param itemsPerPage - Nombre d'items par page
 * @returns Résultat de pagination avec ranges et totaux
 *
 * @example
 * const result = calculatePagination(2, 100, 12);
 * // { page: 2, totalPages: 9, totalItems: 100, from: 12, to: 23 }
 */
export function calculatePagination(
  page: number,
  totalItems: number,
  itemsPerPage: number = ITEMS_PER_PAGE
): PaginationResult {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Validation: si page > totalPages, on redirige vers dernière page
  const validPage = Math.min(Math.max(1, page), Math.max(1, totalPages));

  // Calcul du range pour Supabase (0-indexed)
  const from = (validPage - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1; // Supabase utilise "to" inclusif

  return {
    page: validPage,
    totalPages,
    totalItems,
    from,
    to,
  };
}

/**
 * Helper pour appliquer la pagination à une requête Supabase
 *
 * @param query - Query Supabase
 * @param from - Index de départ (0-indexed)
 * @param to - Index de fin (0-indexed, inclusif)
 * @returns Query avec range appliqué
 *
 * @example
 * let query = supabase.from("products").select("*");
 * query = applyPagination(query, 0, 11); // First page (12 items)
 * const { data } = await query;
 */
export function applyPagination<T>(
  query: any,
  from: number,
  to: number
): any {
  return query.range(from, to);
}

/**
 * Wrapper complet pour paginer une requête Supabase
 *
 * @param query - Query Supabase
 * @param searchParams - Query params de l'URL
 * @param itemsPerPage - Items par page (optionnel)
 * @returns Query paginée
 *
 * @example
 * // Dans une page Next.js Server Component
 * let query = supabase.from("products").select("*");
 * query = paginateQuery(query, searchParams);
 * const { data, count } = await query;
 */
export function paginateQuery(
  query: any,
  searchParams: URLSearchParams | { page?: string },
  itemsPerPage: number = ITEMS_PER_PAGE
): any {
  const { page, limit } = getPaginationParams(searchParams, itemsPerPage);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  return query.range(from, to);
}
