# Scripts de Seed - Supabase

## Prérequis

1. **Installer les dépendances :**
   ```bash
   npm install
   ```

2. **Configurer les variables d'environnement :**
   - Copiez `.env.example` en `.env.local`
   - Remplissez `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY`

## Exécution de la migration SQL

1. **Via Supabase Dashboard :**
   - Allez dans SQL Editor
   - Copiez le contenu de `supabase/migrations/01_init.sql`
   - Exécutez la requête

2. **Via Supabase CLI (si installé) :**
   ```bash
   supabase db push
   ```

## Exécution du seed

Une fois la table créée, lancez le script de seed :

```bash
npm run seed
```

Le script va :
- ✅ Générer automatiquement les slugs pour chaque produit
- ✅ Insérer tous les produits du catalogue
- ✅ Afficher un résumé des insertions

## Catalogue injecté

- **CP King Édition** : 12 produits (15.00€)
- **CP Paris** : 19 produits (10.00€)
- **Note 33** : 5 produits (20.00€)
- **Casablanca** : 5 produits (30.00€)

**Total : 41 produits**

