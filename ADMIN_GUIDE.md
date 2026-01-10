# Guide d'Administration - Catégories & Tags

## 📁 Gestion des Catégories

### Accès
Depuis le dashboard admin, cliquez sur **Catégories** dans la sidebar.

### Créer une catégorie
1. Cliquez sur **"Nouvelle catégorie"**
2. Remplissez le formulaire :
   - **Nom** (requis) : Ex: "Boisés", "Floraux", "Orientaux"
   - **Slug** (généré automatiquement) : URL-friendly, ex: `boises`
   - **Description** (optionnel) : Courte description de la catégorie
   - **URL Image** (optionnel) : Lien vers une image illustrant la catégorie
3. Cliquez sur **"Créer"**

### Éditer une catégorie
1. Cliquez sur l'icône **crayon** (✏️) sur la ligne de la catégorie
2. Modifiez les champs
3. Cliquez sur **"Mettre à jour"**

⚠️ **Attention** : Modifier le slug d'une catégorie peut casser les URLs existantes.

### Supprimer une catégorie
1. Cliquez sur l'icône **poubelle** (🗑️)
2. Confirmez la suppression

⚠️ **Attention** : Cette action est irréversible.

---

## 🏷️ Gestion des Tags

### Accès
Depuis le dashboard admin, cliquez sur **Tags** dans la sidebar.

### Créer un tag
1. Cliquez sur **"Nouveau tag"**
2. Remplissez le formulaire :
   - **Nom** (requis) : Ex: "Best-seller", "Nouveau", "Unisexe"
   - **Slug** (généré automatiquement) : Ex: `best-seller`
3. Cliquez sur **"Créer"**

### Éditer un tag
1. Cliquez sur l'icône **crayon** (✏️)
2. Modifiez le nom ou le slug
3. Cliquez sur **"Mettre à jour"**

### Supprimer un tag
1. Cliquez sur l'icône **poubelle** (🗑️)
2. Confirmez la suppression

---

## 💡 Conseils d'utilisation

### Catégories recommandées pour parfums
- **Boisés** : Notes de bois, cèdre, santal
- **Floraux** : Rose, jasmin, fleur d'oranger
- **Orientaux** : Épices, vanille, ambre
- **Frais** : Agrumes, notes aquatiques
- **Gourmands** : Notes sucrées, vanille, caramel

### Tags recommandés
- **Best-seller** : Produits populaires
- **Nouveau** : Nouveautés
- **Unisexe** : Pour tous
- **Luxe** : Gamme premium
- **Été** / **Hiver** : Saisonnalité
- **Jour** / **Nuit** : Moment de port

---

## 🔧 Technique

### Structure des données

**Catégories** (table `categories`)
```typescript
{
  id: string (UUID)
  name: string
  slug: string (unique)
  description: string | null
  image_url: string | null
  created_at: timestamp
}
```

**Tags** (table `tags`)
```typescript
{
  id: string (UUID)
  name: string
  slug: string (unique)
  created_at: timestamp
}
```

### Génération automatique du slug
Le slug est généré automatiquement depuis le nom :
- Conversion en minuscules
- Suppression des accents
- Remplacement des espaces et caractères spéciaux par `-`
- Exemple : "Boisés épicés" → `boises-epices`

### Validation
- Le **nom** est requis
- Le **slug** doit être unique (pas de doublons)
- Lors de l'édition, vous pouvez modifier le slug manuellement (attention aux URLs)

---

## 📱 Interface

- **Desktop** : Tableau complet avec toutes les colonnes
- **Mobile** : Cards avec informations essentielles
- **Design** : Style Byredo (minimaliste, noir & blanc, uppercase)

---

## 🔗 Prochaines étapes

Une fois vos catégories et tags créés, vous pourrez les assigner aux produits dans la page **Produits** (fonctionnalité à venir).
