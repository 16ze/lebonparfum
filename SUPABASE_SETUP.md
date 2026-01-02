# Configuration Supabase - Le Bon Parfum

## 📋 Prérequis

1. **Installer les dépendances :**
   ```bash
   npm install
   ```

2. **Configurer les variables d'environnement :**
   Créez un fichier `.env.local` à la racine du projet avec :
   ```env
   SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

## 🗄️ Étape 1 : Créer la table

### Option A : Via Supabase Dashboard (Recommandé)
1. Allez dans votre projet Supabase
2. Ouvrez **SQL Editor**
3. Copiez le contenu de `supabase/migrations/01_init.sql`
4. Exécutez la requête

### Option B : Via Supabase CLI
```bash
supabase db push
```

## 🌱 Étape 2 : Injecter les données

Une fois la table créée, lancez le script de seed :

```bash
npm run seed
```

Le script va :
- ✅ Générer automatiquement les slugs (ex: "4 BLACK OP" → "4-black-op")
- ✅ Insérer tous les produits du catalogue
- ✅ Afficher un résumé des insertions

## 📊 Catalogue injecté

- **CP King Édition** : 12 produits (15.00€)
- **CP Paris** : 19 produits (10.00€)
- **Note 33** : 5 produits (20.00€)
- **Casablanca** : 5 produits (30.00€)

**Total : 41 produits**

## 🔍 Vérification

Après le seed, vérifiez dans Supabase Dashboard > Table Editor > `products` que tous les produits sont bien présents.


