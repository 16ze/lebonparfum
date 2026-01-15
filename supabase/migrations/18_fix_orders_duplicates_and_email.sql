-- ============================================
-- Migration: Fix Doublons Commandes + Infos Client
-- Description: Empêche les doublons et ajoute snapshot email/nom client
-- Date: 2025-01-XX
-- ============================================

-- PROBLÈME :
-- 1. Les webhooks Stripe peuvent être appelés plusieurs fois (retry), créant des doublons
-- 2. Les commandes invités n'ont pas d'email/nom visible dans l'admin

-- SOLUTION :
-- 1. Contrainte UNIQUE sur stripe_payment_id (bloque physiquement les doublons)
-- 2. Colonnes customer_email et customer_name (snapshot pour invités)
-- 3. Nettoyage des doublons existants avant d'ajouter la contrainte

-- ============================================
-- ÉTAPE 1 : NETTOYAGE DES DOUBLONS EXISTANTS
-- ============================================

-- Supprimer les doublons (garde le premier créé, supprime les autres)
-- On utilise id pour déterminer le premier (plus petit id = plus ancien)
DELETE FROM public.orders a
USING public.orders b
WHERE a.id > b.id 
  AND a.stripe_payment_id = b.stripe_payment_id
  AND a.stripe_payment_id IS NOT NULL;

-- ============================================
-- ÉTAPE 2 : AJOUT CONTRAINTE UNIQUE (ANTI-DOUBLON)
-- ============================================

-- Ajouter la contrainte unique sur stripe_payment_id
-- Si un webhook essaie d'insérer un doublon, la base de données le bloquera
ALTER TABLE public.orders 
ADD CONSTRAINT orders_stripe_payment_id_key UNIQUE (stripe_payment_id);

-- ============================================
-- ÉTAPE 3 : AJOUT COLONNES INFOS CLIENT (SNAPSHOT)
-- ============================================

-- Ajouter customer_email (email du client au moment de la commande)
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS customer_email text;

-- Ajouter customer_name (nom du client au moment de la commande)
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS customer_name text;

-- ============================================
-- COMMENTAIRES POUR DOCUMENTATION
-- ============================================

COMMENT ON COLUMN public.orders.customer_email IS 
'Email du client au moment de la commande (snapshot). 
Pour les utilisateurs connectés, peut être complété depuis profiles.email.
Pour les invités, vient de paymentIntent.receipt_email ou metadata.';

COMMENT ON COLUMN public.orders.customer_name IS 
'Nom du client au moment de la commande (snapshot).
Pour les utilisateurs connectés, peut être complété depuis profiles.full_name.
Pour les invités, vient de paymentIntent.shipping.name ou metadata.';

COMMENT ON CONSTRAINT orders_stripe_payment_id_key ON public.orders IS 
'Contrainte unique empêchant les doublons de commandes.
Si Stripe envoie le même payment_intent plusieurs fois (retry), 
la base de données bloquera l''insertion du doublon.';

-- ============================================
-- NOTES IMPORTANTES :
-- ============================================
-- 
-- 1. Idempotence :
--    - Le webhook doit vérifier si une commande existe déjà avant d'insérer
--    - Si elle existe, retourner 200 OK sans créer de doublon
--    - La contrainte UNIQUE est une sécurité supplémentaire au niveau DB
--
-- 2. Migration des données existantes (optionnel) :
--    - Si vous avez des commandes existantes sans customer_email/customer_name,
--    - Vous pouvez les compléter depuis profiles ou shipping_address :
--    
--    UPDATE public.orders o
--    SET customer_email = p.email,
--        customer_name = p.full_name
--    FROM public.profiles p
--    WHERE o.user_id = p.id
--      AND o.customer_email IS NULL;
--
--    UPDATE public.orders o
--    SET customer_email = (shipping_address->>'email')::text,
--        customer_name = (shipping_address->>'first_name')::text || ' ' || (shipping_address->>'last_name')::text
--    WHERE o.user_id IS NULL
--      AND o.customer_email IS NULL
--      AND o.shipping_address IS NOT NULL;
