-- ============================================
-- Migration: Fix RLS pour profiles (Support Google OAuth)
-- Description: Permet la lecture du profil par ID OU par Email pour supporter Google OAuth
-- Date: 2025-01-XX
-- ============================================

-- PROBLÈME :
-- Lorsqu'un utilisateur se connecte via Google OAuth, il obtient un ID différent
-- de celui créé lors de l'inscription par email/mot de passe, même si l'email est identique.
-- La policy RLS actuelle (`auth.uid() = id`) empêche l'utilisateur Google de voir
-- la ligne créée par l'utilisateur "Email/Password", même si l'email est identique.

-- SOLUTION :
-- Créer une nouvelle policy qui autorise la lecture si :
-- 1. L'ID correspond (auth.uid() = id) - Cas normal
-- 2. OU si l'email correspond (email = auth.jwt() ->> 'email') - Cas Google OAuth

-- On supprime les anciennes règles de lecture restrictives
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;

-- Nouvelle règle : Je peux voir mon profil si l'ID matche OU si l'Email matche
-- Cela permet à un utilisateur Google OAuth de voir son profil même si l'ID est différent
-- mais que l'email correspond à celui dans la base de données
CREATE POLICY "Users can view own profile via ID or Email"
ON public.profiles
FOR SELECT
USING (
  id = auth.uid() 
  OR 
  email = (auth.jwt() ->> 'email')
);

-- Note : Les policies INSERT et UPDATE restent inchangées car elles utilisent déjà auth.uid()
-- et sont suffisamment restrictives pour la sécurité.
