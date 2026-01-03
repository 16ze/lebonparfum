# 🎯 Guide de Configuration - Espace Admin

## 📦 Étape 1 : Appliquer les migrations Supabase

### **IMPORTANT** : Ordre d'application des migrations

Les migrations doivent être appliquées dans cet ordre :

```bash
# 1. Schéma de base (si pas déjà fait)
# 01_init.sql (table products)
# 02_fix_rls.sql
# 03_auth_admin.sql (profiles, orders, site_settings v1)
# 03_fix_names.sql

# 2. Nouvelles migrations pour l'admin
supabase db push supabase/migrations/04_add_storage_bucket.sql
supabase db push supabase/migrations/05_add_user_addresses.sql
supabase db push supabase/migrations/07_fix_schema_for_admin.sql
```

### **OU** via le Dashboard Supabase :

1. Aller sur **https://supabase.com/dashboard**
2. Sélectionner votre projet
3. **SQL Editor** → **New Query**
4. Copier-coller le contenu de chaque migration dans l'ordre :
   - `04_add_storage_bucket.sql`
   - `05_add_user_addresses.sql`
   - `07_fix_schema_for_admin.sql`
5. Cliquer sur **Run** pour chaque migration

---

## 🔑 Étape 2 : Créer un utilisateur admin

### **Option A : Via le Dashboard Supabase**

1. **Authentication** → **Users** → **Add user**
2. Créer un utilisateur avec email/password
3. **SQL Editor** → Exécuter cette requête :

```sql
-- Remplacer 'votre-email@exemple.com' par l'email de l'admin
UPDATE profiles
SET is_admin = true
WHERE email = 'votre-email@exemple.com';
```

### **Option B : Via SQL directement**

```sql
-- 1. Créer l'utilisateur dans auth.users (via Dashboard ou signup)
-- 2. Mettre à jour le profil pour is_admin = true
UPDATE profiles
SET is_admin = true
WHERE email = 'votre-email@exemple.com';
```

---

## 📋 Étape 3 : Vérifier que tout fonctionne

### **Checklist de vérification :**

#### ✅ **Tables créées**
```sql
-- Vérifier que toutes les tables existent
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Devrait afficher :
-- - orders
-- - products
-- - profiles
-- - site_settings
-- - user_addresses
```

#### ✅ **Bucket Storage**
```sql
-- Vérifier les buckets
SELECT * FROM storage.buckets;

-- Devrait afficher :
-- - product-images (public: true)
```

#### ✅ **Policies RLS**
```sql
-- Vérifier les policies pour products
SELECT policyname, cmd FROM pg_policies
WHERE tablename = 'products';

-- Devrait afficher :
-- - Public Read (SELECT)
-- - Admin can insert products (INSERT)
-- - Admin can update products (UPDATE)
-- - Admin can delete products (DELETE)
```

#### ✅ **Admin créé**
```sql
-- Vérifier qu'un admin existe
SELECT id, email, full_name, is_admin
FROM profiles
WHERE is_admin = true;
```

---

## 🚀 Étape 4 : Tester l'espace admin

### **URL à tester :**

1. **Login** : `http://localhost:3000/login`
   - Se connecter avec l'email admin créé
   - Devrait rediriger vers `/admin/dashboard`

2. **Dashboard** : `http://localhost:3000/admin/dashboard`
   - ✅ Voir les stats (Produits, Commandes, Revenu, Stock)

3. **Produits** : `http://localhost:3000/admin/products`
   - ✅ Cliquer "Ajouter un produit"
   - ✅ Remplir le formulaire + uploader une image
   - ✅ Sauvegarder
   - ✅ Voir le produit dans la liste
   - ✅ Éditer le produit
   - ✅ Supprimer le produit

4. **Commandes** : `http://localhost:3000/admin/orders`
   - ✅ Voir la liste (vide si aucune commande)

5. **Paramètres** : `http://localhost:3000/admin/settings`
   - ✅ Ajouter des liens réseaux sociaux
   - ✅ Sauvegarder
   - ✅ Vérifier que les liens apparaissent dans le footer

---

## 🛠️ Étape 5 : Résolution de problèmes

### **Problème : "Non authentifié" ou redirection vers /login**
**Cause** : L'utilisateur n'est pas admin
**Solution** :
```sql
UPDATE profiles SET is_admin = true WHERE email = 'votre-email@exemple.com';
```

### **Problème : Erreur upload image "Unauthorized"**
**Cause** : Policy storage manquante
**Solution** : Réappliquer la migration 07_fix_schema_for_admin.sql

### **Problème : Erreur "brand is not defined" dans products**
**Cause** : Colonne brand manquante
**Solution** :
```sql
ALTER TABLE products ADD COLUMN brand TEXT;
UPDATE products SET brand = collection WHERE brand IS NULL;
```

### **Problème : Prix en euros au lieu de centimes**
**Cause** : Type de colonne incorrect
**Solution** : Réappliquer la migration 07 qui convertit automatiquement

---

## 📊 Schéma de la base de données

### **Table `products`**
```
- id (uuid, PK)
- name (text)
- slug (text, unique)
- brand (text) ← NOUVEAU
- collection (text)
- price (integer) ← EN CENTIMES
- description (text)
- notes (text)
- inspiration (text)
- image_url (text)
- stock (integer)
- category (text)
- created_at (timestamptz)
```

### **Table `orders`**
```
- id (uuid, PK)
- user_id (uuid, FK → profiles)
- stripe_payment_id (text)
- amount (numeric) ← EN CENTIMES
- status (text) : 'pending', 'paid', 'shipped', 'delivered', 'cancelled'
- items (jsonb)
- shipping_address (jsonb)
- created_at (timestamptz)
```

### **Table `profiles`**
```
- id (uuid, PK, FK → auth.users)
- email (text)
- full_name (text)
- is_admin (boolean)
- created_at (timestamptz)
```

### **Table `site_settings`**
```
- id (uuid, PK)
- setting_key (text, unique)
- setting_value (text)
- created_at (timestamptz)
- updated_at (timestamptz)
```

### **Table `user_addresses`**
```
- id (uuid, PK)
- user_id (uuid, FK → profiles)
- label (text)
- first_name (text)
- last_name (text)
- address (text)
- city (text)
- postal_code (text)
- country (text)
- is_default (boolean)
- created_at (timestamptz)
- updated_at (timestamptz)
```

---

## ✅ Checklist finale

- [ ] Toutes les migrations appliquées
- [ ] Bucket `product-images` créé
- [ ] Au moins 1 utilisateur admin créé (`is_admin = true`)
- [ ] Connexion admin fonctionne → redirige vers `/admin/dashboard`
- [ ] Création d'un produit fonctionne (avec image)
- [ ] Édition d'un produit fonctionne
- [ ] Suppression d'un produit fonctionne
- [ ] Page commandes accessible
- [ ] Page paramètres accessible et sauvegarde fonctionne

---

## 🎉 Prochaines étapes

Une fois l'espace admin fonctionnel, nous pourrons créer :
- ✅ Espace client (profil, commandes, adresses)
- ✅ Intégration du header/footer avec auth
- ✅ Tests complets du flux utilisateur
