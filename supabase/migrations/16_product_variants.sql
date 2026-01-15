-- ============================================
-- Migration: Ajout des variantes de produits
-- Description: Permet de gérer plusieurs tailles avec prix et stock différents
-- Date: 2025-01-XX
-- ============================================

-- PROBLÈME :
-- Les produits n'ont qu'un seul prix et un seul stock.
-- Il faut pouvoir gérer plusieurs tailles (50ml, 100ml, 200ml) avec des prix et stocks différents.

-- SOLUTION :
-- Ajouter une colonne `variants` JSONB qui stocke un tableau de variantes.
-- Structure : [{ "label": "50ml", "price": 1500, "stock": 10 }, { "label": "100ml", "price": 2500, "stock": 5 }]
-- - label : Taille affichée (ex: "50ml", "100ml")
-- - price : Prix en centimes pour cette variante
-- - stock : Stock disponible pour cette variante

-- 1. Ajouter la colonne variants (JSONB)
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb;

-- 2. Commentaire pour documenter la structure
COMMENT ON COLUMN public.products.variants IS 
'Tableau JSONB des variantes du produit. Structure: [{"label": "50ml", "price": 1500, "stock": 10}]. 
Si vide ([]), le produit utilise le prix et stock de base. 
Si non vide, le prix et stock de base sont ignorés et remplacés par les variantes.';

-- 3. Index GIN pour les requêtes sur les variantes (optionnel mais recommandé pour les performances)
CREATE INDEX IF NOT EXISTS idx_products_variants ON public.products USING GIN (variants);

-- 4. Migration des données existantes (optionnel)
-- Si vous avez des produits existants, vous pouvez créer une variante par défaut :
-- UPDATE public.products 
-- SET variants = jsonb_build_array(
--   jsonb_build_object(
--     'label', '50ml',
--     'price', price,
--     'stock', stock
--   )
-- )
-- WHERE variants = '[]'::jsonb OR variants IS NULL;
