# Instructions pour appliquer les migrations Supabase

## ⚠️ Migration urgente : Relation Orders ↔ Profiles

Une Foreign Key manque entre les tables `orders` et `profiles`, ce qui empêche l'affichage des commandes dans l'admin.

### 🚀 Étapes pour corriger

#### Option 1 : Via le Dashboard Supabase (Recommandé)

1. **Allez sur votre Dashboard Supabase**
   - URL : https://supabase.com/dashboard/project/YOUR_PROJECT_ID

2. **Ouvrez l'éditeur SQL**
   - Menu latéral → "SQL Editor"
   - Cliquez sur "New Query"

3. **Copiez et collez ce SQL** :

```sql
-- Ajouter la Foreign Key entre orders.user_id et profiles.id
ALTER TABLE public.orders
ADD CONSTRAINT orders_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) 
ON DELETE SET NULL;

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);

-- Commentaire pour documenter la relation
COMMENT ON CONSTRAINT orders_user_id_fkey ON public.orders IS 
'Foreign key linking orders to user profiles. ON DELETE SET NULL preserves order history.';
```

4. **Exécutez la requête**
   - Cliquez sur "Run" ou appuyez sur `Ctrl+Enter` (Mac: `Cmd+Enter`)
   - Vous devriez voir : "Success. No rows returned"

5. **Vérifiez que ça fonctionne**
   - Allez sur votre site → `/admin/orders`
   - Les commandes avec les infos clients devraient maintenant s'afficher

---

#### Option 2 : Via Supabase CLI (Avancé)

Si vous utilisez Supabase CLI localement :

```bash
# Créer une nouvelle migration
supabase migration new add_orders_profiles_fk

# Copier le contenu du fichier supabase/migrations/06_add_orders_profiles_fk.sql

# Appliquer la migration
supabase db push
```

---

## 📋 Autres migrations à vérifier

Assurez-vous que toutes les migrations ont été appliquées :

1. ✅ `01_create_products_table.sql` - Table produits
2. ✅ `02_seed_products.sql` - Données de test
3. ✅ `03_auth_admin.sql` - Authentification et profils
4. ✅ `04_add_storage_bucket.sql` - Buckets de stockage
5. ✅ `05_add_user_addresses.sql` - Adresses utilisateurs
6. ⚠️ `06_add_orders_profiles_fk.sql` - **À APPLIQUER MAINTENANT**

---

## 🔍 Vérifier que tout fonctionne

Après avoir appliqué la migration, testez :

1. **Admin Orders** : `/admin/orders`
   - Les emails des clients doivent apparaître
   - Pas d'erreur dans la console

2. **Admin Dashboard** : `/admin/dashboard`
   - Les statistiques de commandes s'affichent
   - Le widget "Dernières commandes" fonctionne

3. **Client Orders** : `/account/orders`
   - L'utilisateur voit son historique de commandes

---

## ❓ Problème persistant ?

Si l'erreur persiste après avoir appliqué la migration :

1. **Vérifiez que la Foreign Key existe** :
```sql
SELECT 
  conname AS constraint_name,
  conrelid::regclass AS table_name,
  confrelid::regclass AS referenced_table
FROM pg_constraint
WHERE conname = 'orders_user_id_fkey';
```

2. **Vérifiez la structure de la table orders** :
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;
```

3. Contactez-moi avec les résultats de ces requêtes.

