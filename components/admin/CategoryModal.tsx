"use client";

import { useState, useEffect } from "react";
import { X, Upload } from "lucide-react";
import { createCategory, updateCategory } from "@/app/admin/categories/actions";

/**
 * CategoryModal - Modal de création/édition de catégorie
 *
 * Features :
 * - Génération automatique du slug depuis le nom
 * - Upload d'image (optionnel)
 * - Validation formulaire
 */

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
}

interface CategoryModalProps {
  category: Category | null; // null = mode création
  onClose: () => void;
  onSuccess: () => void;
}

// Fonction pour générer un slug depuis un nom
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Retirer les accents
    .replace(/[^a-z0-9]+/g, "-") // Remplacer les caractères spéciaux par -
    .replace(/^-+|-+$/g, ""); // Retirer les - en début/fin
};

export default function CategoryModal({
  category,
  onClose,
  onSuccess,
}: CategoryModalProps) {
  const isEditing = !!category;

  // État du formulaire
  const [name, setName] = useState(category?.name || "");
  const [slug, setSlug] = useState(category?.slug || "");
  const [description, setDescription] = useState(category?.description || "");
  const [imageUrl, setImageUrl] = useState(category?.image_url || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-générer le slug quand le nom change (uniquement en mode création)
  useEffect(() => {
    if (!isEditing && name) {
      setSlug(generateSlug(name));
    }
  }, [name, isEditing]);

  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!name.trim()) {
      setError("Le nom est requis");
      return;
    }

    if (!slug.trim()) {
      setError("Le slug est requis");
      return;
    }

    setIsSubmitting(true);

    try {
      const categoryData = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || null,
        image_url: imageUrl.trim() || null,
      };

      let result;
      if (isEditing) {
        result = await updateCategory(category.id, categoryData);
      } else {
        result = await createCategory(categoryData);
      }

      if (!result.success) {
        setError(result.error || "Une erreur est survenue");
        setIsSubmitting(false);
        return;
      }

      // Succès
      onSuccess();
      onClose();
    } catch (err) {
      console.error("❌ Erreur:", err);
      setError("Erreur lors de l'enregistrement");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-black/10 p-6 flex items-center justify-between">
          <h2 className="text-xl uppercase tracking-widest font-bold">
            {isEditing ? "Éditer la catégorie" : "Nouvelle catégorie"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nom */}
          <div>
            <label className="block text-xs uppercase tracking-widest font-medium mb-2">
              Nom <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border-b border-black/20 pb-2 text-sm focus:border-black focus:outline-none transition-colors"
              placeholder="Ex: Boisés"
              required
              autoFocus
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs uppercase tracking-widest font-medium mb-2">
              Slug <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full border-b border-black/20 pb-2 text-sm focus:border-black focus:outline-none transition-colors font-mono"
              placeholder="Ex: boises"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {isEditing
                ? "Utilisé dans l'URL (modifier avec précaution)"
                : "Généré automatiquement depuis le nom"}
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs uppercase tracking-widest font-medium mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-black/20 p-3 text-sm focus:border-black focus:outline-none transition-colors resize-none"
              rows={4}
              placeholder="Description de la catégorie..."
            />
          </div>

          {/* URL Image */}
          <div>
            <label className="block text-xs uppercase tracking-widest font-medium mb-2">
              URL de l'image
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1 border-b border-black/20 pb-2 text-sm focus:border-black focus:outline-none transition-colors"
                placeholder="https://..."
              />
              <Upload className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              URL complète de l'image (optionnel)
            </p>
          </div>

          {/* Aperçu image */}
          {imageUrl && (
            <div>
              <label className="block text-xs uppercase tracking-widest font-medium mb-2">
                Aperçu
              </label>
              <div className="relative w-32 h-32 bg-gray-100 rounded-sm overflow-hidden">
                <img
                  src={imageUrl}
                  alt="Aperçu"
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            </div>
          )}

          {/* Message d'erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-sm">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Boutons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-black/10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-xs uppercase tracking-wider border border-black/20 hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 text-xs uppercase tracking-wider bg-black text-white hover:bg-black/80 transition-colors disabled:opacity-50"
            >
              {isSubmitting
                ? "Enregistrement..."
                : isEditing
                ? "Mettre à jour"
                : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
