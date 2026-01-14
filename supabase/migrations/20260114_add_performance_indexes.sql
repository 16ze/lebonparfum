-- Migration: Ajout d'indexes pour optimiser les performances
-- Date: 2026-01-14
-- Description: Indexe les colonnes fréquemment requêtées

-- =====================================================
-- INDEXES SUR LES COLONNES SLUG (13 requêtes)
-- =====================================================

-- Products: Recherche par slug pour pages produits
CREATE INDEX IF NOT EXISTS idx_products_slug
ON products(slug);

-- Categories: Recherche par slug pour pages catégories
CREATE INDEX IF NOT EXISTS idx_categories_slug
ON categories(slug);

-- Tags: Recherche par slug pour pages tags
CREATE INDEX IF NOT EXISTS idx_tags_slug
ON tags(slug);

-- =====================================================
-- INDEXES SUR USER_ID (14 requêtes)
-- =====================================================

-- Profiles: Lookup utilisateur
CREATE INDEX IF NOT EXISTS idx_profiles_user_id
ON profiles(id);

-- Wishlist: Liste des favoris par utilisateur
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id
ON wishlist(user_id);

-- User addresses: Adresses de livraison par utilisateur
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id
ON user_addresses(user_id);

-- Notifications: Notifications par utilisateur
CREATE INDEX IF NOT EXISTS idx_notifications_user_id
ON notifications(user_id);

-- Orders: Commandes par utilisateur
CREATE INDEX IF NOT EXISTS idx_orders_user_id
ON orders(user_id);

-- =====================================================
-- INDEXES SUR PRODUCT_ID (8 requêtes)
-- =====================================================

-- Product categories: Relation produit-catégorie
CREATE INDEX IF NOT EXISTS idx_product_categories_product_id
ON product_categories(product_id);

-- Product categories: Index sur category_id aussi
CREATE INDEX IF NOT EXISTS idx_product_categories_category_id
ON product_categories(category_id);

-- Product tags: Relation produit-tag
CREATE INDEX IF NOT EXISTS idx_product_tags_product_id
ON product_tags(product_id);

-- Product tags: Index sur tag_id aussi
CREATE INDEX IF NOT EXISTS idx_product_tags_tag_id
ON product_tags(tag_id);

-- Wishlist: Lookup par produit
CREATE INDEX IF NOT EXISTS idx_wishlist_product_id
ON wishlist(product_id);

-- =====================================================
-- INDEXES COMPOSITES POUR REQUÊTES COMPLEXES
-- =====================================================

-- Wishlist: Recherche unique par user + product (éviter doublons)
CREATE UNIQUE INDEX IF NOT EXISTS idx_wishlist_user_product
ON wishlist(user_id, product_id);

-- Product categories: Recherche par catégorie pour filtres
-- (déjà créé ci-dessus individuellement)

-- Notifications: Tri et filtrage par utilisateur + statut de lecture
CREATE INDEX IF NOT EXISTS idx_notifications_user_read
ON notifications(user_id, is_read);

-- =====================================================
-- INDEXES SUR COLONNES DE TRI FRÉQUENTES
-- =====================================================

-- Products: Tri par date de création (nouveautés)
CREATE INDEX IF NOT EXISTS idx_products_created_at
ON products(created_at DESC);

-- Products: Tri par nom (ordre alphabétique)
CREATE INDEX IF NOT EXISTS idx_products_name
ON products(name);

-- Products: Tri par prix (filtres prix)
CREATE INDEX IF NOT EXISTS idx_products_price
ON products(price);

-- Products: Filtrage par stock disponible
CREATE INDEX IF NOT EXISTS idx_products_stock
ON products(stock) WHERE stock > 0;

-- Orders: Tri par date de création
CREATE INDEX IF NOT EXISTS idx_orders_created_at
ON orders(created_at DESC);

-- =====================================================
-- INDEXES POUR RECHERCHE TEXTUELLE (optionnel)
-- =====================================================

-- Products: Recherche full-text sur nom et marque
-- Note: Utilise pg_trgm pour recherche fuzzy
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_products_name_trgm
ON products USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_products_brand_trgm
ON products USING gin (brand gin_trgm_ops);

-- =====================================================
-- COMMENTAIRES ET DOCUMENTATION
-- =====================================================

COMMENT ON INDEX idx_products_slug IS 'Index pour recherche rapide par slug dans URLs produits';
COMMENT ON INDEX idx_wishlist_user_id IS 'Index pour récupération wishlist utilisateur';
COMMENT ON INDEX idx_wishlist_user_product IS 'Index unique pour éviter doublons wishlist';
COMMENT ON INDEX idx_products_created_at IS 'Index pour tri chronologique (nouveautés)';
COMMENT ON INDEX idx_products_stock IS 'Index partiel pour filtrer produits en stock';

-- =====================================================
-- ANALYSE ET STATISTIQUES
-- =====================================================

-- Mettre à jour les statistiques pour l'optimiseur de requêtes
ANALYZE products;
ANALYZE categories;
ANALYZE tags;
ANALYZE wishlist;
ANALYZE orders;
ANALYZE user_addresses;
ANALYZE notifications;
ANALYZE product_categories;
ANALYZE product_tags;
