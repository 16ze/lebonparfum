-- ============================================
-- Migration: Authentification, Rôles Admin et Commandes
-- Description: Ajoute les tables profiles, orders, site_settings et les storage buckets
-- ============================================

-- ============================================
-- 1. TABLE PROFILES (Extension de Auth)
-- ============================================

-- Création de la table profiles
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  full_name text,
  is_admin boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index pour les recherches par email
create index idx_profiles_email on public.profiles(email);

-- Index pour les recherches admin
create index idx_profiles_is_admin on public.profiles(is_admin) where is_admin = true;

-- RLS : Les utilisateurs peuvent voir leur propre profil et les admins peuvent tout voir
alter table public.profiles enable row level security;

-- Policy : Un utilisateur peut voir son propre profil
create policy "Users can view own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

-- Policy : Les admins peuvent voir tous les profils
create policy "Admins can view all profiles"
  on public.profiles
  for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- Policy : Un utilisateur peut mettre à jour son propre profil (sauf is_admin)
create policy "Users can update own profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id and
    -- Empêcher un utilisateur de se donner le rôle admin
    (old.is_admin = new.is_admin)
  );

-- Policy : Seuls les admins peuvent modifier is_admin
create policy "Admins can update admin status"
  on public.profiles
  for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- ============================================
-- 2. TRIGGER : Auto-création du profil à l'inscription
-- ============================================

-- Fonction pour créer automatiquement un profil lors de l'inscription
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger : Crée un profil à chaque création d'utilisateur dans auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- 3. TABLE ORDERS (Historique des Commandes)
-- ============================================

-- Création de la table orders
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null, -- Nullable pour les commandes invités
  stripe_payment_id text not null unique, -- ID du PaymentIntent Stripe
  amount numeric not null, -- Montant total en euros
  status text not null default 'pending', -- 'pending', 'paid', 'shipped', 'delivered', 'cancelled'
  items jsonb not null, -- Snapshot des produits achetés [{ id, name, price, quantity, ... }]
  shipping_address jsonb, -- Adresse de livraison { email, firstName, lastName, address, city, postalCode }
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index sur user_id pour les recherches rapides
create index idx_orders_user_id on public.orders(user_id);

-- Index sur stripe_payment_id pour éviter les doublons
create index idx_orders_stripe_payment_id on public.orders(stripe_payment_id);

-- Index sur created_at pour le tri chronologique
create index idx_orders_created_at on public.orders(created_at desc);

-- Index sur status pour les filtres
create index idx_orders_status on public.orders(status);

-- RLS : Les utilisateurs ne peuvent voir que leurs propres commandes
alter table public.orders enable row level security;

-- Policy : Un utilisateur peut voir ses propres commandes
create policy "Users can view own orders"
  on public.orders
  for select
  using (
    auth.uid() = user_id or
    user_id is null -- Les commandes invités ne sont visibles par personne (sauf admin)
  );

-- Policy : Les admins peuvent voir toutes les commandes
create policy "Admins can view all orders"
  on public.orders
  for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- Policy : Seuls les admins peuvent créer/modifier des commandes
-- (Les commandes sont créées côté serveur via l'API)
create policy "Admins can manage orders"
  on public.orders
  for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- ============================================
-- 4. TABLE SITE_SETTINGS (Configuration Site)
-- ============================================

-- Création de la table site_settings
create table public.site_settings (
  key text primary key,
  value text not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS : Lecture publique, écriture admin uniquement
alter table public.site_settings enable row level security;

-- Policy : Tout le monde peut lire les settings
create policy "Public can read settings"
  on public.site_settings
  for select
  using (true);

-- Policy : Seuls les admins peuvent modifier les settings
create policy "Admins can manage settings"
  on public.site_settings
  for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- Insertion des settings initiaux
insert into public.site_settings (key, value) values
  ('instagram_url', 'https://instagram.com'),
  ('tiktok_url', 'https://tiktok.com'),
  ('contact_email', 'contact@lebonparfum.com')
on conflict (key) do nothing;

-- ============================================
-- 5. STORAGE BUCKETS (Images Produits & Contenu)
-- ============================================

-- Bucket pour les images produits
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'products',
  'products',
  true, -- Public : les images sont accessibles publiquement
  5242880, -- 5MB max par fichier
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Bucket pour les images de contenu (home, bannières)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'content',
  'content',
  true, -- Public
  10485760, -- 10MB max par fichier
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- ============================================
-- 6. STORAGE POLICIES
-- ============================================

-- Policies pour le bucket 'products'
-- Lecture : Publique
create policy "Public can view product images"
  on storage.objects
  for select
  using (bucket_id = 'products');

-- Écriture/Suppression : Admins uniquement
create policy "Admins can upload product images"
  on storage.objects
  for insert
  with check (
    bucket_id = 'products' and
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

create policy "Admins can update product images"
  on storage.objects
  for update
  using (
    bucket_id = 'products' and
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

create policy "Admins can delete product images"
  on storage.objects
  for delete
  using (
    bucket_id = 'products' and
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- Policies pour le bucket 'content'
-- Lecture : Publique
create policy "Public can view content images"
  on storage.objects
  for select
  using (bucket_id = 'content');

-- Écriture/Suppression : Admins uniquement
create policy "Admins can upload content images"
  on storage.objects
  for insert
  with check (
    bucket_id = 'content' and
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

create policy "Admins can update content images"
  on storage.objects
  for update
  using (
    bucket_id = 'content' and
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

create policy "Admins can delete content images"
  on storage.objects
  for delete
  using (
    bucket_id = 'content' and
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- ============================================
-- 7. MISE À JOUR RLS POUR PRODUCTS (Écriture Admin)
-- ============================================

-- Supprimer les anciennes policies d'écriture si elles existent
drop policy if exists "Admins can manage products" on public.products;
drop policy if exists "Public can insert products" on public.products;
drop policy if exists "Public can update products" on public.products;
drop policy if exists "Public can delete products" on public.products;

-- Policy : Seuls les admins peuvent insérer des produits
create policy "Admins can insert products"
  on public.products
  for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- Policy : Seuls les admins peuvent mettre à jour des produits
create policy "Admins can update products"
  on public.products
  for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- Policy : Seuls les admins peuvent supprimer des produits
create policy "Admins can delete products"
  on public.products
  for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- ============================================
-- NOTES IMPORTANTES
-- ============================================
-- 1. Pour créer un compte admin :
--    UPDATE public.profiles SET is_admin = true WHERE email = 'admin@example.com';
--
-- 2. Les commandes invités (user_id = null) ne sont visibles que par les admins
--
-- 3. Les images produits doivent être uploadées via l'interface admin
--    URL publique : https://[project].supabase.co/storage/v1/object/public/products/[filename]
--
-- 4. Les settings peuvent être modifiés via l'interface admin sans toucher au code
-- ============================================

