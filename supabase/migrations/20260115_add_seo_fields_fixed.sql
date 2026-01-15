-- Migration: Ajout champs SEO personnalisables pour les produits
-- Date: 2026-01-15
-- Description: Permet aux admins de personnaliser les métadonnées SEO par produit

-- =====================================================
-- ACTIVER L'EXTENSION pg_trgm (pour recherche full-text)
-- =====================================================

-- Activer l'extension si elle n'existe pas déjà
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =====================================================
-- AJOUT DES COLONNES SEO
-- =====================================================

-- Meta title personnalisé (override auto-généré)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS meta_title TEXT;

-- Meta description personnalisée (override auto-générée)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- Mots-clés SEO (optionnel, pour référence interne ou meta keywords legacy)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS seo_keywords TEXT[];

-- =====================================================
-- CONTRAINTES ET VALIDATIONS
-- =====================================================

-- Meta title: max 60 caractères (recommandation Google)
ALTER TABLE products
DROP CONSTRAINT IF EXISTS products_meta_title_length;

ALTER TABLE products
ADD CONSTRAINT products_meta_title_length
CHECK (meta_title IS NULL OR LENGTH(meta_title) <= 60);

-- Meta description: max 160 caractères (recommandation Google)
ALTER TABLE products
DROP CONSTRAINT IF EXISTS products_meta_description_length;

ALTER TABLE products
ADD CONSTRAINT products_meta_description_length
CHECK (meta_description IS NULL OR LENGTH(meta_description) <= 160);

-- =====================================================
-- COMMENTAIRES DE DOCUMENTATION
-- =====================================================

COMMENT ON COLUMN products.meta_title IS
'Titre SEO personnalisé (max 60 car). Si NULL, utilise auto-génération depuis name + brand';

COMMENT ON COLUMN products.meta_description IS
'Description SEO personnalisée (max 160 car). Si NULL, utilise auto-génération depuis description';

COMMENT ON COLUMN products.seo_keywords IS
'Mots-clés SEO pour référence interne (array de strings)';

-- =====================================================
-- INDEXES POUR RECHERCHE (optionnel)
-- =====================================================

-- Index full-text sur meta_description si utilisé pour recherche
CREATE INDEX IF NOT EXISTS idx_products_meta_description_trgm
ON products USING gin (meta_description gin_trgm_ops)
WHERE meta_description IS NOT NULL;

-- =====================================================
-- FONCTION HELPER: Génération automatique de slug
-- =====================================================

/**
 * Fonction utilitaire pour générer un slug URL-friendly
 *
 * Transformations:
 * - Minuscules
 * - Supprime accents
 * - Remplace espaces et caractères spéciaux par des tirets
 * - Supprime tirets multiples
 *
 * Exemple: "Parfum L'Homme Élégant" -> "parfum-lhomme-elegant"
 */
CREATE OR REPLACE FUNCTION generate_slug(text_input TEXT)
RETURNS TEXT AS $$
DECLARE
  slug TEXT;
BEGIN
  -- Convertir en minuscules
  slug := LOWER(text_input);

  -- Remplacer les accents (utilise unaccent si disponible, sinon regex basique)
  slug := TRANSLATE(
    slug,
    'àáâãäåāăąèéêëēĕėęěìíîïìĩīĭòóôõöōŏőùúûüũūŭůçćĉċčñńņň',
    'aaaaaaaaaeeeeeeeeeiiiiiiiiooooooooouuuuuuuuccccccnnnnn'
  );

  -- Remplacer les apostrophes et guillemets par rien
  slug := REGEXP_REPLACE(slug, '[''"`]', '', 'g');

  -- Remplacer tous les caractères non alphanumériques par des tirets
  slug := REGEXP_REPLACE(slug, '[^a-z0-9]+', '-', 'g');

  -- Supprimer les tirets au début et à la fin
  slug := TRIM(BOTH '-' FROM slug);

  -- Remplacer les tirets multiples par un seul
  slug := REGEXP_REPLACE(slug, '-+', '-', 'g');

  RETURN slug;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Exemples d'utilisation:
-- SELECT generate_slug('Parfum L''Homme Élégant'); -- "parfum-lhomme-elegant"
-- SELECT generate_slug('Oud & Rose - Edition Spéciale'); -- "oud-rose-edition-speciale"

COMMENT ON FUNCTION generate_slug(TEXT) IS
'Génère un slug URL-friendly depuis un texte (minuscules, sans accents, tirets)';

-- =====================================================
-- TRIGGER: Auto-génération slug si vide à l'insertion
-- =====================================================

/**
 * Fonction trigger qui génère automatiquement le slug depuis le nom
 * si le slug est NULL ou vide lors de l'insertion
 */
CREATE OR REPLACE FUNCTION auto_generate_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Si le slug est NULL ou vide, le générer depuis le nom
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.name);

    -- Ajouter un suffixe si le slug existe déjà (éviter doublons)
    WHILE EXISTS (SELECT 1 FROM products WHERE slug = NEW.slug AND id != NEW.id) LOOP
      NEW.slug := NEW.slug || '-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8);
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger sur INSERT et UPDATE
DROP TRIGGER IF EXISTS trigger_auto_generate_slug ON products;
CREATE TRIGGER trigger_auto_generate_slug
BEFORE INSERT OR UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION auto_generate_slug();

COMMENT ON TRIGGER trigger_auto_generate_slug ON products IS
'Auto-génère le slug depuis le nom du produit si le champ slug est vide';

-- =====================================================
-- MISE À JOUR DES STATISTIQUES
-- =====================================================

ANALYZE products;
