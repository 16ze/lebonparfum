-- Migration 09: Tables pour features avancées espace client
-- user_addresses, wishlist, notifications, loyalty_points

-- =============================================
-- 1. TABLE USER_ADDRESSES (Adresses de livraison)
-- =============================================
create table if not exists public.user_addresses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  label text not null, -- Ex: "Maison", "Bureau", "Parents"
  first_name text not null,
  last_name text not null,
  address text not null,
  address_complement text,
  city text not null,
  postal_code text not null,
  country text not null default 'France',
  phone text,
  is_default boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index pour recherche rapide par user
create index if not exists user_addresses_user_id_idx on public.user_addresses(user_id);

-- RLS: Un utilisateur ne voit que ses adresses
alter table public.user_addresses enable row level security;

create policy "Users can view own addresses" on public.user_addresses
  for select using (auth.uid() = user_id);

create policy "Users can insert own addresses" on public.user_addresses
  for insert with check (auth.uid() = user_id);

create policy "Users can update own addresses" on public.user_addresses
  for update using (auth.uid() = user_id);

create policy "Users can delete own addresses" on public.user_addresses
  for delete using (auth.uid() = user_id);

-- Trigger pour updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger user_addresses_updated_at
  before update on public.user_addresses
  for each row
  execute function public.handle_updated_at();

-- =============================================
-- 2. TABLE WISHLIST (Liste de souhaits)
-- =============================================
create table if not exists public.wishlist (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, product_id) -- Un produit une seule fois par user
);

-- Index pour recherche rapide
create index if not exists wishlist_user_id_idx on public.wishlist(user_id);
create index if not exists wishlist_product_id_idx on public.wishlist(product_id);

-- RLS: Un utilisateur ne voit que sa wishlist
alter table public.wishlist enable row level security;

create policy "Users can view own wishlist" on public.wishlist
  for select using (auth.uid() = user_id);

create policy "Users can add to own wishlist" on public.wishlist
  for insert with check (auth.uid() = user_id);

create policy "Users can remove from own wishlist" on public.wishlist
  for delete using (auth.uid() = user_id);

-- =============================================
-- 3. TABLE NOTIFICATIONS (Notifications utilisateur)
-- =============================================
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null, -- 'order_status', 'promotion', 'info'
  title text not null,
  message text not null,
  link text, -- URL optionnelle (ex: /account/orders/123)
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index pour recherche rapide
create index if not exists notifications_user_id_idx on public.notifications(user_id);
create index if not exists notifications_is_read_idx on public.notifications(is_read);

-- RLS: Un utilisateur ne voit que ses notifications
alter table public.notifications enable row level security;

create policy "Users can view own notifications" on public.notifications
  for select using (auth.uid() = user_id);

create policy "Users can update own notifications" on public.notifications
  for update using (auth.uid() = user_id);

-- =============================================
-- 4. TABLE LOYALTY_POINTS (Programme de fidélité)
-- =============================================
create table if not exists public.loyalty_points (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  points integer not null default 0,
  total_earned integer not null default 0, -- Total cumulé (jamais décrémenté)
  last_updated timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

-- Index
create index if not exists loyalty_points_user_id_idx on public.loyalty_points(user_id);

-- RLS: Un utilisateur ne voit que ses points
alter table public.loyalty_points enable row level security;

create policy "Users can view own loyalty points" on public.loyalty_points
  for select using (auth.uid() = user_id);

-- =============================================
-- 5. TABLE LOYALTY_TRANSACTIONS (Historique des points)
-- =============================================
create table if not exists public.loyalty_transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  points integer not null, -- Positif = gain, Négatif = dépense
  type text not null, -- 'earned_purchase', 'spent_discount', 'bonus', 'refund'
  description text not null,
  order_id uuid references public.orders(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index
create index if not exists loyalty_transactions_user_id_idx on public.loyalty_transactions(user_id);
create index if not exists loyalty_transactions_order_id_idx on public.loyalty_transactions(order_id);

-- RLS: Un utilisateur ne voit que ses transactions
alter table public.loyalty_transactions enable row level security;

create policy "Users can view own loyalty transactions" on public.loyalty_transactions
  for select using (auth.uid() = user_id);

-- =============================================
-- 6. FONCTION: Créer compte de fidélité automatiquement
-- =============================================
create or replace function public.handle_new_user_loyalty()
returns trigger as $$
begin
  -- Créer un compte de points pour le nouvel utilisateur
  insert into public.loyalty_points (user_id, points, total_earned)
  values (new.id, 0, 0);
  
  return new;
end;
$$ language plpgsql security definer;

-- Trigger pour créer le compte de fidélité à l'inscription
drop trigger if exists on_auth_user_created_loyalty on auth.users;

create trigger on_auth_user_created_loyalty
  after insert on auth.users
  for each row
  execute function public.handle_new_user_loyalty();

-- =============================================
-- 7. FONCTION: Ajouter des points après un achat
-- =============================================
-- Règle: 1€ = 10 points
create or replace function public.add_loyalty_points_from_order(
  p_user_id uuid,
  p_order_id uuid,
  p_amount integer -- en centimes
)
returns void as $$
declare
  v_points integer;
begin
  -- Calculer les points (1€ = 10 points, donc 100 centimes = 10 points)
  v_points := (p_amount / 10);
  
  -- Mettre à jour le compte de points
  update public.loyalty_points
  set 
    points = points + v_points,
    total_earned = total_earned + v_points,
    last_updated = now()
  where user_id = p_user_id;
  
  -- Si le compte n'existe pas, le créer
  if not found then
    insert into public.loyalty_points (user_id, points, total_earned)
    values (p_user_id, v_points, v_points);
  end if;
  
  -- Créer une transaction
  insert into public.loyalty_transactions (user_id, points, type, description, order_id)
  values (
    p_user_id,
    v_points,
    'earned_purchase',
    format('Achat de %s€', (p_amount::numeric / 100)::text),
    p_order_id
  );
end;
$$ language plpgsql security definer;

-- =============================================
-- 8. DONNÉES INITIALES
-- =============================================
-- Rien à insérer pour l'instant

-- =============================================
-- FIN DE LA MIGRATION
-- =============================================

