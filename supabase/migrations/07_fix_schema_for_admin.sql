-- ============================================
-- Migration: Correction du schéma pour l'espace admin
-- Description: Ajoute les champs manquants et les policies admin
-- ============================================

-- 1. PRODUITS : Ajouter le champ "brand" si manquant
-- (On garde "collection" pour la compatibilité mais on ajoute "brand")
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'brand'
  ) THEN
    ALTER TABLE public.products ADD COLUMN brand TEXT;
  END IF;
END $$;

-- Mettre à jour brand depuis collection si vide
UPDATE public.products SET brand = collection WHERE brand IS NULL;

-- 2. PRODUITS : Modifier le type de "price" si nécessaire
-- (De "numeric" à "integer" pour stocker en centimes)
DO $$
BEGIN
  -- On vérifie le type actuel
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products'
    AND column_name = 'price'
    AND data_type = 'numeric'
  ) THEN
    -- Convertir les prix existants en centimes
    ALTER TABLE public.products ALTER COLUMN price TYPE INTEGER USING (price * 100)::INTEGER;
  END IF;
END $$;

-- 3. PRODUITS : Ajouter les policies admin pour CRUD
-- DROP des policies existantes qui pourraient conflicter
DROP POLICY IF EXISTS "Admin can insert products" ON public.products;
DROP POLICY IF EXISTS "Admin can update products" ON public.products;
DROP POLICY IF EXISTS "Admin can delete products" ON public.products;

-- Policy INSERT pour admin
CREATE POLICY "Admin can insert products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
);

-- Policy UPDATE pour admin
CREATE POLICY "Admin can update products"
ON public.products
FOR UPDATE
TO authenticated
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
);

-- Policy DELETE pour admin
CREATE POLICY "Admin can delete products"
ON public.products
FOR DELETE
TO authenticated
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
);

-- 4. COMMANDES : Ajouter policy pour que les admins voient toutes les commandes
DROP POLICY IF EXISTS "Admin can view all orders" ON public.orders;

CREATE POLICY "Admin can view all orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
);

-- 5. SITE_SETTINGS : Supprimer l'ancienne table et recréer la nouvelle
DROP TABLE IF EXISTS public.site_settings CASCADE;

CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Fonction pour updated_at (si pas déjà créée)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON site_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insérer les valeurs par défaut
INSERT INTO site_settings (setting_key, setting_value) VALUES
  ('social_instagram', ''),
  ('social_facebook', ''),
  ('social_twitter', ''),
  ('social_tiktok', ''),
  ('social_youtube', '')
ON CONFLICT (setting_key) DO NOTHING;

-- RLS pour site_settings
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admin can update site settings" ON public.site_settings;

CREATE POLICY "Public can read site settings"
ON site_settings FOR SELECT
TO public
USING (true);

CREATE POLICY "Admin can update site settings"
ON site_settings FOR UPDATE
TO authenticated
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
);

-- 6. USER_ADDRESSES : Créer la table si elle n'existe pas
CREATE TABLE IF NOT EXISTS user_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT DEFAULT 'France' NOT NULL,
  is_default BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Index pour user_id
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);

-- Trigger updated_at
DROP TRIGGER IF EXISTS update_user_addresses_updated_at ON user_addresses;
CREATE TRIGGER update_user_addresses_updated_at
BEFORE UPDATE ON user_addresses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour garantir une seule adresse par défaut
CREATE OR REPLACE FUNCTION ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE user_addresses
    SET is_default = false
    WHERE user_id = NEW.user_id AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_single_default_address ON user_addresses;
CREATE TRIGGER enforce_single_default_address
BEFORE INSERT OR UPDATE ON user_addresses
FOR EACH ROW
EXECUTE FUNCTION ensure_single_default_address();

-- RLS pour user_addresses
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own addresses" ON user_addresses;
DROP POLICY IF EXISTS "Users can insert own addresses" ON user_addresses;
DROP POLICY IF EXISTS "Users can update own addresses" ON user_addresses;
DROP POLICY IF EXISTS "Users can delete own addresses" ON user_addresses;

CREATE POLICY "Users can view own addresses"
ON user_addresses FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own addresses"
ON user_addresses FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses"
ON user_addresses FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses"
ON user_addresses FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 7. STORAGE : Créer le bucket product-images si manquant
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policies pour product-images
DROP POLICY IF EXISTS "Admin can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete product images" ON storage.objects;

CREATE POLICY "Admin can upload product images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'product-images' AND
  (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true))
);

CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'product-images');

CREATE POLICY "Admin can delete product images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'product-images' AND
  (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true))
);

-- Commentaires
COMMENT ON TABLE user_addresses IS 'Adresses de livraison multiples par utilisateur';
COMMENT ON TABLE site_settings IS 'Paramètres globaux du site (réseaux sociaux, etc.)';
COMMENT ON COLUMN products.brand IS 'Marque du parfum (ex: Byredo, Tom Ford)';
