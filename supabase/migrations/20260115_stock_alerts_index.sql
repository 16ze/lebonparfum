/**
 * Migration: Stock Alerts System
 * Créé le: 2026-01-15
 *
 * Objectif:
 * - Optimiser les requêtes de filtrage par stock
 * - Faciliter l'identification des produits en rupture ou stock faible
 *
 * Index créés:
 * - idx_products_stock: Index simple sur stock pour filtrage rapide
 * - idx_products_low_stock: Index partiel pour produits critiques (stock < 5)
 */

-- Index général sur la colonne stock pour filtrage rapide
CREATE INDEX IF NOT EXISTS idx_products_stock
ON public.products(stock);

-- Index partiel pour les produits en alerte (stock < 5)
-- Plus performant car indexe seulement les produits critiques
CREATE INDEX IF NOT EXISTS idx_products_low_stock
ON public.products(stock)
WHERE stock < 5;

-- Index composite pour page admin: statut published + stock faible
-- Permet de récupérer rapidement les produits publiés en alerte
CREATE INDEX IF NOT EXISTS idx_products_published_low_stock
ON public.products(status, stock)
WHERE status = 'published' AND stock < 5;

-- Fonction helper pour statistiques stock (admin dashboard)
CREATE OR REPLACE FUNCTION get_stock_stats()
RETURNS TABLE (
  out_of_stock BIGINT,
  low_stock BIGINT,
  in_stock BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE stock = 0) AS out_of_stock,
    COUNT(*) FILTER (WHERE stock > 0 AND stock <= 5) AS low_stock,
    COUNT(*) FILTER (WHERE stock > 5) AS in_stock
  FROM products
  WHERE status = 'published';
END;
$$ LANGUAGE plpgsql;

-- Commentaires pour documentation
COMMENT ON INDEX idx_products_stock IS 'Index général pour filtrage rapide par stock';
COMMENT ON INDEX idx_products_low_stock IS 'Index partiel pour produits en alerte (stock < 5)';
COMMENT ON INDEX idx_products_published_low_stock IS 'Index composite pour page admin alertes stock';
COMMENT ON FUNCTION get_stock_stats() IS 'Retourne statistiques stock pour dashboard admin';
