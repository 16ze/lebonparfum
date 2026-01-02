-- ============================================
-- Migration: Authentification, Rôles Admin et Commandes
-- Description: Ajoute les tables profiles, orders, site_settings et les storage buckets
-- ============================================

-- 1. Création de la table PROFILES
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  is_admin boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Active la sécurité (RLS)
alter table public.profiles enable row level security;

-- Policies pour profiles
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check ((select auth.uid()) = id);

create policy "Users can update own profile." on public.profiles
  for update using ((select auth.uid()) = id);

-- 2. LE FIX DU BUG : Fonction et Trigger pour création automatique du profil
-- On utilise bien "security definer" et "language plpgsql"
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- On supprime le trigger s'il existe déjà pour éviter les erreurs
drop trigger if exists on_auth_user_created on auth.users;

-- On recrée le trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Création de la table ORDERS (Commandes)
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id), -- Nullable pour invités
  stripe_payment_id text,
  amount numeric,
  status text default 'pending', -- pending, paid, shipped
  items jsonb, -- Snapshot des articles achetés
  shipping_address jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.orders enable row level security;

-- Seul l'utilisateur peut voir ses commandes, ou l'admin
create policy "Users can view own orders" on public.orders
  for select using ((select auth.uid()) = user_id);
  
-- (Note: L'admin aura accès via le dashboard Supabase ou une policy admin spécifique plus tard)

-- 4. Création de la table SITE_SETTINGS (Config Admin)
create table if not exists public.site_settings (
  key text primary key,
  value text
);

-- Valeurs par défaut
insert into public.site_settings (key, value)
values 
  ('instagram_url', 'https://instagram.com'),
  ('tiktok_url', 'https://tiktok.com'),
  ('contact_email', 'contact@lebonparfum.com')
on conflict (key) do nothing;

-- 5. Création des BUCKETS de stockage (Images)
-- Note: Il faut insérer dans la table storage.buckets
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('content', 'content', true)
on conflict (id) do nothing;

-- Policy Storage: Lecture publique pour tous
create policy "Public Access Products" on storage.objects for select
using ( bucket_id = 'products' );

create policy "Public Access Content" on storage.objects for select
using ( bucket_id = 'content' );

-- Policy Storage: Upload pour Admin seulement (on simplifie pour l'auth user pour l'instant)
create policy "Auth Users can upload products" on storage.objects for insert
with check ( bucket_id = 'products' and auth.role() = 'authenticated' );
