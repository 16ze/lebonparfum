-- Migration: Création de la table products
-- Description: Table pour stocker le catalogue de parfums

-- Création de la table products
create table public.products (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  slug text not null unique,
  collection text not null, -- Ex: 'CP KING', 'CP PARIS', 'NOTE 33', 'CASABLANCA'
  price numeric not null,
  description text,
  image_url text, -- URL de l'image (placeholders pour l'instant)
  category text -- Ex: 'Homme', 'Femme', 'Unisexe'
);

-- Index sur le slug pour les recherches rapides
create index idx_products_slug on public.products(slug);

-- Index sur la collection pour les filtres
create index idx_products_collection on public.products(collection);

-- Row Level Security (RLS) : Les produits sont visibles par tous
alter table public.products enable row level security;

-- Policy : Tous les produits sont visibles publiquement
create policy "Public products are viewable by everyone." 
  on public.products 
  for select 
  using (true);

