# 🚀 Migration 09: Features Avancées Espace Client

## 📋 Vue d'ensemble

Cette migration ajoute 5 nouvelles tables pour les fonctionnalités avancées de l'espace client :

1. **`user_addresses`** : Gestion des adresses de livraison
2. **`wishlist`** : Liste de souhaits des produits
3. **`notifications`** : Système de notifications
4. **`loyalty_points`** : Compte de points de fidélité
5. **`loyalty_transactions`** : Historique des points

---

## 🔧 Installation

### 1. Appliquer la migration dans Supabase

1. Ouvre **Supabase Dashboard** > **SQL Editor**
2. Copie le contenu de `supabase/migrations/09_advanced_features.sql`
3. Colle et **Exécute** la requête
4. Vérifie qu'il n'y a pas d'erreur

### 2. Vérifier les tables créées

Va dans **Table Editor** et vérifie que ces tables existent :

- ✅ `user_addresses`
- ✅ `wishlist`
- ✅ `notifications`
- ✅ `loyalty_points`
- ✅ `loyalty_transactions`

---

## 📊 Schéma des tables

### **user_addresses** (Adresses de livraison)

```sql
- id (uuid, PK)
- user_id (uuid, FK → auth.users)
- label (text) : "Maison", "Bureau", etc.
- first_name (text)
- last_name (text)
- address (text)
- address_complement (text, nullable)
- city (text)
- postal_code (text)
- country (text, default 'France')
- phone (text, nullable)
- is_default (boolean, default false)
- created_at, updated_at
```

### **wishlist** (Liste de souhaits)

```sql
- id (uuid, PK)
- user_id (uuid, FK → auth.users)
- product_id (uuid, FK → products)
- created_at
- UNIQUE(user_id, product_id) : Un produit une seule fois par user
```

### **notifications** (Notifications)

```sql
- id (uuid, PK)
- user_id (uuid, FK → auth.users)
- type (text) : 'order_status', 'promotion', 'info'
- title (text)
- message (text)
- link (text, nullable)
- is_read (boolean, default false)
- created_at
```

### **loyalty_points** (Points de fidélité)

```sql
- id (uuid, PK)
- user_id (uuid, FK → auth.users)
- points (integer) : Solde actuel
- total_earned (integer) : Total cumulé (historique)
- last_updated
- UNIQUE(user_id)
```

### **loyalty_transactions** (Historique des points)

```sql
- id (uuid, PK)
- user_id (uuid, FK → auth.users)
- points (integer) : Positif = gain, Négatif = dépense
- type (text) : 'earned_purchase', 'spent_discount', 'bonus', 'refund'
- description (text)
- order_id (uuid, FK → orders, nullable)
- created_at
```

---

## 🔐 Sécurité (RLS Policies)

Toutes les tables ont des **Row Level Security (RLS)** policies :

- ✅ **user_addresses** : L'utilisateur voit uniquement ses adresses
- ✅ **wishlist** : L'utilisateur voit uniquement sa wishlist
- ✅ **notifications** : L'utilisateur voit uniquement ses notifications
- ✅ **loyalty_points** : L'utilisateur voit uniquement ses points
- ✅ **loyalty_transactions** : L'utilisateur voit uniquement ses transactions

---

## ⚙️ Fonctions SQL créées

### 1. `handle_new_user_loyalty()`

**Trigger automatique** : Crée un compte de points (0 points) à chaque inscription.

### 2. `add_loyalty_points_from_order(user_id, order_id, amount)`

**Fonction manuelle** : Ajoute des points après un achat.

**Règle** : 1€ = 10 points (donc 100 centimes = 10 points)

**Exemple d'utilisation** :

```sql
-- Ajouter 100 points pour une commande de 10€ (1000 centimes)
SELECT add_loyalty_points_from_order(
  'user-uuid-here',
  'order-uuid-here',
  1000
);
```

---

## 🧪 Test de la migration

### 1. Vérifier le trigger de création de compte de fidélité

1. Crée un nouveau compte utilisateur via `/login`
2. Va dans **Table Editor** > `loyalty_points`
3. Vérifie qu'une ligne avec `points = 0` et `total_earned = 0` a été créée

### 2. Tester l'ajout d'une adresse

```sql
-- Dans SQL Editor
INSERT INTO user_addresses (
  user_id,
  label,
  first_name,
  last_name,
  address,
  city,
  postal_code,
  country,
  is_default
)
VALUES (
  'TON-USER-ID-ICI',
  'Maison',
  'Jean',
  'Dupont',
  '123 Rue de la Paix',
  'Paris',
  '75001',
  'France',
  true
);
```

### 3. Tester l'ajout à la wishlist

```sql
-- Ajouter un produit à la wishlist
INSERT INTO wishlist (user_id, product_id)
VALUES (
  'TON-USER-ID-ICI',
  'UN-PRODUCT-ID-ICI'
);
```

### 4. Tester l'ajout de points

```sql
-- Récupère un order_id existant
SELECT id, user_id, amount FROM orders LIMIT 1;

-- Ajoute des points pour cet achat
SELECT add_loyalty_points_from_order(
  'user-id-de-la-commande',
  'order-id',
  5000  -- 50€ = 500 points
);

-- Vérifie les points
SELECT * FROM loyalty_points WHERE user_id = 'user-id';
SELECT * FROM loyalty_transactions WHERE user_id = 'user-id';
```

---

## 🎯 Prochaines étapes

Après avoir appliqué la migration :

1. ✅ Les tables sont créées
2. ✅ Les RLS policies sont actives
3. ✅ Le trigger de fidélité est actif
4. 🚀 **Tu peux maintenant utiliser ces tables dans le code Next.js**

---

## 🐛 Dépannage

### Erreur : "relation already exists"

➡️ Certaines tables existent déjà. Tu peux :
- Les supprimer manuellement (`DROP TABLE IF EXISTS nom_table CASCADE;`)
- Ou ignorer l'erreur si elles sont identiques

### Erreur : "duplicate key value"

➡️ Un trigger ou une contrainte unique existe déjà.
- Vérifie dans **Database** > **Triggers** si `on_auth_user_created_loyalty` existe
- Si oui, supprime-le avant de relancer la migration

### Les points ne se créent pas automatiquement

➡️ Vérifie que le trigger est bien actif :

```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created_loyalty';
```

---

## 📝 Notes

- **Programme de fidélité** : 1€ = 10 points (modifiable dans la fonction SQL)
- **Adresse par défaut** : Une seule adresse peut être `is_default = true` par user (à gérer dans le code)
- **Notifications** : Création manuelle pour l'instant (auto via webhook plus tard)
- **Wishlist** : Pas de limite de nombre de produits

---

✅ **Migration prête à être appliquée !**

