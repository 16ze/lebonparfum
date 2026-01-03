-- Script de nettoyage avant migration 09
-- À exécuter dans Supabase SQL Editor

-- Supprimer les policies existantes
DROP POLICY IF EXISTS "Users can view own addresses" ON public.user_addresses;
DROP POLICY IF EXISTS "Users can insert own addresses" ON public.user_addresses;
DROP POLICY IF EXISTS "Users can update own addresses" ON public.user_addresses;
DROP POLICY IF EXISTS "Users can delete own addresses" ON public.user_addresses;

DROP POLICY IF EXISTS "Users can view own wishlist" ON public.wishlist;
DROP POLICY IF EXISTS "Users can add to own wishlist" ON public.wishlist;
DROP POLICY IF EXISTS "Users can remove from own wishlist" ON public.wishlist;

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;

DROP POLICY IF EXISTS "Users can view own loyalty points" ON public.loyalty_points;
DROP POLICY IF EXISTS "Users can view own loyalty transactions" ON public.loyalty_transactions;

-- Supprimer les triggers
DROP TRIGGER IF EXISTS on_auth_user_created_loyalty ON auth.users;
DROP TRIGGER IF EXISTS user_addresses_updated_at ON public.user_addresses;

-- Supprimer les fonctions
DROP FUNCTION IF EXISTS public.handle_new_user_loyalty();
DROP FUNCTION IF EXISTS public.handle_updated_at();
DROP FUNCTION IF EXISTS public.add_loyalty_points_from_order(uuid, uuid, integer);

-- Supprimer les tables (CASCADE pour supprimer les dépendances)
DROP TABLE IF EXISTS public.loyalty_transactions CASCADE;
DROP TABLE IF EXISTS public.loyalty_points CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.wishlist CASCADE;
DROP TABLE IF EXISTS public.user_addresses CASCADE;

-- Message de confirmation
SELECT 'Nettoyage terminé ! Vous pouvez maintenant exécuter la migration 09.' as message;

