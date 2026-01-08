# Convention de Gestion des Prix

## ⚠️ CRITIQUE : Convention stricte à respecter pour éviter les erreurs de prix

### Unité de stockage

1. **Base de données Supabase (`products.price`)**
   - **Unité : CENTIMES (ex: 3000 = 30€)**
   - Stockage en entiers pour éviter les problèmes de précision décimale
   - Exemples :
     - 15€ → 1500 centimes
     - 30€ → 3000 centimes
     - 150€ → 15000 centimes

2. **CartContext (`CartItem.price`)**
   - **Unité : EUROS (ex: 30.00 = 30€)**
   - Stockage en nombre décimal (float)
   - Utilisé pour tous les calculs côté client
   - Exemples :
     - 15€ → 15.00
     - 30€ → 30.00
     - 150€ → 150.00

3. **Stripe API**
   - **Unité : CENTIMES (ex: 3000 = 30€)**
   - Stripe attend les montants en centimes (ou plus petites unités selon la devise)

### Conversion requise

#### Lors de l'ajout au panier depuis Supabase
```typescript
// ✅ CORRECT
const priceInEuros = product.price / 100; // Convertir centimes → euros
addToCart({
  id: product.id,
  name: product.name,
  price: priceInEuros, // Panier attend des euros
  // ...
});

// ❌ INCORRECT (NE JAMAIS FAIRE)
addToCart({
  price: product.price, // ❌ Erreur : on passe des centimes au lieu d'euros
  // ...
});
```

#### Lors de l'affichage depuis Supabase
```typescript
// ✅ CORRECT
const formattedPrice = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
}).format(product.price / 100); // Convertir centimes → euros pour affichage

// Ou simplement
{(product.price / 100).toFixed(2)} €
```

#### Lors de l'envoi à Stripe depuis le panier
```typescript
// ✅ CORRECT
// Les prix du panier sont en euros, on multiplie par 100 pour Stripe
const subtotalCents = Math.round(
  verifiedItems.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100
);
```

### Points d'attention

1. **Fichiers concernés :**
   - `components/account/WishlistGrid.tsx` ✅ Corrigé
   - `components/product/ProductInfo.tsx` ✅ Correct (utilise `priceNumeric` déjà converti)
   - `app/product/[slug]/page.tsx` ✅ Correct (convertit dans `priceNumeric`)
   - `components/cart/CartDrawer.tsx` ✅ Correct (affiche directement, pas de conversion)
   - `components/checkout/CheckoutSummary.tsx` ✅ Correct (affiche directement)
   - `app/api/create-payment-intent/route.ts` ✅ Correct (convertit DB → euros, puis euros → centimes Stripe)

2. **Tests à effectuer :**
   - ✅ Ajout au panier depuis une page produit
   - ✅ Ajout au panier depuis la wishlist
   - ✅ Affichage correct des prix dans le panier
   - ✅ Calcul correct du total dans le panier
   - ✅ Passage correct à Stripe (multiplication par 100)

### Règle d'or

**Toujours vérifier l'unité lors de toute manipulation de prix :**
- Si la source est **Supabase** → diviser par 100 pour obtenir des euros
- Si la destination est **CartContext** → utiliser des euros
- Si la destination est **Stripe** → multiplier par 100 pour obtenir des centimes
- Si c'est pour l'**affichage** → utiliser des euros (formaté avec `Intl.NumberFormat`)

