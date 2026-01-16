# 🚀 Guide de Déploiement Production - THE PARFUMERIEE

**Date**: 16 Janvier 2026  
**Version**: 1.0  
**Status**: Prêt pour production

---

## 📋 Checklist Pré-Déploiement

Avant de commencer, assurez-vous d'avoir :

- [ ] Compte Supabase (production)
- [ ] Compte Stripe (mode live)
- [ ] Compte Vercel (ou autre hébergeur)
- [ ] Domaine personnalisé (optionnel mais recommandé)
- [ ] Compte Sentry (pour error tracking)
- [ ] Toutes les variables d'environnement prêtes

---

## 🔧 ÉTAPE 1 : Configuration Supabase Production

### 1.1 Créer un nouveau projet Supabase

1. Allez sur [Supabase Dashboard](https://app.supabase.com)
2. Cliquez sur **"New Project"**
3. Remplissez les informations :
   - **Name** : `lebonparfum-production` (ou votre nom)
   - **Database Password** : Générez un mot de passe fort (⚠️ **SAUVEGARDEZ-LE**)
   - **Region** : Choisissez la région la plus proche de vos utilisateurs (ex: `West EU (Paris)`)
4. Cliquez sur **"Create new project"**
5. Attendez que le projet soit créé (2-3 minutes)

### 1.2 Appliquer le schéma SQL

1. Dans Supabase Dashboard, allez dans **SQL Editor**
2. Ouvrez le fichier `supabase/production_schema.sql` de ce projet
3. **Copiez-collez tout le contenu** dans l'éditeur SQL
4. Cliquez sur **"Run"** (ou `Cmd/Ctrl + Enter`)
5. Vérifiez qu'il n'y a **aucune erreur** dans les résultats
6. Vous devriez voir les messages :
   ```
   ✅ Schéma créé avec succès !
   📊 Tables créées: 8
   🔒 Policies RLS créées: XX
   ```

### 1.3 Créer un compte Admin

1. Allez dans **Authentication > Users**
2. Créez un nouvel utilisateur :
   - **Email** : Votre email admin (ex: `admin@theparfumeriee.com`)
   - **Password** : Mot de passe fort
   - Cliquez sur **"Create user"**
3. Une fois le compte créé, notez l'**Email** de l'utilisateur
4. Allez dans **SQL Editor** et exécutez :
   ```sql
   UPDATE public.profiles 
   SET is_admin = true 
   WHERE email = 'votre-email-admin@example.com';
   ```
5. Vérifiez que c'est bien appliqué :
   ```sql
   SELECT id, email, is_admin FROM public.profiles WHERE email = 'votre-email-admin@example.com';
   ```
   Vous devriez voir `is_admin = true`

### 1.4 Configurer les Storage Buckets

1. Allez dans **Storage**
2. Vérifiez que les buckets suivants existent :
   - ✅ `product-images` (public)
   - ✅ `content` (public)
3. Si les buckets n'existent pas, ils ont été créés automatiquement par le script SQL

### 1.5 Récupérer les clés API

1. Allez dans **Settings > API**
2. Notez les valeurs suivantes (vous en aurez besoin pour `.env`) :
   - **Project URL** : `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key** : `eyJhbGc...` (clé publique)
   - **service_role key** : `eyJhbGc...` (⚠️ **SECRÈTE**, ne jamais exposer côté client)

---

## 💳 ÉTAPE 2 : Configuration Stripe Production

### 2.1 Passer en mode Live

1. Allez sur [Stripe Dashboard](https://dashboard.stripe.com)
2. Assurez-vous d'être en **mode Live** (bascule en haut à droite)
3. Si vous êtes encore en mode Test, basculez sur **Live**

### 2.2 Récupérer les clés API Live

1. Allez dans **Developers > API keys**
2. Notez les valeurs suivantes :
   - **Publishable key** : `pk_live_...` (commence par `pk_live_`)
   - **Secret key** : `sk_live_...` (commence par `sk_live_`, ⚠️ **SECRÈTE**)

### 2.3 Configurer les Webhooks Production

1. Allez dans **Developers > Webhooks**
2. Cliquez sur **"Add endpoint"**
3. Remplissez :
   - **Endpoint URL** : `https://votre-domaine.com/api/webhooks/stripe`
   - **Description** : `Production webhook - lebonparfum`
   - **Events to send** : Sélectionnez `payment_intent.succeeded`
4. Cliquez sur **"Add endpoint"**
5. **Copiez le "Signing secret"** (commence par `whsec_...`) - ⚠️ **Vous en aurez besoin pour `.env`**

### 2.4 Activer 3D Secure (SCA)

1. Allez dans **Settings > Payment methods**
2. Activez **3D Secure** (Strong Customer Authentication)
3. Configurez les règles de déclenchement selon vos besoins

---

## 🌐 ÉTAPE 3 : Déploiement sur Vercel

### 3.1 Préparer le projet

1. Assurez-vous que votre code est commité sur GitHub :
   ```bash
   git add .
   git commit -m "Ready for production"
   git push origin main
   ```

### 3.2 Connecter Vercel au projet GitHub

1. Allez sur [Vercel Dashboard](https://vercel.com)
2. Cliquez sur **"Add New Project"**
3. Importez votre repository GitHub `lebonparfum`
4. Vercel détectera automatiquement Next.js

### 3.3 Configurer les variables d'environnement

Dans Vercel, allez dans **Settings > Environment Variables** et ajoutez :

#### Supabase
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc... (clé anon publique)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (clé service_role SECRÈTE)
```

#### Stripe
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_... (signing secret du webhook)
```

#### Sentry (si configuré)
```
NEXT_PUBLIC_SENTRY_DSN=https://...@o4500000000000000.ingest.sentry.io/...
SENTRY_ORG=kairo-digital
SENTRY_PROJECT=javascript-nextjs-lx
SENTRY_AUTH_TOKEN=... (optionnel, pour source maps)
```

#### Upstash Redis (Rate Limiting)
```
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

#### App
```
NEXT_PUBLIC_SITE_URL=https://votre-domaine.com
NODE_ENV=production
```

⚠️ **IMPORTANT** : Sélectionnez **"Production"** pour toutes ces variables

### 3.4 Configurer le domaine personnalisé

1. Dans Vercel, allez dans **Settings > Domains**
2. Ajoutez votre domaine personnalisé (ex: `lebonparfum.com`)
3. Suivez les instructions pour configurer les DNS
4. Vercel générera automatiquement un certificat SSL

### 3.5 Déployer

1. Cliquez sur **"Deploy"**
2. Attendez que le build se termine (2-5 minutes)
3. Vérifiez que le déploiement est réussi (statut vert)

---

## 🔍 ÉTAPE 4 : Vérifications Post-Déploiement

### 4.1 Vérifier l'application

1. Visitez votre site : `https://votre-domaine.com`
2. Vérifiez que :
   - ✅ La page d'accueil charge correctement
   - ✅ Les produits s'affichent
   - ✅ L'authentification fonctionne (inscription/connexion)
   - ✅ Le panier fonctionne
   - ✅ Le checkout fonctionne

### 4.2 Tester un paiement

1. Ajoutez un produit au panier
2. Passez à la caisse
3. Utilisez une **carte de test Stripe Live** :
   - Carte valide : `4242 4242 4242 4242`
   - Date : N'importe quelle date future
   - CVC : N'importe quel 3 chiffres
4. Complétez le paiement
5. Vérifiez que :
   - ✅ Le paiement est accepté
   - ✅ La commande est créée dans Supabase (`/admin/orders`)
   - ✅ Le stock est décrémenté
   - ✅ Le webhook Stripe est reçu (vérifier dans Stripe Dashboard > Webhooks)

### 4.3 Vérifier l'admin

1. Connectez-vous avec votre compte admin
2. Vérifiez que :
   - ✅ Vous êtes redirigé vers `/admin/dashboard`
   - ✅ Le menu admin s'affiche
   - ✅ Vous pouvez créer/modifier des produits
   - ✅ Vous pouvez voir toutes les commandes

### 4.4 Vérifier les headers de sécurité

1. Utilisez [securityheaders.com](https://securityheaders.com)
2. Entrez votre URL : `https://votre-domaine.com`
3. Vérifiez que le score est **A** ou **A+**

### 4.5 Vérifier Sentry

1. Allez sur [Sentry Dashboard](https://sentry.io)
2. Vérifiez que les erreurs sont bien capturées
3. Testez en générant une erreur volontaire (ex: page 404)

---

## 🔐 ÉTAPE 5 : Sécurité Production

### 5.1 Activer les backups Supabase

1. Dans Supabase Dashboard, allez dans **Settings > Database**
2. Activez **"Point-in-time Recovery"** (PITR)
3. Configurez les **backups automatiques** (quotidien recommandé)

### 5.2 Configurer les alertes Supabase

1. Allez dans **Settings > Alerts**
2. Configurez des alertes pour :
   - Utilisation CPU > 80%
   - Utilisation mémoire > 80%
   - Erreurs de base de données
   - Quotas de stockage

### 5.3 Vérifier les RLS Policies

1. Dans Supabase Dashboard, allez dans **Authentication > Policies**
2. Vérifiez que toutes les tables ont des policies RLS actives
3. Testez qu'un utilisateur non-admin ne peut pas accéder aux données admin

### 5.4 Activer le monitoring Stripe

1. Dans Stripe Dashboard, allez dans **Developers > Webhooks**
2. Vérifiez que les webhooks sont bien reçus (onglet "Events")
3. Configurez des alertes pour les échecs de paiement

---

## 📊 ÉTAPE 6 : Monitoring & Analytics

### 6.1 Vercel Analytics

1. Dans Vercel Dashboard, activez **Analytics**
2. Vous pourrez voir :
   - Trafic du site
   - Pages les plus visitées
   - Temps de chargement
   - Erreurs

### 6.2 Sentry Monitoring

1. Vérifiez que Sentry capture bien les erreurs
2. Configurez des alertes pour les erreurs critiques
3. Surveillez les performances (APM)

### 6.3 Google Analytics (optionnel)

1. Créez un compte [Google Analytics](https://analytics.google.com)
2. Ajoutez le code de tracking dans votre application
3. Configurez les objectifs (conversions, achats)

---

## 🚨 ÉTAPE 7 : Plan de Reprise (Backup)

### 7.1 Backup Supabase

1. **Backups automatiques** : Configurés via PITR (voir étape 5.1)
2. **Backup manuel** : 
   - Supabase Dashboard > Database > Backups
   - Cliquez sur **"Create backup"**
   - Téléchargez le backup régulièrement

### 7.2 Backup Code

1. Votre code est déjà sur GitHub (backup automatique)
2. Créez des **tags de release** pour chaque version :
   ```bash
   git tag -a v1.0.0 -m "Production release v1.0.0"
   git push origin v1.0.0
   ```

### 7.3 Documenter les credentials

1. **⚠️ IMPORTANT** : Sauvegardez toutes les clés API dans un gestionnaire de mots de passe sécurisé (1Password, LastPass, etc.)
2. Documentez :
   - URLs des services
   - Clés API (avec dates d'expiration si applicable)
   - Mots de passe
   - Instructions de récupération

---

## ✅ Checklist Finale Production

Avant de considérer le déploiement comme terminé :

### Application
- [ ] Site accessible sur le domaine personnalisé
- [ ] HTTPS activé (certificat SSL valide)
- [ ] Toutes les pages fonctionnent
- [ ] Authentification fonctionne
- [ ] Panier et checkout fonctionnent
- [ ] Paiement Stripe Live fonctionne
- [ ] Commandes créées dans Supabase
- [ ] Admin accessible et fonctionnel

### Sécurité
- [ ] Headers de sécurité configurés (score A sur securityheaders.com)
- [ ] RLS activé sur toutes les tables Supabase
- [ ] Variables d'environnement sécurisées (pas dans le code)
- [ ] Service Role Key jamais exposé côté client
- [ ] Webhooks Stripe vérifiés (signature)

### Performance
- [ ] Images optimisées (WebP, lazy loading)
- [ ] Bundle size < 300KB (vérifier avec Lighthouse)
- [ ] Lighthouse score > 90
- [ ] Temps de chargement < 3s

### Monitoring
- [ ] Sentry configuré et capture les erreurs
- [ ] Vercel Analytics activé
- [ ] Alertes Supabase configurées
- [ ] Webhooks Stripe monitorés

### Backup
- [ ] Backups Supabase automatiques activés
- [ ] Code versionné sur GitHub avec tags
- [ ] Credentials sauvegardés dans un gestionnaire sécurisé

### Légal
- [ ] Pages légales accessibles (CGV, Mentions, Privacy, Cookies, Retours)
- [ ] Formulaire de contact fonctionnel
- [ ] Politique de confidentialité conforme RGPD

---

## 🔄 Maintenance Post-Déploiement

### Quotidien
- [ ] Vérifier les erreurs Sentry
- [ ] Vérifier les commandes dans l'admin
- [ ] Vérifier les webhooks Stripe (événements reçus)

### Hebdomadaire
- [ ] Vérifier les backups Supabase
- [ ] Analyser les performances (Vercel Analytics)
- [ ] Vérifier les stocks produits

### Mensuel
- [ ] Mettre à jour les dépendances (npm audit)
- [ ] Vérifier les logs Supabase
- [ ] Tester le processus de paiement complet
- [ ] Vérifier le score securityheaders.com

---

## 🆘 En cas de problème

### Site inaccessible
1. Vérifier le statut Vercel : [status.vercel.com](https://status.vercel.com)
2. Vérifier les logs Vercel : Dashboard > Deployments > Logs
3. Vérifier les variables d'environnement

### Erreurs base de données
1. Vérifier le statut Supabase : [status.supabase.com](https://status.supabase.com)
2. Vérifier les logs Supabase : Dashboard > Logs
3. Vérifier les RLS policies

### Paiements ne fonctionnent pas
1. Vérifier les clés Stripe (mode Live)
2. Vérifier les webhooks Stripe (événements reçus)
3. Vérifier les logs du webhook : Vercel > Functions > `/api/webhooks/stripe`

### Rollback
Si vous devez revenir en arrière :
1. Dans Vercel, allez dans **Deployments**
2. Trouvez le déploiement précédent qui fonctionnait
3. Cliquez sur **"..." > Promote to Production"**

---

## 📞 Support

- **Supabase** : [support.supabase.com](https://support.supabase.com)
- **Stripe** : [support.stripe.com](https://support.stripe.com)
- **Vercel** : [vercel.com/support](https://vercel.com/support)
- **Sentry** : [sentry.io/support](https://sentry.io/support)

---

## 📝 Notes Importantes

1. **Ne jamais commiter les `.env`** : Les variables d'environnement doivent rester secrètes
2. **Service Role Key** : Ne jamais l'exposer côté client, uniquement dans les Server Actions
3. **Stripe Live** : Les paiements sont réels, testez d'abord avec de petites sommes
4. **Backups** : Configurez les backups automatiques dès le premier jour
5. **Monitoring** : Surveillez les erreurs quotidiennement les premiers jours

---

**Dernière mise à jour** : 16 Janvier 2026  
**Version du guide** : 1.0
