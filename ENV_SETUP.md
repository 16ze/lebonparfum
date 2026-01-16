# Configuration des Variables d'Environnement

## 📝 Créer le fichier `.env.local`

Créez un fichier `.env.local` à la racine du projet avec le contenu suivant :

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=met_ton_url_ici
NEXT_PUBLIC_SUPABASE_ANON_KEY=met_ta_cle_ici
SUPABASE_SERVICE_ROLE_KEY=met_ta_cle_service_role_ici

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_met_ta_cle_secrete_ici
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_met_ta_cle_publique_ici
STRIPE_WEBHOOK_SECRET=whsec_met_ton_secret_webhook_ici

# Sentry Configuration (Error Tracking)
NEXT_PUBLIC_SENTRY_DSN=https://met_ton_dsn_ici@o4500000000000000.ingest.sentry.io/0000000
SENTRY_ORG=kairo-digital
SENTRY_PROJECT=javascript-nextjs-lx
SENTRY_AUTH_TOKEN=met_ton_auth_token_ici
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

4. **SUPABASE_SERVICE_ROLE_KEY** :
   - Allez dans Supabase Dashboard > Settings > API
   - Copiez la clé `service_role` `secret` (⚠️ **NE JAMAIS exposer cette clé côté client !**)
   - Utilisée uniquement côté serveur pour les opérations admin (décrémentation du stock)
   - Cette clé bypass RLS et donne accès complet à la base

5. **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY** :
   - Dans le même écran (Stripe Dashboard > Developers > API keys)
   - Copiez la clé publique (commence par `pk_test_` pour le mode test, `pk_live_` pour la production)
   - Cette clé peut être exposée côté client (d'où le préfixe `NEXT_PUBLIC_`)

6. **STRIPE_WEBHOOK_SECRET** :
   - Allez dans Stripe Dashboard > Developers > Webhooks
   - Créez un endpoint webhook ou utilisez celui existant
   - Copiez le "Signing secret" (commence par `whsec_`)
   - Utilisé pour vérifier l'authenticité des webhooks Stripe

7. **NEXT_PUBLIC_SENTRY_DSN** :
   - Allez dans Sentry Dashboard > Settings > Projects > javascript-nextjs-lx
   - Dans "Client Keys (DSN)", copiez le DSN (commence par `https://`)
   - Cette clé peut être exposée côté client (d'où le préfixe `NEXT_PUBLIC_`)

8. **SENTRY_AUTH_TOKEN** :
   - Allez dans Sentry Dashboard > Settings > Account > Auth Tokens
   - Créez un nouveau token avec les permissions : `project:read`, `project:releases`, `org:read`
   - Utilisé pour uploader les source maps lors du build

## ⚠️ Note

- Le fichier `.env.local` est déjà dans `.gitignore` et ne sera pas commité
- Ne partagez jamais vos clés publiquement
- **SUPABASE_SERVICE_ROLE_KEY est maintenant REQUIS** pour la décrémentation automatique du stock après paiement
- **SENTRY_AUTH_TOKEN** est requis uniquement pour uploader les source maps en production (optionnel en développement)


