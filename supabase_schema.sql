-- ============================================
-- Schéma SQL pour la table products
-- ============================================
-- Description: Table pour stocker le catalogue de parfums Le Bon Parfum
-- 
-- Instructions:
--   1. Ouvrez Supabase Dashboard > SQL Editor
--   2. Copiez-collez ce fichier complet
--   3. Exécutez la requête
-- ============================================

-- Création de la table products
create table public.products (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  slug text not null unique,
  collection text not null, -- Ex: 'CP KING', 'CP PARIS', 'NOTE 33', 'CASABLANCA'
  price numeric not null,
  description text, -- Le texte marketing
  notes text, -- Ex: "Vanille, Tabac, Épices" (notes olfactives)
  inspiration text, -- Ex: "Black Opium - YSL" (Optionnel, pour le filtre)
  image_url text, -- L'URL de l'image
  stock integer default 0, -- Gestion des stocks
  category text -- Ex: 'Homme', 'Femme', 'Unisexe'
);

-- Index sur le slug pour les recherches rapides (URLs)
create index idx_products_slug on public.products(slug);

-- Index sur la collection pour les filtres
create index idx_products_collection on public.products(collection);

-- Index sur la catégorie pour les filtres
create index idx_products_category on public.products(category);

-- Index sur l'inspiration pour les recherches de dupes
create index idx_products_inspiration on public.products(inspiration) where inspiration is not null;

-- Row Level Security (RLS) : Les produits sont visibles par tous
alter table public.products enable row level security;

-- Policy : Tous les produits sont visibles publiquement (lecture seule)
create policy "Public products are viewable by everyone." 
  on public.products 
  for select 
  using (true);

-- ============================================
-- Notes:
-- - La table est maintenant prête à recevoir des données
-- - Utilisez le script seed.ts pour injecter les produits
-- - Les champs `description`, `notes`, `inspiration`, `image_url` sont optionnels
-- ============================================

