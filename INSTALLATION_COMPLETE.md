# 🚀 Installation Complète du Système E-Commerce

## ❌ Problème Actuel

Pour l'instant, **RIEN NE FONCTIONNE** parce que :
- ❌ La fonction SQL `decrement_stock` n'existe pas
- ❌ Le webhook Stripe n'est pas configuré
- ❌ Les commandes ne sont jamais créées
- ❌ Le stock ne diminue jamais
- ❌ Le panier ne se vide pas

## ✅ Solution : 3 Étapes OBLIGATOIRES

---

## ÉTAPE 1 : Appliquer la Migration SQL (2 minutes)

### Option A : Via Supabase Dashboard (RECOMMANDÉ)

1. Va sur https://supabase.com/dashboard
2. Sélectionne ton projet
3. Dans le menu de gauche, clique sur **SQL Editor**
4. Clique sur **New Query**
5. Copie-colle ce code SQL :

```sql
-- Fonction de décrémentation de stock
CREATE OR REPLACE FUNCTION decrement_stock(
  product_id UUID,
  quantity INTEGER
)
RETURNS VOID AS $$
BEGIN
  -- Décrémenter le stock de manière atomique
  UPDATE products
  SET stock = stock - quantity
  WHERE id = product_id
  AND stock >= quantity;

  -- Vérifier si la mise à jour a réussi
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Stock insuffisant ou produit introuvable pour ID: %', product_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Ajouter un commentaire
COMMENT ON FUNCTION decrement_stock IS 'Décrémente le stock d''un produit de manière atomique après un achat';
```

6. Clique sur **RUN** (en bas à droite)
7. Tu devrais voir : `Success. No rows returned`

### Option B : Via Supabase CLI

```bash
npx supabase db push
```

---

## ÉTAPE 2 : Configurer le Webhook Stripe en Local (5 minutes)

### A. Installer Stripe CLI

**macOS (avec Homebrew)** :
```bash
brew install stripe/stripe-cli/stripe
```

**Windows** :
Télécharge depuis : https://github.com/stripe/stripe-cli/releases

**Linux** :
```bash
wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_linux_x86_64.tar.gz
tar -xvf stripe_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin/
```

### B. Se connecter à Stripe

```bash
stripe login
```

Ça va ouvrir ton navigateur pour autoriser l'accès.

### C. Lancer l'écoute des webhooks

**Terminal 1** : Lance Next.js
```bash
npm run dev
```

**Terminal 2** : Lance le webhook listener
```bash
stripe listen --forward-to localhost:3001/api/webhooks/stripe
```

Tu vas voir un message comme :
```
> Ready! Your webhook signing secret is whsec_XXXXXXXXXX
```

### D. Copier le Webhook Secret

Copie le secret `whsec_...` et ajoute-le dans ton fichier `.env.local` :

```bash
# Ajoute cette ligne dans .env.local
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXXXXXXXX
```

### E. Redémarrer Next.js

Arrête le serveur Next.js (Ctrl+C) et relance :
```bash
npm run dev
```

---

## ÉTAPE 3 : Tester le Flux Complet (2 minutes)

### 1. Ajouter un produit au panier
- Va sur http://localhost:3001
- Clique sur un produit
- Ajoute-le au panier

### 2. Aller au checkout
- Clique sur l'icône panier
- Clique sur "Procéder au paiement"

### 3. Payer avec une carte de test Stripe
- **Numéro** : `4242 4242 4242 4242`
- **Date** : `12/34` (n'importe quelle date future)
- **CVC** : `123` (n'importe quel code 3 chiffres)
- **Nom** : Ton nom

### 4. Vérifier que TOUT fonctionne

**✅ Dans le terminal "stripe listen"** :
```
payment_intent.succeeded [evt_xxx] -> POST http://localhost:3001/api/webhooks/stripe [200]
```

**✅ Dans le terminal Next.js** :
```
✅ Webhook Stripe reçu: payment_intent.succeeded
💰 Paiement réussi: { id: 'pi_xxx', amount: 3500 }
✅ Commande créée: xxxx-xxxx-xxxx
✅ Stock décrémenté pour xxxx-xxxx (-1)
🎉 Commande traitée avec succès
```

**✅ Redirection automatique** :
- Tu es redirigé vers `/checkout/success`
- La page affiche "Commande Confirmée"
- Le numéro de commande est affiché

**✅ Dans Supabase** :
- Va sur https://supabase.com/dashboard
- Table `orders` → Nouvelle commande avec `status = 'paid'`
- Table `products` → Le stock a diminué

**✅ Dans l'admin** :
- Va sur http://localhost:3001/admin/orders
- La commande apparaît dans la liste ! 🎉

**✅ Le panier est vide** :
- Retourne sur le site
- Le panier est maintenant vide

---

## 🔥 Si ça ne marche TOUJOURS PAS

### Erreur : `STRIPE_WEBHOOK_SECRET manquante`
**Solution** : Vérifie que tu as bien ajouté la ligne dans `.env.local` et redémarré Next.js

### Erreur : `Invalid signature`
**Solution** : Le webhook secret est incorrect. Copie le bon secret depuis `stripe listen`

### Erreur : `fonction decrement_stock n'existe pas`
**Solution** : Retourne à l'ÉTAPE 1 et applique la migration SQL

### Les logs webhook n'apparaissent pas
**Solution** :
1. Vérifie que `stripe listen` tourne dans un terminal
2. Vérifie que Next.js tourne sur le port 3001
3. Vérifie l'URL dans stripe listen : `--forward-to localhost:3001/api/webhooks/stripe`

### Le panier ne se vide pas
**Solution** : C'est normal, le panier se vide seulement après redirection vers `/checkout/success`

---

## 📊 Flux Complet Qui Doit Marcher

```
1. Client ajoute produit au panier
   ↓
2. Client clique "Payer"
   ↓
3. Frontend appelle /api/create-payment-intent
   ↓
4. Backend récupère les VRAIS prix depuis Supabase
   ↓
5. Backend crée un Payment Intent Stripe
   ↓
6. Client paie avec sa carte
   ↓
7. Stripe valide le paiement
   ↓
8. Stripe envoie un webhook à /api/webhooks/stripe
   ↓
9. Webhook crée la commande dans Supabase
   ↓
10. Webhook décrémente le stock
   ↓
11. Client est redirigé vers /checkout/success
   ↓
12. Page vide le panier
   ↓
13. Admin voit la commande dans /admin/orders
```

**TOUT doit fonctionner automatiquement !**

---

## 🎯 Checklist Finale

Avant de dire "ça ne marche pas", vérifie que :

- [ ] Migration SQL appliquée (fonction `decrement_stock` existe)
- [ ] Stripe CLI installé
- [ ] `stripe login` exécuté
- [ ] `stripe listen` tourne dans un terminal
- [ ] Webhook secret copié dans `.env.local`
- [ ] Next.js redémarré après ajout du secret
- [ ] Les 2 terminaux tournent en parallèle (Next.js + stripe listen)
- [ ] Carte de test Stripe utilisée : `4242 4242 4242 4242`

**Si TOUS ces points sont cochés, le système DOIT fonctionner.** 🚀

Si ça ne marche toujours pas, copie-moi les logs exacts des 2 terminaux.
