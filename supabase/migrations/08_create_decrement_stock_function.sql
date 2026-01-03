-- ============================================
-- Migration: Fonction de décrémentation de stock
-- Description: Crée une fonction SQL pour décrémenter le stock de manière atomique
-- ============================================

-- Créer la fonction pour décrémenter le stock
CREATE OR REPLACE FUNCTION decrement_stock(
  product_id UUID,
  quantity INTEGER
)
RETURNS VOID AS $$
BEGIN
  -- Décrémenter le stock de manière atomique
  UPDATE products
  SET stock = stock - quantity
  WHERE id = product_id
  AND stock >= quantity; -- Ne décrémente que si stock suffisant

  -- Vérifier si la mise à jour a réussi
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Stock insuffisant ou produit introuvable pour ID: %', product_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Ajouter un commentaire
COMMENT ON FUNCTION decrement_stock IS 'Décrémente le stock d''un produit de manière atomique après un achat';
