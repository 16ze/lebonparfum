-- ============================================
-- Migration: Fix Orders RLS pour Invités & Admin
-- Description: Permet aux admins de voir toutes les commandes (y compris invités)
-- Date: 2025-01-XX
-- ============================================

-- PROBLÈME :
-- Les commandes invités ont `user_id = NULL`.
-- La policy admin existante ne permet pas de voir ces commandes car elle utilise
-- une requête qui peut échouer pour les lignes avec `user_id = NULL`.

-- SOLUTION :
-- 1. S'assurer que `user_id` est bien nullable
-- 2. Supprimer les anciennes policies restrictives
-- 3. Créer une nouvelle policy admin qui fonctionne même avec `user_id = NULL`
-- 4. Garder la policy client pour les utilisateurs connectés

-- 1. S'assurer que user_id est nullable (si ce n'est pas déjà fait)
ALTER TABLE public.orders 
ALTER COLUMN user_id DROP NOT NULL;

-- 2. Supprimer les anciennes policies
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Admin can view all orders" ON public.orders;

-- 3. Policy Client : Un utilisateur connecté peut voir ses commandes
CREATE POLICY "Users can view own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
);

-- 4. Policy Admin (CRITIQUE) : L'admin doit pouvoir voir TOUTES les lignes,
-- même celles avec user_id = NULL (commandes invités)
CREATE POLICY "Admin view all orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);

-- Note : Les policies INSERT et UPDATE restent inchangées si elles existent déjà.
-- Si elles n'existent pas, elles seront créées par d'autres migrations.
