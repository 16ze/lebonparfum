-- ============================================
-- Migration: Fix Orders RLS - Garantir l'affichage Client & Admin
-- Description: Nettoie et recrée les policies RLS pour garantir la visibilité des commandes
-- Date: 2025-01-XX
-- ============================================

-- PROBLÈME :
-- Les commandes peuvent ne pas s'afficher correctement pour les clients ou les admins
-- à cause de conflits entre les anciennes et nouvelles policies RLS.

-- SOLUTION :
-- 1. Supprimer TOUTES les anciennes policies pour éviter les conflits
-- 2. Recréer des policies propres et explicites
-- 3. Garantir que les clients voient leurs commandes
-- 4. Garantir que les admins voient TOUTES les commandes (y compris invités)

-- ============================================
-- ÉTAPE 1 : NETTOYAGE COMPLET
-- ============================================

-- Supprimer toutes les anciennes policies SELECT sur orders
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Admin can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admin view all orders" ON public.orders;
DROP POLICY IF EXISTS "Service Role can manage all" ON public.orders;
DROP POLICY IF EXISTS "Public orders are viewable by everyone" ON public.orders;

-- ============================================
-- ÉTAPE 2 : RÈGLE CLIENT
-- ============================================

-- Un utilisateur connecté peut voir UNIQUEMENT ses propres commandes
-- Condition : auth.uid() = user_id (même si user_id peut être NULL pour les invités)
CREATE POLICY "Users can view own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
);

-- ============================================
-- ÉTAPE 3 : RÈGLE ADMIN
-- ============================================

-- Un admin peut voir TOUTES les commandes (y compris celles avec user_id = NULL)
-- Condition : Le profil de l'utilisateur a is_admin = true
CREATE POLICY "Admin can view all orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);

-- ============================================
-- NOTES IMPORTANTES :
-- ============================================
-- 
-- 1. Service Role Key (Webhook) :
--    - Le webhook utilise SUPABASE_SERVICE_ROLE_KEY
--    - Cette clé BYPASS automatiquement le RLS
--    - Aucune policy INSERT/UPDATE n'est nécessaire pour le webhook
--    - Le webhook peut insérer des commandes sans restriction
--
-- 2. Invités (user_id = NULL) :
--    - Les commandes invités ont user_id = NULL
--    - Les clients connectés ne peuvent PAS les voir (auth.uid() = NULL est false)
--    - Seuls les admins peuvent les voir via la policy "Admin can view all orders"
--
-- 3. Vérification Admin :
--    - La policy admin vérifie is_admin dans la table profiles
--    - Si le profil n'existe pas ou is_admin = false, la policy retourne false
--    - L'utilisateur ne verra que ses propres commandes (via la policy client)
--
-- ============================================
-- VÉRIFICATION POST-MIGRATION :
-- ============================================
-- 
-- Pour tester :
-- 1. Connectez-vous en tant que client et vérifiez /account/orders
-- 2. Connectez-vous en tant qu'admin et vérifiez /admin/orders
-- 3. Les deux doivent afficher les commandes correctement
--
-- Pour déboguer :
-- SELECT * FROM pg_policies WHERE tablename = 'orders';
-- Cette requête affiche toutes les policies actives sur la table orders
