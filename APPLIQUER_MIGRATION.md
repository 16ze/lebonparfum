# 🚨 ÉTAPE CRITIQUE : Appliquer la Migration SQL

## Pourquoi cette étape est OBLIGATOIRE

Sans cette migration, la fonction `decrement_stock` n'existe pas dans ta base de données.
Quand le webhook essaie de décrémenter le stock, il y a une erreur et la commande n'est pas créée.

## Comment appliquer (2 minutes)

### ÉTAPE 1 : Ouvrir Supabase Dashboard

1. Va sur https://supabase.com/dashboard
2. Connecte-toi
3. Sélectionne ton projet **lebonparfum** (ou le nom que tu lui as donné)

### ÉTAPE 2 : Ouvrir SQL Editor

Dans le menu de gauche, clique sur **SQL Editor**

### ÉTAPE 3 : Créer une nouvelle requête

Clique sur **New Query** (en haut à droite)

### ÉTAPE 4 : Copier-coller ce code SQL

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

### ÉTAPE 5 : Exécuter

Clique sur **RUN** (en bas à droite)

Tu dois voir : **Success. No rows returned**

---

## ✅ Vérifier que ça a marché

Dans Supabase, va dans **Database** > **Functions** dans le menu de gauche.

Tu dois voir la fonction `decrement_stock` dans la liste.

---

## Après avoir fait ça

Teste un achat sur le site :
1. Ajoute un produit au panier
2. Va au checkout
3. Paie avec `4242 4242 4242 4242`

Et regarde les logs dans les 2 terminaux :
- Terminal **stripe listen** : doit afficher `[200]`
- Terminal **Next.js** : doit afficher `✅ Commande créée`

---

**Cette étape est INDISPENSABLE, le système ne peut PAS fonctionner sans elle !**
