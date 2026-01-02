# Migration Authentification & Admin

## 📋 Fichier de Migration

**`03_auth_admin.sql`** - Migration complète pour l'authentification, les rôles admin et les commandes.

## 🚀 Installation

1. **Ouvrez Supabase Dashboard** > **SQL Editor**
2. **Copiez-collez** le contenu de `supabase/migrations/03_auth_admin.sql`
3. **Exécutez** la requête

## 📊 Tables Créées

### 1. `profiles`

Extension de `auth.users` avec :

- `id` (uuid, FK vers auth.users)
- `email` (text)
- `full_name` (text)
- `is_admin` (boolean, default false)
- `created_at`, `updated_at`

**Trigger automatique** : Un profil est créé automatiquement à chaque inscription.

### 2. `orders`

Historique des commandes avec :

- `id` (uuid)
- `user_id` (uuid, nullable pour invités)
- `stripe_payment_id` (text, unique)
- `amount` (numeric)
- `status` (text: 'pending', 'paid', 'shipped', 'delivered', 'cancelled')
- `items` (jsonb - snapshot des produits)
- `shipping_address` (jsonb)
- `created_at`, `updated_at`

### 3. `site_settings`

Configuration dynamique du site :

- `key` (text, primary key)
- `value` (text)
- `updated_at`

**Settings initiaux** :

- `instagram_url`
- `tiktok_url`
- `contact_email`

## 🔐 Sécurité (RLS)

### Profiles

- ✅ Utilisateur : Voit son propre profil
- ✅ Admin : Voit tous les profils
- ✅ Utilisateur : Peut mettre à jour son profil (sauf `is_admin`)
- ✅ Admin : Peut modifier le statut admin

### Orders

- ✅ Utilisateur : Voit uniquement ses commandes
- ✅ Admin : Voit toutes les commandes
- ✅ Admin : Peut créer/modifier des commandes

### Products

- ✅ **Lecture** : Publique (tous peuvent voir)
- ✅ **Écriture** : Admin uniquement (insert/update/delete)

### Storage

- ✅ **Lecture** : Publique (images accessibles)
- ✅ **Écriture** : Admin uniquement (upload/delete)

## 👤 Créer un Compte Admin

### Méthode 1 : Via Supabase Dashboard

1. Allez dans **Authentication > Users**
2. Créez un nouvel utilisateur ou utilisez un existant
3. Notez l'email de l'utilisateur
4. Exécutez dans **SQL Editor** :

```sql
UPDATE public.profiles
SET is_admin = true
WHERE email = 'admin@example.com';
```

### Méthode 2 : Via SQL Direct

```sql
-- Si l'utilisateur existe déjà
UPDATE public.profiles
SET is_admin = true
WHERE email = 'votre-email@example.com';

-- Vérifier
SELECT email, is_admin FROM public.profiles WHERE is_admin = true;
```

## 📦 Storage Buckets

### Bucket `products`

- **Usage** : Images des produits
- **Limite** : 5MB par fichier
- **Formats** : JPEG, PNG, WebP
- **URL publique** : `https://[project].supabase.co/storage/v1/object/public/products/[filename]`

### Bucket `content`

- **Usage** : Images home, bannières, contenu
- **Limite** : 10MB par fichier
- **Formats** : JPEG, PNG, WebP, GIF
- **URL publique** : `https://[project].supabase.co/storage/v1/object/public/content/[filename]`

## 🔄 Workflow Commandes

1. **Client paie** → Stripe PaymentIntent créé
2. **Paiement réussi** → Redirection `/checkout/success`
3. **API `/api/confirm-order`** :
   - Vérifie le paiement Stripe
   - Décrémente le stock
   - **Créer une entrée dans `orders`** (à implémenter dans l'API)

## ⚠️ Notes Importantes

- Les **commandes invités** (`user_id = null`) ne sont visibles que par les admins
- Le **stock** est décrémenté automatiquement après paiement
- Les **images** doivent être uploadées via l'interface admin (à créer)
- Les **settings** peuvent être modifiés sans toucher au code

## 🧪 Test Rapide

```sql
-- Vérifier que les tables existent
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('profiles', 'orders', 'site_settings');

-- Vérifier les buckets
SELECT * FROM storage.buckets WHERE id IN ('products', 'content');

-- Vérifier les policies RLS
SELECT * FROM pg_policies WHERE tablename = 'products';
```
