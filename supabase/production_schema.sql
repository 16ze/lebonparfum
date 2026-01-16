-- ============================================
-- SCHÉMA COMPLET DE PRODUCTION - THE PARFUMERIEE
-- ============================================
-- Description: Fichier SQL maître pour créer le backend complet
-- Usage: Copier-coller ce fichier dans Supabase Dashboard > SQL Editor
-- Date: 2026-01-16
-- 
-- CONTENU :
-- 1. Extensions (pg_trgm)
-- 2. Fonctions utilitaires (slug, stock, updated_at, etc.)
-- 3. Tables principales (profiles, products, categories, tags, orders, etc.)
-- 4. Storage buckets (product-images, content)
-- 5. Row Level Security (RLS) - Toutes les policies
-- 6. Indexes de performance
-- 7. Instructions création compte admin
-- 
-- IMPORTANT : Ce fichier est idempotent (peut être exécuté plusieurs fois)
-- ============================================

-- ============================================
-- PARTIE 1: EXTENSIONS
-- ============================================

-- Extension pour recherche full-text (pg_trgm)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================
-- PARTIE 2: FONCTIONS UTILITAIRES
-- ============================================

-- Fonction pour updated_at automatique
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour générer un slug URL-friendly
CREATE OR REPLACE FUNCTION generate_slug(text_input TEXT)
RETURNS TEXT AS $$
DECLARE
  slug TEXT;
BEGIN
  slug := LOWER(text_input);
  slug := TRANSLATE(
    slug,
    'àáâãäåāăąèéêëēĕėęěìíîïìĩīĭòóôõöōŏőùúûüũūŭůçćĉċčñńņň',
    'aaaaaaaaaeeeeeeeeeiiiiiiiiooooooooouuuuuuuuccccccnnnnn'
  );
  slug := REGEXP_REPLACE(slug, '[''"`]', '', 'g');
  slug := REGEXP_REPLACE(slug, '[^a-z0-9]+', '-', 'g');
  slug := TRIM(BOTH '-' FROM slug);
  slug := REGEXP_REPLACE(slug, '-+', '-', 'g');
  RETURN slug;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION generate_slug(TEXT) IS
'Génère un slug URL-friendly depuis un texte (minuscules, sans accents, tirets)';

-- Fonction pour décrémenter le stock de manière atomique
CREATE OR REPLACE FUNCTION decrement_stock(
  product_id UUID,
  quantity INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE products
  SET stock = stock - quantity
  WHERE id = product_id
  AND stock >= quantity;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Stock insuffisant ou produit introuvable pour ID: %', product_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION decrement_stock IS 'Décrémente le stock d''un produit de manière atomique après un achat';

-- Fonction helper pour statistiques produits par statut
CREATE OR REPLACE FUNCTION get_product_status_stats()
RETURNS TABLE (
  status TEXT,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.status,
    COUNT(*) as count
  FROM products p
  GROUP BY p.status
  ORDER BY
    CASE p.status
      WHEN 'published' THEN 1
      WHEN 'draft' THEN 2
      WHEN 'archived' THEN 3
    END;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_product_status_stats() IS
'Retourne le nombre de produits par statut pour statistiques admin';

-- Fonction pour créer compte de fidélité automatiquement
CREATE OR REPLACE FUNCTION public.handle_new_user_loyalty()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.loyalty_points (user_id, points, total_earned)
  VALUES (new.id, 0, 0);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_loyalty ON auth.users;
CREATE TRIGGER on_auth_user_created_loyalty
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_loyalty();

-- Fonction pour ajouter des points après un achat
CREATE OR REPLACE FUNCTION public.add_loyalty_points_from_order(
  p_user_id UUID,
  p_order_id UUID,
  p_amount INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_points INTEGER;
BEGIN
  v_points := (p_amount / 10);
  
  UPDATE public.loyalty_points
  SET 
    points = points + v_points,
    total_earned = total_earned + v_points,
    last_updated = now()
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    INSERT INTO public.loyalty_points (user_id, points, total_earned)
    VALUES (p_user_id, v_points, v_points);
  END IF;
  
  INSERT INTO public.loyalty_transactions (user_id, points, type, description, order_id)
  VALUES (
    p_user_id,
    v_points,
    'earned_purchase',
    format('Achat de %s euros', (p_amount::numeric / 100)::text),
    p_order_id
  );
END;
$$;

-- ============================================
-- PARTIE 3: TABLES PRINCIPALES
-- ============================================

-- Table PROFILES (liée à auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.profiles IS 'Profils utilisateurs liés à auth.users';

-- Trigger pour création automatique du profil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Table PRODUCTS (avec toutes les colonnes)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  brand TEXT,
  collection TEXT NOT NULL,
  price INTEGER NOT NULL, -- Prix en centimes
  description TEXT,
  notes TEXT,
  inspiration TEXT,
  image_url TEXT,
  stock INTEGER DEFAULT 0,
  category TEXT,
  -- Colonnes SEO
  meta_title TEXT,
  meta_description TEXT,
  seo_keywords TEXT[],
  -- Statut publication
  status TEXT DEFAULT 'draft' NOT NULL,
  -- Variantes produits
  variants JSONB DEFAULT '[]'::jsonb NOT NULL
);

-- Contraintes produits
ALTER TABLE public.products
ADD CONSTRAINT products_status_check
CHECK (status IN ('draft', 'published', 'archived'));

ALTER TABLE public.products
ADD CONSTRAINT products_meta_title_length
CHECK (meta_title IS NULL OR LENGTH(meta_title) <= 60);

ALTER TABLE public.products
ADD CONSTRAINT products_meta_description_length
CHECK (meta_description IS NULL OR LENGTH(meta_description) <= 160);

COMMENT ON COLUMN public.products.variants IS 
'Tableau JSONB des variantes du produit. Structure: [{"label": "50ml", "price": 1500, "stock": 10}]. 
Si vide ([]), le produit utilise le prix et stock de base.';

COMMENT ON COLUMN public.products.status IS
'Statut du produit: draft (brouillon invisible), published (visible clients), archived (masqué mais conservé)';

-- Trigger auto-génération slug
CREATE OR REPLACE FUNCTION auto_generate_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.name);
    WHILE EXISTS (SELECT 1 FROM products WHERE slug = NEW.slug AND id != NEW.id) LOOP
      NEW.slug := NEW.slug || '-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8);
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_generate_slug ON products;
CREATE TRIGGER trigger_auto_generate_slug
BEFORE INSERT OR UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION auto_generate_slug();

-- Table CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.categories IS 'Catégories de produits (ex: Homme, Femme, Unisexe)';

-- Table TAGS
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.tags IS 'Tags de produits (ex: Nouveau, Luxe, Été)';

-- Table PRODUCT_CATEGORIES (liaison many-to-many)
CREATE TABLE IF NOT EXISTS public.product_categories (
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (product_id, category_id)
);

COMMENT ON TABLE public.product_categories IS 'Liaison many-to-many entre produits et catégories';

-- Table PRODUCT_TAGS (liaison many-to-many)
CREATE TABLE IF NOT EXISTS public.product_tags (
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (product_id, tag_id)
);

COMMENT ON TABLE public.product_tags IS 'Liaison many-to-many entre produits et tags';

-- Table SITE_SETTINGS
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Trigger updated_at pour site_settings
DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON site_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Valeurs par défaut site_settings
INSERT INTO site_settings (setting_key, setting_value) VALUES
  ('social_instagram', ''),
  ('social_facebook', ''),
  ('social_twitter', ''),
  ('social_tiktok', ''),
  ('social_youtube', '')
ON CONFLICT (setting_key) DO NOTHING;

COMMENT ON TABLE site_settings IS 'Paramètres globaux du site (réseaux sociaux, etc.)';

-- Table USER_ADDRESSES
CREATE TABLE IF NOT EXISTS public.user_addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  address TEXT NOT NULL,
  address_complement TEXT,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'France',
  phone TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

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

-- Trigger updated_at pour user_addresses
DROP TRIGGER IF EXISTS update_user_addresses_updated_at ON user_addresses;
CREATE TRIGGER update_user_addresses_updated_at
BEFORE UPDATE ON user_addresses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Table WISHLIST
CREATE TABLE IF NOT EXISTS public.wishlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, product_id)
);

COMMENT ON TABLE public.wishlist IS 'Liste de souhaits utilisateur';

-- Table NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.notifications IS 'Notifications utilisateur';

-- Table LOYALTY_POINTS (Programme de fidélité)
CREATE TABLE IF NOT EXISTS public.loyalty_points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  total_earned INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

-- Table LOYALTY_TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.loyalty_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  points INTEGER NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table ORDERS (Commandes)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Nullable pour invités
  stripe_payment_id TEXT UNIQUE, -- Contrainte unique pour éviter doublons
  amount INTEGER NOT NULL, -- Montant en centimes
  payment_status TEXT DEFAULT 'pending' NOT NULL, -- pending, paid, failed, refunded
  status TEXT DEFAULT 'pending' NOT NULL, -- pending, paid, shipped, delivered, cancelled
  items JSONB NOT NULL, -- Snapshot des articles achetés
  shipping_address JSONB,
  customer_email TEXT, -- Snapshot email client (pour invités)
  customer_name TEXT, -- Snapshot nom client (pour invités)
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON COLUMN public.orders.customer_email IS 
'Email du client au moment de la commande (snapshot). Pour les utilisateurs connectés, peut être complété depuis profiles.email. Pour les invités, vient de paymentIntent.receipt_email ou metadata.';

COMMENT ON COLUMN public.orders.customer_name IS 
'Nom du client au moment de la commande (snapshot). Pour les utilisateurs connectés, peut être complété depuis profiles.full_name. Pour les invités, vient de paymentIntent.shipping.name ou metadata.';

COMMENT ON CONSTRAINT orders_stripe_payment_id_key ON public.orders IS 
'Contrainte unique empêchant les doublons de commandes. Si Stripe envoie le même payment_intent plusieurs fois (retry), la base de données bloquera l''insertion du doublon.';

-- ============================================
-- PARTIE 4: STORAGE BUCKETS
-- ============================================

-- Bucket product-images (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Bucket content (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('content', 'content', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- PARTIE 5: ROW LEVEL SECURITY (RLS)
-- ============================================

-- PROFILES RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile via ID or Email" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile via ID or Email"
ON public.profiles
FOR SELECT
USING (
  id = auth.uid() 
  OR 
  email = (auth.jwt() ->> 'email')
);

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING ((SELECT auth.uid()) = id);

-- PRODUCTS RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read" ON public.products;
DROP POLICY IF EXISTS "Admin can insert products" ON public.products;
DROP POLICY IF EXISTS "Admin can update products" ON public.products;
DROP POLICY IF EXISTS "Admin can delete products" ON public.products;

CREATE POLICY "Public Read"
ON public.products
FOR SELECT
USING (true);

CREATE POLICY "Admin can insert products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
);

CREATE POLICY "Admin can update products"
ON public.products
FOR UPDATE
TO authenticated
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
);

CREATE POLICY "Admin can delete products"
ON public.products
FOR DELETE
TO authenticated
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
);

-- CATEGORIES RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read categories" ON public.categories;
DROP POLICY IF EXISTS "Admin can manage categories" ON public.categories;

CREATE POLICY "Public can read categories"
ON public.categories
FOR SELECT
USING (true);

CREATE POLICY "Admin can manage categories"
ON public.categories
FOR ALL
TO authenticated
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
)
WITH CHECK (
  auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
);

-- TAGS RLS
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read tags" ON public.tags;
DROP POLICY IF EXISTS "Admin can manage tags" ON public.tags;

CREATE POLICY "Public can read tags"
ON public.tags
FOR SELECT
USING (true);

CREATE POLICY "Admin can manage tags"
ON public.tags
FOR ALL
TO authenticated
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
)
WITH CHECK (
  auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
);

-- PRODUCT_CATEGORIES RLS
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read product_categories" ON public.product_categories;
DROP POLICY IF EXISTS "Admin can manage product_categories" ON public.product_categories;

CREATE POLICY "Public can read product_categories"
ON public.product_categories
FOR SELECT
USING (true);

CREATE POLICY "Admin can manage product_categories"
ON public.product_categories
FOR ALL
TO authenticated
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
)
WITH CHECK (
  auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
);

-- PRODUCT_TAGS RLS
ALTER TABLE public.product_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read product_tags" ON public.product_tags;
DROP POLICY IF EXISTS "Admin can manage product_tags" ON public.product_tags;

CREATE POLICY "Public can read product_tags"
ON public.product_tags
FOR SELECT
USING (true);

CREATE POLICY "Admin can manage product_tags"
ON public.product_tags
FOR ALL
TO authenticated
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
)
WITH CHECK (
  auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
);

-- SITE_SETTINGS RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read site settings" ON site_settings;
DROP POLICY IF EXISTS "Admin can update site settings" ON site_settings;

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

-- USER_ADDRESSES RLS
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

-- WISHLIST RLS
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own wishlist" ON public.wishlist;
DROP POLICY IF EXISTS "Users can add to own wishlist" ON public.wishlist;
DROP POLICY IF EXISTS "Users can remove from own wishlist" ON public.wishlist;

CREATE POLICY "Users can view own wishlist"
ON public.wishlist
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can add to own wishlist"
ON public.wishlist
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from own wishlist"
ON public.wishlist
FOR DELETE
USING (auth.uid() = user_id);

-- NOTIFICATIONS RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;

CREATE POLICY "Users can view own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- LOYALTY_POINTS RLS
ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own loyalty points" ON public.loyalty_points;

CREATE POLICY "Users can view own loyalty points"
ON public.loyalty_points
FOR SELECT
USING (auth.uid() = user_id);

-- LOYALTY_TRANSACTIONS RLS
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own loyalty transactions" ON public.loyalty_transactions;

CREATE POLICY "Users can view own loyalty transactions"
ON public.loyalty_transactions
FOR SELECT
USING (auth.uid() = user_id);

-- ORDERS RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Admin can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admin view all orders" ON public.orders;

CREATE POLICY "Users can view own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
);

CREATE POLICY "Admin can view all orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
);

-- STORAGE RLS
DROP POLICY IF EXISTS "Admin can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Public Access Products" ON storage.objects;
DROP POLICY IF EXISTS "Public Access Content" ON storage.objects;

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

CREATE POLICY "Admin can update product images"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'product-images' AND
  (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true))
);

CREATE POLICY "Public Access Content"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'content');

-- ============================================
-- PARTIE 6: INDEXES PERFORMANCE
-- ============================================

-- Indexes sur slugs
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);

-- Indexes sur user_id
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_points_user_id ON loyalty_points(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_user_id ON loyalty_transactions(user_id);

-- Indexes sur product_id
CREATE INDEX IF NOT EXISTS idx_product_categories_product_id ON product_categories(product_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_category_id ON product_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_product_tags_product_id ON product_tags(product_id);
CREATE INDEX IF NOT EXISTS idx_product_tags_tag_id ON product_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product_id ON wishlist(product_id);

-- Indexes composites
CREATE UNIQUE INDEX IF NOT EXISTS idx_wishlist_user_product ON wishlist(user_id, product_id);

-- Indexes de tri
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock) WHERE stock > 0;
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Indexes statut produits
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_status_created ON products(status, created_at DESC) WHERE status = 'published';

-- Indexes variantes (GIN)
CREATE INDEX IF NOT EXISTS idx_products_variants ON products USING GIN (variants);

-- Indexes full-text search (pg_trgm)
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_brand_trgm ON products USING gin (brand gin_trgm_ops);

-- Indexes notifications
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);

-- Indexes loyalty
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_order_id ON loyalty_transactions(order_id);

-- Indexes collection et category (legacy)
CREATE INDEX IF NOT EXISTS idx_products_collection ON products(collection);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_inspiration ON products(inspiration) WHERE inspiration IS NOT NULL;

-- ============================================
-- PARTIE 7: MIGRATION DONNÉES EXISTANTES
-- ============================================

-- Passer tous les produits existants en 'published' (sécurité)
UPDATE products
SET status = 'published'
WHERE status = 'draft';

-- Mettre à jour brand depuis collection si vide
UPDATE products SET brand = collection WHERE brand IS NULL;

-- ============================================
-- PARTIE 8: ANALYSE STATISTIQUES
-- ============================================

ANALYZE products;
ANALYZE categories;
ANALYZE tags;
ANALYZE wishlist;
ANALYZE orders;
ANALYZE user_addresses;
ANALYZE notifications;
ANALYZE product_categories;
ANALYZE product_tags;
ANALYZE profiles;
ANALYZE site_settings;

-- ============================================
-- PARTIE 9: CRÉATION COMPTE ADMIN
-- ============================================

-- INSTRUCTIONS POUR CRÉER UN COMPTE ADMIN :
-- 
-- 1. Créez d'abord un compte utilisateur via l'interface d'authentification
--    (inscription email/mot de passe ou connexion Google OAuth)
--
-- 2. Une fois le compte créé, récupérez l'ID utilisateur depuis :
--    - Supabase Dashboard > Authentication > Users
--    - Ou via SQL : SELECT id, email FROM auth.users WHERE email = 'votre-email@example.com';
--
-- 3. Mettez à jour le profil pour le rendre admin :
--    UPDATE public.profiles 
--    SET is_admin = true 
--    WHERE email = 'votre-email@example.com';
--
-- 4. Vérifiez que c'est bien appliqué :
--    SELECT id, email, is_admin FROM public.profiles WHERE email = 'votre-email@example.com';
--
-- 5. Déconnectez-vous et reconnectez-vous pour que les changements prennent effet
--
-- NOTE : En production, utilisez toujours l'email pour identifier l'admin,
-- car les IDs peuvent différer entre email/password et OAuth Google.

-- ============================================
-- FIN DU SCHÉMA
-- ============================================

-- Vérification finale
DO $$
DECLARE
  tables_count INTEGER;
  policies_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO tables_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN ('profiles', 'products', 'categories', 'tags', 'orders', 'site_settings', 'user_addresses', 'wishlist');
  
  SELECT COUNT(*) INTO policies_count
  FROM pg_policies
  WHERE schemaname = 'public';
  
  RAISE NOTICE '✅ Schéma créé avec succès !';
  RAISE NOTICE '📊 Tables créées: %', tables_count;
  RAISE NOTICE '🔒 Policies RLS créées: %', policies_count;
END $$;

-- ============================================
-- INSTRUCTIONS POST-DÉPLOIEMENT
-- ============================================
--
-- 1. CRÉER UN COMPTE ADMIN :
--    Après avoir créé un compte utilisateur via l'interface d'authentification,
--    exécutez cette requête (remplacez l'email) :
--
--    UPDATE public.profiles 
--    SET is_admin = true 
--    WHERE email = 'votre-email@example.com';
--
-- 2. VÉRIFIER LES BUCKETS STORAGE :
--    Vérifiez que les buckets 'product-images' et 'content' sont bien créés :
--    SELECT * FROM storage.buckets;
--
-- 3. TESTER LES POLICIES RLS :
--    Connectez-vous en tant qu'admin et vérifiez l'accès aux tables :
--    SELECT * FROM public.products LIMIT 1;
--    SELECT * FROM public.orders LIMIT 1;
--
-- 4. MIGRER LES DONNÉES (si nécessaire) :
--    Si vous avez des données existantes, adaptez les scripts de migration
--    pour les transférer vers le nouveau schéma.
--
-- ============================================
-- FIN DU FICHIER
-- ============================================
