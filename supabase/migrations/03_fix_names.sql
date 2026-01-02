-- ============================================
-- Migration: Correction des noms de produits
-- ============================================
-- Description: 
--   Extrait le chiffre de stock du début du nom de produit
--   et le met dans la colonne stock, puis nettoie le nom
--
-- Problème résolu :
--   Les noms contiennent le stock (ex: "4 BLACK OP", "5 Coco Vanille")
--   Cette migration sépare le stock du nom proprement
--
-- Instructions:
--   1. Ouvrez Supabase Dashboard > SQL Editor
--   2. Copiez-collez ce fichier complet
--   3. Exécutez la requête
-- ============================================

-- Mise à jour : Extraire le stock du début du nom et nettoyer le nom
UPDATE public.products
SET 
  -- Extraire le chiffre du début du nom et le convertir en integer pour stock
  stock = CASE 
    WHEN name ~ '^[0-9]+' THEN 
      (substring(name from '^[0-9]+'))::int
    ELSE 
      COALESCE(stock, 0) -- Garder le stock existant si pas de chiffre au début
  END,
  -- Nettoyer le nom en retirant le chiffre du début et les espaces superflus
  name = CASE 
    WHEN name ~ '^[0-9]+' THEN 
      trim(substring(name from '^[0-9]+[[:space:]]+(.*)'))
    ELSE 
      trim(name) -- Juste trim si pas de chiffre
  END
WHERE name ~ '^[0-9]+'; -- Uniquement les produits qui commencent par un chiffre

-- Vérification : Afficher les résultats (optionnel, pour debug)
-- SELECT id, name, stock FROM public.products ORDER BY collection, name;


