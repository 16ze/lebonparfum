# Configuration du Webhook Stripe

Ce guide explique comment configurer le webhook Stripe pour que les commandes soient créées automatiquement après un paiement réussi.

## 🎯 Pourquoi un Webhook ?

Le webhook permet à Stripe de notifier votre application quand un paiement est validé. C'est **essentiel** pour :
- ✅ Créer la commande dans Supabase
- ✅ Décrémenter le stock des produits
- ✅ Éviter les fraudes (on ne fait confiance qu'à Stripe)

## 📋 Prérequis

1. **Compte Stripe** : https://dashboard.stripe.com
2. **Clés API Stripe** déjà configurées dans `.env.local`
3. **Migration 08** appliquée dans Supabase (fonction `decrement_stock`)

## 🔧 Configuration en Développement (avec Stripe CLI)

### 1. Installer Stripe CLI

**macOS (Homebrew)** :
```bash
brew install stripe/stripe-cli/stripe
```

**Windows** :
Télécharger depuis https://github.com/stripe/stripe-cli/releases

**Linux** :
```bash
# Télécharger et extraire
wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_linux_x86_64.tar.gz
tar -xvf stripe_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin/
```

### 2. Se connecter à Stripe

```bash
stripe login
```

Cela ouvrira votre navigateur pour autoriser la connexion.

### 3. Lancer le serveur Next.js

Dans un terminal, démarrer votre application :
```bash
npm run dev
```

L'application doit tourner sur `http://localhost:3001` (ou votre port configuré).

### 4. Écouter les webhooks en local

Dans un **nouveau terminal**, lancer la commande :
```bash
stripe listen --forward-to localhost:3001/api/webhooks/stripe
```

Vous verrez un message comme :
```
> Ready! You are using Stripe API Version [2024-XX-XX]. Your webhook signing secret is whsec_XXXXX
```

### 5. Copier le Webhook Secret

Copiez le secret qui commence par `whsec_...` et ajoutez-le dans votre `.env.local` :

```bash
# .env.local
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 6. Redémarrer Next.js

Redémarrez votre serveur Next.js pour prendre en compte la nouvelle variable :
```bash
# Ctrl+C pour arrêter, puis
npm run dev
```

## ✅ Tester le Webhook

1. **Ajouter un produit au panier** sur le site
2. **Aller au checkout** : `http://localhost:3001/checkout`
3. **Utiliser une carte de test Stripe** :
   - Numéro : `4242 4242 4242 4242`
   - Date : N'importe quelle date future (ex: `12/34`)
   - CVC : N'importe quel code 3 chiffres (ex: `123`)
4. **Valider le paiement**

### Logs à vérifier

**Dans le terminal avec `stripe listen`** :
```
payment_intent.succeeded [evt_xxx]  -> POST http://localhost:3001/api/webhooks/stripe [200]
```

**Dans les logs de Next.js** :
```
✅ Webhook Stripe reçu: payment_intent.succeeded
💰 Paiement réussi: { id: 'pi_xxx', amount: 3500, ... }
✅ Commande créée: xxxx-xxxx-xxxx-xxxx
✅ Stock décrémenté pour xxxx-xxxx (-1)
🎉 Commande traitée avec succès
```

**Dans Supabase** :
- Une nouvelle ligne dans la table `orders` avec `status = 'paid'`
- Le stock du produit a diminué

## 🚀 Configuration en Production

### 1. Déployer votre application

Assurez-vous que votre site est déployé (Vercel, Netlify, etc.) et accessible via HTTPS.

Exemple : `https://lebonparfum.com`

### 2. Créer le webhook dans Stripe Dashboard

1. Aller sur https://dashboard.stripe.com/webhooks
2. Cliquer sur **"Add endpoint"**
3. **Endpoint URL** : `https://lebonparfum.com/api/webhooks/stripe`
4. **Events to send** : Sélectionner uniquement `payment_intent.succeeded`
5. Cliquer sur **"Add endpoint"**

### 3. Récupérer le Webhook Secret

Après création, Stripe affiche le **Signing secret** qui commence par `whsec_...`

### 4. Ajouter le secret dans les variables d'environnement de production

**Vercel** :
```bash
vercel env add STRIPE_WEBHOOK_SECRET
# Coller le whsec_... quand demandé
```

**Netlify** :
- Site Settings > Environment Variables
- Ajouter `STRIPE_WEBHOOK_SECRET` avec la valeur `whsec_...`

### 5. Redéployer

```bash
# Vercel
vercel --prod

# Netlify
git push origin main
```

## 🔍 Débugger les Webhooks

### En développement

Les logs du webhook apparaissent dans :
1. **Terminal Stripe CLI** : Statut HTTP (200, 400, 500)
2. **Terminal Next.js** : Logs détaillés de la création de commande

### En production

1. **Stripe Dashboard > Webhooks** : Voir tous les événements envoyés
2. **Stripe Dashboard > Logs** : Détails de chaque tentative
3. **Logs de votre hébergeur** : Vercel Logs, Netlify Functions Logs

## ❌ Erreurs Courantes

### `STRIPE_WEBHOOK_SECRET manquante`
- ✅ Vérifier que la variable est dans `.env.local`
- ✅ Redémarrer le serveur Next.js

### `Invalid signature`
- ✅ Le webhook secret est incorrect
- ✅ Copier le bon secret depuis `stripe listen` ou Stripe Dashboard

### `Stock insuffisant`
- ✅ Normal si le produit est en rupture de stock
- ✅ Augmenter le stock dans l'admin

### `Produits introuvables`
- ✅ Vérifier que les produits existent dans Supabase
- ✅ Vérifier que les slugs correspondent

## 📚 Ressources

- [Documentation Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Tester les webhooks localement](https://stripe.com/docs/webhooks/test)

## 🎉 Résultat Final

Une fois configuré, le flux complet est :

1. **Client paie** → Stripe traite le paiement
2. **Stripe envoie webhook** → `POST /api/webhooks/stripe`
3. **Webhook crée commande** → Enregistrement dans Supabase
4. **Stock décrémenté** → Via fonction SQL `decrement_stock`
5. **Admin voit la commande** → Dans `/admin/orders`
6. **Client redirigé** → Page de confirmation `/checkout/success`

Tout est **automatique** et **sécurisé** ! 🚀
