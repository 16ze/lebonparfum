-- Migration: Ajout système de statut pour les produits (Draft/Published/Archived)
-- Date: 2026-01-15
-- Description: Permet de cacher les produits non terminés et gérer leur cycle de vie

-- =====================================================
-- AJOUT DE LA COLONNE STATUS
-- =====================================================

-- Ajouter la colonne status avec valeur par défaut 'draft'
-- Par sécurité, les nouveaux produits sont invisibles par défaut
ALTER TABLE products
ADD COLUMN status TEXT DEFAULT 'draft' NOT NULL;

-- =====================================================
-- CONTRAINTE DE VALIDATION
-- =====================================================

-- Contrainte: Seules 3 valeurs autorisées
ALTER TABLE products
ADD CONSTRAINT products_status_check
CHECK (status IN ('draft', 'published', 'archived'));

-- =====================================================
-- INDEX POUR PERFORMANCE
-- =====================================================

-- Index sur status pour optimiser les requêtes de filtrage frontend
-- Permet des requêtes rapides de type WHERE status = 'published'
CREATE INDEX IF NOT EXISTS idx_products_status
ON products(status);

-- Index composite status + created_at pour tri des produits publiés
CREATE INDEX IF NOT EXISTS idx_products_status_created
ON products(status, created_at DESC)
WHERE status = 'published';

-- =====================================================
-- MIGRATION DES DONNÉES EXISTANTES
-- =====================================================

-- CRITIQUE: Passer tous les produits existants en 'published'
-- pour ne pas casser le site actuel
UPDATE products
SET status = 'published'
WHERE status = 'draft';

-- Vérification: Compter les produits migrés
DO $$
DECLARE
  published_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO published_count
  FROM products
  WHERE status = 'published';

  RAISE NOTICE '✅ Migration terminée: % produits passés en "published"', published_count;
END $$;

-- =====================================================
-- DOCUMENTATION
-- =====================================================

COMMENT ON COLUMN products.status IS
'Statut du produit: draft (brouillon invisible), published (visible clients), archived (masqué mais conservé)';

COMMENT ON CONSTRAINT products_status_check ON products IS
'Limite les valeurs status aux états autorisés du cycle de vie produit';

COMMENT ON INDEX idx_products_status IS
'Optimise les requêtes de filtrage par statut (WHERE status = ''published'')';

-- =====================================================
-- FONCTION HELPER: Compter produits par statut
-- =====================================================

/**
 * Fonction utilitaire pour obtenir les statistiques de statuts
 * Utilisable depuis l'admin dashboard
 */
CREATE OR REPLACE FUNCTION get_product_status_stats()
RETURNS TABLE (
  status TEXT,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.status,
    COUNT(*) as count
  FROM products p
  GROUP BY p.status
  ORDER BY
    CASE p.status
      WHEN 'published' THEN 1
      WHEN 'draft' THEN 2
      WHEN 'archived' THEN 3
    END;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_product_status_stats() IS
'Retourne le nombre de produits par statut pour statistiques admin';

-- Exemple d'utilisation:
-- SELECT * FROM get_product_status_stats();
-- Résultat:
-- status     | count
-- -----------+-------
-- published  | 45
-- draft      | 8
-- archived   | 2

-- =====================================================
-- MISE À JOUR DES STATISTIQUES
-- =====================================================

ANALYZE products;
