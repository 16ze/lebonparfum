-- Migration : Ajouter la Foreign Key entre orders.user_id et profiles.id
-- Cela permet de faire des joins entre les commandes et les profils utilisateurs

-- 1. Ajouter la contrainte de clé étrangère sur orders.user_id
-- Note: On utilise ON DELETE SET NULL car si un utilisateur est supprimé,
-- on veut garder l'historique de la commande mais sans référence utilisateur

ALTER TABLE public.orders
ADD CONSTRAINT orders_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) 
ON DELETE SET NULL;

-- 2. Créer un index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);

-- 3. Commentaire pour documenter la relation
COMMENT ON CONSTRAINT orders_user_id_fkey ON public.orders IS 
'Foreign key linking orders to user profiles. ON DELETE SET NULL preserves order history.';

