# 🚀 Démarrage rapide Stripe CLI

## ✅ Étape 1 : Installer Stripe CLI

### macOS (avec Homebrew)
```bash
brew install stripe/stripe-cli/stripe
```

### Linux / Windows
Voir la documentation : https://stripe.com/docs/stripe-cli#install

## ✅ Étape 2 : Se connecter à Stripe

```bash
stripe login
```

Cela ouvrira votre navigateur pour autoriser la connexion.

## ✅ Étape 3 : Démarrer Stripe CLI

Le serveur Next.js tourne sur le port **3000**.

Dans un **nouveau terminal**, exécutez :

```bash
npm run stripe:listen
```

Ou directement :

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## ✅ Étape 4 : Copier le Webhook Secret

Après le démarrage, Stripe CLI affichera :

```
> Ready! Your webhook signing secret is whsec_XXXXXXXXXX
```

**Copiez ce secret** et ajoutez-le dans votre `.env.local` :

```env
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXXXXXXXX
```

## ✅ Étape 5 : Redémarrer Next.js

Redémarrez votre serveur Next.js pour prendre en compte la nouvelle variable :

```bash
# Ctrl+C pour arrêter, puis
npm run dev
```

## 🎯 Résultat attendu

Vous devriez voir dans le terminal Stripe CLI :

```
> Ready! Your webhook signing secret is whsec_...
> Forwarding events to localhost:3000/api/webhooks/stripe
```

Maintenant, les webhooks Stripe sont fonctionnels ! 🎉

---

## 🔍 Vérification

Pour tester, effectuez un paiement test avec :
- **Carte** : `4242 4242 4242 4242`
- **Date** : `12/34` (n'importe quelle date future)
- **CVC** : `123`

Vous devriez voir dans le terminal Stripe CLI :
```
payment_intent.succeeded [evt_xxx] -> POST http://localhost:3000/api/webhooks/stripe [200]
```
