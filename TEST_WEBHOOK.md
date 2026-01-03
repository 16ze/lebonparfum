# 🧪 Test du Webhook Stripe

## Étape 1 : Vérifier que stripe listen tourne

Dans le terminal où tu as lancé `stripe listen`, tu DOIS voir :

```
Ready! Your webhook signing secret is whsec_xxxxx (^C to quit)
```

**Si tu ne vois pas ce message, le webhook ne peut PAS fonctionner.**

---

## Étape 2 : Faire un test manuel

Dans un nouveau terminal, lance cette commande :

```bash
stripe trigger payment_intent.succeeded
```

**Résultat attendu dans le terminal `stripe listen`** :
```
payment_intent.succeeded [evt_xxxxx] -> POST localhost:3001/api/webhooks/stripe [200]
```

**Résultat attendu dans les logs Next.js** :
```
✅ Webhook Stripe reçu: payment_intent.succeeded
```

---

## Étape 3 : Si tu vois une erreur

### Erreur : `[500] Internal Server Error`

Cela signifie que :
- ✅ Le webhook est bien reçu
- ❌ MAIS la fonction `decrement_stock` n'existe pas dans Supabase

**Solution** : Applique la migration SQL (voir APPLIQUER_MIGRATION.md)

### Erreur : `[400] Invalid signature`

**Solution** :
1. Copie le nouveau `whsec_...` depuis le terminal `stripe listen`
2. Mets-le dans `.env.local`
3. Redémarre Next.js

### Aucune réponse du tout

Cela signifie que Stripe CLI n'est pas connecté correctement.

**Solution** :
```bash
stripe login
stripe listen --forward-to localhost:3001/api/webhooks/stripe
```

---

## Étape 4 : Test avec un vrai achat

1. Va sur http://localhost:3001
2. Ajoute un produit au panier
3. Checkout avec `4242 4242 4242 4242`
4. **Regarde les 2 terminaux en même temps**

**Terminal stripe listen** :
```
payment_intent.succeeded [evt_xxx] -> POST localhost:3001/api/webhooks/stripe [200]
```

**Terminal Next.js** :
```
✅ Webhook Stripe reçu: payment_intent.succeeded
💰 Paiement réussi: { id: 'pi_xxx', amount: 3500, metadata: {...} }
✅ Commande créée: uuid
✅ Stock décrémenté
🎉 Commande traitée avec succès
```

---

## ✅ Checklist de Debug

- [ ] `stripe listen` tourne et affiche "Ready!"
- [ ] Webhook secret dans `.env.local`
- [ ] Next.js redémarré après ajout du secret
- [ ] Migration SQL appliquée dans Supabase
- [ ] Test `stripe trigger payment_intent.succeeded` réussi
- [ ] Les 2 terminaux affichent des logs lors d'un achat

**Si TOUS les points sont cochés, ça DOIT fonctionner.**

---

## 🔍 Commandes de Debug

### Vérifier les processus qui tournent
```bash
ps aux | grep -E "next-server|stripe listen" | grep -v grep
```

### Voir les logs Next.js en temps réel
```bash
# Dans le terminal où tourne Next.js
# Les logs doivent apparaître automatiquement
```

### Tester le webhook manuellement
```bash
stripe trigger payment_intent.succeeded
```

### Voir les webhooks dans Stripe Dashboard
https://dashboard.stripe.com/test/webhooks

---

Lance d'abord la commande `stripe trigger payment_intent.succeeded` et dis-moi ce que tu vois ! 🚀
