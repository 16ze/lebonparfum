-- Migration de correction RLS
-- À exécuter si la table existe déjà mais que la policy n'est pas correcte

-- Supprimer l'ancienne policy si elle existe (au cas où)
drop policy if exists "Public products are viewable by everyone." on public.products;
drop policy if exists "Public Read" on public.products;

-- Créer la policy publique pour la lecture
create policy "Public Read" 
  on public.products 
  for select 
  using (true);

-- Vérification : Cette policy permet à tous (même non authentifiés) de lire les produits

