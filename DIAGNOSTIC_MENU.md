# 🔍 Diagnostic - Menu Vide

## Problèmes possibles et solutions

### 1. ❌ La table `products` n'existe pas

**Solution :** Exécutez la migration SQL dans Supabase Dashboard

1. Ouvrez Supabase Dashboard > **SQL Editor**
2. Copiez le contenu de `supabase/migrations/01_init.sql`
3. Exécutez la requête

### 2. ❌ La RLS (Row Level Security) bloque les requêtes

**Solution :** Exécutez la migration de correction RLS

1. Ouvrez Supabase Dashboard > **SQL Editor**
2. Copiez le contenu de `supabase/migrations/02_fix_rls.sql`
3. Exécutez la requête

**Vérification :**
- Allez dans **Authentication > Policies**
- Vérifiez qu'il existe une policy "Public Read" sur la table `products`

### 3. ❌ La table est vide (pas de données)

**Solution :** Exécutez le script de seed

```bash
# Assurez-vous d'avoir configuré .env.local avec :
# SUPABASE_URL=...
# SUPABASE_SERVICE_ROLE_KEY=...

npm run seed
```

**Vérification :**
- Allez dans Supabase Dashboard > **Table Editor > products**
- Vous devriez voir 41 produits

### 4. ❌ Variables d'environnement manquantes

**Solution :** Créez `.env.local` avec :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Pour le seed uniquement
```

### 5. 🔍 Vérifier les logs du serveur

Le `MenuOverlayWrapper` affiche maintenant des logs dans la console :
- Collections trouvées
- Nombre de produits
- Erreurs éventuelles

**Vérifiez la console du serveur Next.js** pour voir les logs de debug.

## Checklist rapide

- [ ] Table `products` créée dans Supabase
- [ ] Policy RLS "Public Read" créée
- [ ] Variables d'environnement configurées (`.env.local`)
- [ ] Script de seed exécuté (`npm run seed`)
- [ ] Serveur redémarré après les changements

## Test rapide

Pour tester si Supabase fonctionne, créez un fichier de test temporaire :

```typescript
// test-supabase.ts (à supprimer après)
import { createClient } from "@/utils/supabase/server";

const supabase = createClient();
const { data, error } = await supabase.from("products").select("count");
console.log("Count:", data, "Error:", error);
```


