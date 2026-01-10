"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { createTag, updateTag } from "@/app/admin/tags/actions";

/**
 * TagModal - Modal de création/édition de tag
 *
 * Features :
 * - Interface simple (juste nom + slug)
 * - Génération automatique du slug
 */

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface TagModalProps {
  tag: Tag | null; // null = mode création
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

export default function TagModal({ tag, onClose, onSuccess }: TagModalProps) {
  const isEditing = !!tag;

  // État du formulaire
  const [name, setName] = useState(tag?.name || "");
  const [slug, setSlug] = useState(tag?.slug || "");
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
      const tagData = {
        name: name.trim(),
        slug: slug.trim(),
      };

      let result;
      if (isEditing) {
        result = await updateTag(tag.id, tagData);
      } else {
        result = await createTag(tagData);
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
      <div className="bg-white w-full max-w-lg">
        {/* Header */}
        <div className="border-b border-black/10 p-6 flex items-center justify-between">
          <h2 className="text-xl uppercase tracking-widest font-bold">
            {isEditing ? "Éditer le tag" : "Nouveau tag"}
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
              placeholder="Ex: Best-seller"
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
              placeholder="Ex: best-seller"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {isEditing
                ? "Utilisé pour identifier le tag"
                : "Généré automatiquement depuis le nom"}
            </p>
          </div>

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
