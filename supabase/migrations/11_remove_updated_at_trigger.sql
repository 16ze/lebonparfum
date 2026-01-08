-- =====================================================
-- Migration 11: Suppression trigger updated_at sur user_addresses
-- =====================================================
-- Objectif: Supprimer le trigger qui tente de mettre à jour updated_at
-- car cette colonne n'existe pas dans la table réelle

-- Supprimer tous les triggers liés à updated_at sur user_addresses
DROP TRIGGER IF EXISTS user_addresses_updated_at ON public.user_addresses;
DROP TRIGGER IF EXISTS update_user_addresses_updated_at ON public.user_addresses;
DROP TRIGGER IF EXISTS update_user_addresses_updated_at ON user_addresses;

-- Note: On ne supprime PAS la fonction handle_updated_at() ou update_updated_at_column()
-- car elles peuvent être utilisées par d'autres tables (wishlist, etc.)

