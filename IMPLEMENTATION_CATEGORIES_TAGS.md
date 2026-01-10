# Guide d'implémentation - Catégories & Tags pour Produits

## 🎯 Objectif
Permettre l'assignation de catégories et tags aux produits depuis le formulaire d'édition admin.

---

## 📝 ÉTAPE 1 : Modifier les Actions Serveur (`app/admin/products/actions.ts`)

### 1.1 Modifier la signature de `createProduct`

**Ligne 29-32 : Ajouter les paramètres**
```typescript
export async function createProduct(
  productData: ProductFormData,
  imageFile?: File,
  categoryIds?: string[],  // NOUVEAU
  tagIds?: string[]         // NOUVEAU
) {
```

### 1.2 Ajouter la logique de gestion des relations (après ligne 112)

```typescript
    // Gérer les relations catégories et tags
    if (data && data.id) {
      const productId = data.id;

      // Insérer les relations catégories
      if (categoryIds && categoryIds.length > 0) {
        const categoryRelations = categoryIds.map((catId) => ({
          product_id: productId,
          category_id: catId,
        }));

        await supabase.from("product_categories").insert(categoryRelations);
      }

      // Insérer les relations tags
      if (tagIds && tagIds.length > 0) {
        const tagRelations = tagIds.map((tagId) => ({
          product_id: productId,
          tag_id: tagId,
        }));

        await supabase.from("product_tags").insert(tagRelations);
      }
    }
```

### 1.3 Modifier la signature de `updateProduct`

**Ligne 135-139 : Ajouter les paramètres**
```typescript
export async function updateProduct(
  productId: string,
  productData: ProductFormData,
  imageFile?: File,
  categoryIds?: string[],  // NOUVEAU
  tagIds?: string[]         // NOUVEAU
) {
```

### 1.4 Ajouter la logique de mise à jour des relations (après ligne 240)

```typescript
    // Mettre à jour les relations catégories et tags
    // 1. Supprimer les anciennes relations
    await Promise.all([
      supabase.from("product_categories").delete().eq("product_id", productId),
      supabase.from("product_tags").delete().eq("product_id", productId),
    ]);

    // 2. Insérer les nouvelles relations catégories
    if (categoryIds && categoryIds.length > 0) {
      const categoryRelations = categoryIds.map((catId) => ({
        product_id: productId,
        category_id: catId,
      }));

      await supabase.from("product_categories").insert(categoryRelations);
    }

    // 3. Insérer les nouvelles relations tags
    if (tagIds && tagIds.length > 0) {
      const tagRelations = tagIds.map((tagId) => ({
        product_id: productId,
        tag_id: tagId,
      }));

      await supabase.from("product_tags").insert(tagRelations);
    }
```

---

## 📝 ÉTAPE 2 : Modifier le ProductModal (`components/admin/ProductModal.tsx`)

### 2.1 Ajouter les imports (ligne 7)
```typescript
import { createClient } from "@/utils/supabase/client";
```

### 2.2 Ajouter les interfaces (après ligne 18)
```typescript
interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}
```

### 2.3 Ajouter les états (après ligne 46)
```typescript
  // États pour catégories et tags
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
```

### 2.4 Ajouter un useEffect pour charger les données (après ligne 70)
```typescript
  // Charger les catégories et tags disponibles + relations existantes
  useEffect(() => {
    const loadData = async () => {
      if (!isOpen) return;

      setIsLoadingData(true);
      const supabase = createClient();

      try {
        // Récupérer toutes les catégories
        const { data: categories } = await supabase
          .from("categories")
          .select("id, name, slug")
          .order("name");

        // Récupérer tous les tags
        const { data: tags } = await supabase
          .from("tags")
          .select("id, name, slug")
          .order("name");

        setAvailableCategories(categories || []);
        setAvailableTags(tags || []);

        // Si mode édition, récupérer les relations existantes
        if (isEditMode && product) {
          const [categoryRelations, tagRelations] = await Promise.all([
            supabase
              .from("product_categories")
              .select("category_id")
              .eq("product_id", product.id),
            supabase
              .from("product_tags")
              .select("tag_id")
              .eq("product_id", product.id),
          ]);

          setSelectedCategoryIds(
            categoryRelations.data?.map((r) => r.category_id) || []
          );
          setSelectedTagIds(tagRelations.data?.map((r) => r.tag_id) || []);
        } else {
          setSelectedCategoryIds([]);
          setSelectedTagIds([]);
        }
      } catch (err) {
        console.error("❌ Erreur chargement données:", err);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, [isOpen, isEditMode, product]);
```

### 2.5 Ajouter les fonctions toggle (après ligne 91)
```typescript
  // Toggle catégorie
  const toggleCategory = (categoryId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Toggle tag
  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };
```

### 2.6 Modifier handleSubmit (lignes 130-134)
```typescript
      let result;
      if (isEditMode && product) {
        result = await updateProduct(
          product.id,
          productData,
          imageFile || undefined,
          selectedCategoryIds,  // NOUVEAU
          selectedTagIds        // NOUVEAU
        );
      } else {
        result = await createProduct(
          productData,
          imageFile || undefined,
          selectedCategoryIds,  // NOUVEAU
          selectedTagIds        // NOUVEAU
        );
      }
```

### 2.7 Ajouter les sections UI dans la colonne 2 (après la section Marque, ligne 233)

**REMPLACER** la ligne 218 `<div className="px-4 md:px-6 py-4 md:py-6 flex-1">` **PAR:**
```typescript
            <div className="border-b border-black/10 px-4 md:px-6 py-4 md:py-6">
```

**AJOUTER** après la fermeture de la section Marque (ligne 233) :

```typescript
            {/* Section Catégories */}
            <div className="border-b border-black/10 px-4 md:px-6 py-4 md:py-6">
              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-3">
                Catégories
              </label>
              {isLoadingData ? (
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Chargement...
                </div>
              ) : availableCategories.length === 0 ? (
                <p className="text-xs text-gray-400">Aucune catégorie disponible</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {availableCategories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => toggleCategory(category.id)}
                      disabled={isLoading}
                      className={`px-3 py-1.5 text-xs uppercase tracking-wider border transition-colors disabled:opacity-50 ${
                        selectedCategoryIds.includes(category.id)
                          ? "bg-black text-white border-black"
                          : "bg-white text-black border-black/20 hover:border-black"
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Section Tags */}
            <div className="px-4 md:px-6 py-4 md:py-6 flex-1">
              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-3">
                Tags
              </label>
              {isLoadingData ? (
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Chargement...
                </div>
              ) : availableTags.length === 0 ? (
                <p className="text-xs text-gray-400">Aucun tag disponible</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      disabled={isLoading}
                      className={`px-3 py-1.5 text-xs uppercase tracking-wider border transition-colors disabled:opacity-50 ${
                        selectedTagIds.includes(tag.id)
                          ? "bg-black text-white border-black"
                          : "bg-white text-black border-black/20 hover:border-black"
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
```

---

## 📝 ÉTAPE 3 : Afficher les badges dans le tableau (`app/admin/products/page.tsx`)

### 3.1 Modifier la requête Supabase (ligne 13-16)

**REMPLACER:**
```typescript
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
```

**PAR:**
```typescript
  const { data: products, error } = await supabase
    .from("products")
    .select(`
      *,
      product_categories(
        category_id,
        categories(id, name, slug)
      ),
      product_tags(
        tag_id,
        tags(id, name, slug)
      )
    `)
    .order("created_at", { ascending: false });
```

---

## 📝 ÉTAPE 4 : Afficher les badges dans `ProductsTable.tsx`

### 4.1 Mettre à jour l'interface Product (ligne 21-30)

**AJOUTER** après line 30:
```typescript
  product_categories?: Array<{
    category_id: string;
    categories: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
  product_tags?: Array<{
    tag_id: string;
    tags: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
```

### 4.2 Ajouter une colonne dans le tableau desktop

Dans la section `<thead>` (après la colonne Marque), **AJOUTER:**
```tsx
<th className="text-left py-4 px-6 text-xs uppercase tracking-widest font-medium text-gray-600">
  Catégories / Tags
</th>
```

Dans le `<tbody>` (après la cellule Marque), **AJOUTER:**
```tsx
<td className="py-4 px-6">
  <div className="flex flex-col gap-2">
    {/* Catégories */}
    {product.product_categories && product.product_categories.length > 0 && (
      <div className="flex flex-wrap gap-1">
        {product.product_categories.map((pc) => (
          <span
            key={pc.category_id}
            className="text-xs px-2 py-1 bg-black text-white uppercase tracking-wider"
          >
            {pc.categories.name}
          </span>
        ))}
      </div>
    )}
    {/* Tags */}
    {product.product_tags && product.product_tags.length > 0 && (
      <div className="flex flex-wrap gap-1">
        {product.product_tags.map((pt) => (
          <span
            key={pt.tag_id}
            className="text-xs px-2 py-1 border border-black/20 uppercase tracking-wider"
          >
            {pt.tags.name}
          </span>
        ))}
      </div>
    )}
  </div>
</td>
```

---

## ✅ Checklist de validation

- [ ] Les catégories se chargent dans le modal produit
- [ ] Les tags se chargent dans le modal produit
- [ ] On peut sélectionner/désélectionner des catégories
- [ ] On peut sélectionner/désélectionner des tags
- [ ] En mode édition, les catégories existantes sont pré-sélectionnées
- [ ] En mode édition, les tags existants sont pré-sélectionnés
- [ ] La création de produit enregistre bien les relations
- [ ] La mise à jour de produit met à jour les relations
- [ ] Les badges s'affichent dans le tableau produits
- [ ] Les badges sont stylisés (noir pour catégories, bordure pour tags)

---

## 🐛 Debugging

Si ça ne fonctionne pas, vérifier dans la console:
1. Les logs de chargement des catégories/tags
2. Les logs lors de la soumission du formulaire
3. Les requêtes Supabase dans l'onglet Network
4. La structure des données retournées

---

## 📚 Ressources

- Tables concernées: `product_categories`, `product_tags`
- Relations: Many-to-Many via tables pivot
- Pattern: Delete puis Insert pour mise à jour
