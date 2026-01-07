-- =====================================================
-- Migration 10: Correction RLS pour user_addresses
-- =====================================================
-- Objectif: Réparer les policies RLS pour permettre l'insertion d'adresses

-- 1. S'assurer que RLS est activé
ALTER TABLE IF EXISTS public.user_addresses ENABLE ROW LEVEL SECURITY;

-- 2. Supprimer TOUTES les anciennes policies (éviter les conflits de noms)
DROP POLICY IF EXISTS "Users can view their own addresses" ON public.user_addresses;
DROP POLICY IF EXISTS "Users can insert their own addresses" ON public.user_addresses;
DROP POLICY IF EXISTS "Users can update their own addresses" ON public.user_addresses;
DROP POLICY IF EXISTS "Users can delete their own addresses" ON public.user_addresses;

DROP POLICY IF EXISTS "Users can view own addresses" ON public.user_addresses;
DROP POLICY IF EXISTS "Users can insert own addresses" ON public.user_addresses;
DROP POLICY IF EXISTS "Users can update own addresses" ON public.user_addresses;
DROP POLICY IF EXISTS "Users can delete own addresses" ON public.user_addresses;

DROP POLICY IF EXISTS "Users can manage their own addresses" ON public.user_addresses;
DROP POLICY IF EXISTS "Users can view their own address" ON public.user_addresses;
DROP POLICY IF EXISTS "Users can insert their own address" ON public.user_addresses;
DROP POLICY IF EXISTS "Users can update their own address" ON public.user_addresses;
DROP POLICY IF EXISTS "Users can delete their own address" ON public.user_addresses;

-- 3. Créer les nouvelles policies explicites (noms cohérents)
-- SELECT : Les utilisateurs peuvent voir leurs propres adresses
CREATE POLICY "Users can view own addresses"
ON public.user_addresses
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- INSERT : Les utilisateurs peuvent insérer leurs propres adresses
CREATE POLICY "Users can insert own addresses"
ON public.user_addresses
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- UPDATE : Les utilisateurs peuvent mettre à jour leurs propres adresses
CREATE POLICY "Users can update own addresses"
ON public.user_addresses
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE : Les utilisateurs peuvent supprimer leurs propres adresses
CREATE POLICY "Users can delete own addresses"
ON public.user_addresses
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 4. Vérifier que la contrainte de clé étrangère référence auth.users
-- (Si la table existe avec une référence à profiles, on doit la corriger)
DO $$
BEGIN
  -- Vérifier si la contrainte existe et référence profiles au lieu de auth.users
  IF EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu 
      ON ccu.constraint_name = tc.constraint_name
    WHERE tc.table_name = 'user_addresses'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND kcu.column_name = 'user_id'
      AND ccu.table_schema = 'public'
      AND ccu.table_name = 'profiles'
  ) THEN
    -- Supprimer l'ancienne contrainte
    ALTER TABLE public.user_addresses
    DROP CONSTRAINT IF EXISTS user_addresses_user_id_fkey;
    
    -- Créer la nouvelle contrainte vers auth.users
    ALTER TABLE public.user_addresses
    ADD CONSTRAINT user_addresses_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;
  END IF;
END $$;

