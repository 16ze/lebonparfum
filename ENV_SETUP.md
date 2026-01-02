# Configuration des Variables d'Environnement

## 📝 Créer le fichier `.env.local`

Créez un fichier `.env.local` à la racine du projet avec le contenu suivant :

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=met_ton_url_ici
NEXT_PUBLIC_SUPABASE_ANON_KEY=met_ta_cle_ici

# Stripe Configuration (Backend)
STRIPE_SECRET_KEY=sk_test_met_ta_cle_secrete_ici
```

## 🔑 Où trouver ces valeurs ?

1. **NEXT_PUBLIC_SUPABASE_URL** :
   - Allez dans Supabase Dashboard > Settings > API
   - Copiez l'URL du projet (ex: `https://xxxxxxxxxxxxx.supabase.co`)

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY** :
   - Dans le même écran (Settings > API)
   - Copiez la clé `anon` `public` (c'est la clé publique, sécurisée pour le client)

3. **STRIPE_SECRET_KEY** :
   - Allez dans Stripe Dashboard > Developers > API keys
   - Copiez la clé secrète (commence par `sk_test_` pour le mode test, `sk_live_` pour la production)
   - ⚠️ **NE JAMAIS exposer cette clé côté client !**

## ⚠️ Note

- Le fichier `.env.local` est déjà dans `.gitignore` et ne sera pas commité
- Ne partagez jamais vos clés publiquement
- Pour les scripts admin (seed.ts), vous pouvez aussi ajouter `SUPABASE_SERVICE_ROLE_KEY` (optionnel)


