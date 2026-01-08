# 🚀 Configuration Automatique Stripe CLI

## 📋 Installation et Configuration en une seule commande

### Option 1 : Installation automatique (macOS uniquement)

```bash
./scripts/install-stripe.sh
```

Ce script :
- ✅ Vérifie si Stripe CLI est installé
- ✅ Installe Stripe CLI via Homebrew si nécessaire
- ✅ Affiche la version installée

### Option 2 : Installation manuelle

#### macOS
```bash
brew install stripe/stripe-cli/stripe
```

#### Linux / Windows
Consultez : https://stripe.com/docs/stripe-cli#install

---

## 🔐 Se connecter à Stripe

Une fois installé, connectez-vous :

```bash
stripe login
```

Cela ouvrira votre navigateur pour autoriser la connexion.

---

## 🎯 Démarrage rapide

### 1. Démarrer Stripe CLI

Le serveur Next.js tourne sur le port **3000**.

Dans un **nouveau terminal**, exécutez :

```bash
npm run stripe:listen
```

Ou utilisez le script :

```bash
./scripts/start-stripe.sh
```

### 2. Copier le Webhook Secret

Après le démarrage, vous verrez :

```
> Ready! Your webhook signing secret is whsec_XXXXXXXXXX
```

**IMPORTANT** : Copiez ce secret (`whsec_...`) !

### 3. Ajouter le secret dans `.env.local`

Éditez votre fichier `.env.local` et ajoutez :

```env
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Remplacez** `whsec_XXXXXXXXXXXXXXXXXXXXXXXXXX` par le secret réel affiché.

### 4. Redémarrer Next.js

Redémarrez votre serveur Next.js (Ctrl+C puis `npm run dev`) pour prendre en compte la nouvelle variable.

---

## ✅ Vérification

Une fois tout configuré, vous devriez voir dans le terminal Stripe CLI :

```
> Ready! Your webhook signing secret is whsec_...
> Forwarding events to localhost:3000/api/webhooks/stripe
```

---

## 🧪 Test

Pour tester, effectuez un paiement test :
1. Allez sur `http://localhost:3000/checkout`
2. Utilisez la carte de test : `4242 4242 4242 4242`
3. Date : `12/34`, CVC : `123`

Vous devriez voir dans le terminal Stripe CLI :
```
payment_intent.succeeded [evt_xxx] -> POST http://localhost:3000/api/webhooks/stripe [200]
```

---

## 📚 Documentation complète

Consultez `STRIPE_WEBHOOK_SETUP.md` pour plus de détails.

