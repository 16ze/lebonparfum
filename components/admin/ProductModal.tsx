"use client";

import { useState, useEffect } from "react";
import { X, Upload, Loader2 } from "lucide-react";
import Image from "next/image";

/**
 * ProductModal - Modal CRUD pour Produits
 *
 * Modes :
 * - "create" : Création nouveau produit
 * - "edit" : Édition produit existant
 * - null : Modal fermée
 *
 * Design Byredo : Modal plein écran avec formulaire minimal
 */

type Product = {
  id?: string;
  name: string;
  slug: string;
  brand: string;
  price: number; // en centimes
  stock: number;
  description?: string;
  notes_top?: string;
  notes_heart?: string;
  notes_base?: string;
  category?: string;
  image_url?: string;
};

type ProductModalProps = {
  mode: "create" | "edit" | null;
  product?: Product | null;
  onClose: () => void;
  onSuccess: () => void;
};

export default function ProductModal({
  mode,
  product,
  onClose,
  onSuccess,
}: ProductModalProps) {
  const [formData, setFormData] = useState<Product>({
    name: "",
    slug: "",
    brand: "",
    price: 0,
    stock: 0,
    description: "",
    notes_top: "",
    notes_heart: "",
    notes_base: "",
    category: "Parfum",
    image_url: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  // Charger les données du produit en mode édition
  useEffect(() => {
    if (mode === "edit" && product) {
      setFormData(product);
      if (product.image_url) {
        setImagePreview(product.image_url);
      }
    } else if (mode === "create") {
      // Reset form
      setFormData({
        name: "",
        slug: "",
        brand: "",
        price: 0,
        stock: 0,
        description: "",
        notes_top: "",
        notes_heart: "",
        notes_base: "",
        category: "Parfum",
        image_url: "",
      });
      setImagePreview("");
      setImageFile(null);
    }
  }, [mode, product]);

  // Auto-générer le slug depuis le nom
  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, ""),
    }));
  };

  // Gestion de l'upload d'image
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Upload de l'image si nouvelle
      let imageUrl = formData.image_url;

      if (imageFile) {
        const formDataImg = new FormData();
        formDataImg.append("file", imageFile);

        const uploadRes = await fetch("/api/admin/upload", {
          method: "POST",
          body: formDataImg,
        });

        if (!uploadRes.ok) {
          throw new Error("Échec de l'upload d'image");
        }

        const { url } = await uploadRes.json();
        imageUrl = url;
      }

      // 2. Créer/Mettre à jour le produit
      const endpoint =
        mode === "create"
          ? "/api/admin/products"
          : `/api/admin/products/${product?.id}`;

      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          image_url: imageUrl,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erreur lors de l'opération");
      }

      // Succès
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  if (!mode) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-black/10">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-black/10 px-8 py-6 flex items-center justify-between">
          <h2 className="text-2xl uppercase tracking-widest font-bold">
            {mode === "create" ? "Nouveau Produit" : "Éditer Produit"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-black/5 transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* Image */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-3">
              Image du produit
            </label>
            <div className="flex items-start gap-6">
              {/* Prévisualisation */}
              <div className="relative w-40 h-40 bg-gray-100 border border-black/10 flex items-center justify-center">
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <Upload className="w-8 h-8 text-gray-300" strokeWidth={1.5} />
                )}
              </div>

              {/* Bouton upload */}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="inline-block cursor-pointer bg-black text-white px-6 py-3 text-sm uppercase tracking-wider hover:bg-black/80 transition-colors"
                >
                  Choisir une image
                </label>
                <p className="text-xs text-gray-400 mt-2 uppercase tracking-wider">
                  Format : JPG, PNG • Max 5 Mo
                </p>
              </div>
            </div>
          </div>

          {/* Nom et Slug */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                Nom du produit *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                className="w-full px-4 py-3 border border-black/10 focus:outline-none focus:border-black transition-colors"
                placeholder="Ex: Bal d'Afrique"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                Slug (URL) *
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, slug: e.target.value }))
                }
                required
                className="w-full px-4 py-3 border border-black/10 focus:outline-none focus:border-black transition-colors bg-gray-50"
                placeholder="bal-dafrique"
              />
            </div>
          </div>

          {/* Marque et Catégorie */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                Marque *
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, brand: e.target.value }))
                }
                required
                className="w-full px-4 py-3 border border-black/10 focus:outline-none focus:border-black transition-colors"
                placeholder="Ex: BYREDO"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                Catégorie
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border border-black/10 focus:outline-none focus:border-black transition-colors"
              >
                <option value="Parfum">Parfum</option>
                <option value="Eau de Parfum">Eau de Parfum</option>
                <option value="Eau de Toilette">Eau de Toilette</option>
                <option value="Cologne">Cologne</option>
              </select>
            </div>
          </div>

          {/* Prix et Stock */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                Prix (en €) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price / 100}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    price: Math.round(parseFloat(e.target.value) * 100),
                  }))
                }
                required
                className="w-full px-4 py-3 border border-black/10 focus:outline-none focus:border-black transition-colors"
                placeholder="145.00"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                Stock (unités) *
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    stock: parseInt(e.target.value),
                  }))
                }
                required
                min="0"
                className="w-full px-4 py-3 border border-black/10 focus:outline-none focus:border-black transition-colors"
                placeholder="50"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={4}
              className="w-full px-4 py-3 border border-black/10 focus:outline-none focus:border-black transition-colors resize-none"
              placeholder="Description du produit..."
            />
          </div>

          {/* Notes olfactives */}
          <div className="space-y-4">
            <h3 className="text-sm uppercase tracking-widest text-gray-700 font-medium">
              Notes Olfactives
            </h3>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">
                  Notes de tête
                </label>
                <input
                  type="text"
                  value={formData.notes_top}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      notes_top: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-black/10 focus:outline-none focus:border-black transition-colors text-sm"
                  placeholder="Agrumes, Bergamote"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">
                  Notes de cœur
                </label>
                <input
                  type="text"
                  value={formData.notes_heart}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      notes_heart: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-black/10 focus:outline-none focus:border-black transition-colors text-sm"
                  placeholder="Rose, Jasmin"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">
                  Notes de fond
                </label>
                <input
                  type="text"
                  value={formData.notes_base}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      notes_base: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-black/10 focus:outline-none focus:border-black transition-colors text-sm"
                  placeholder="Musc, Bois"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-black/10">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 text-sm uppercase tracking-wider text-gray-600 hover:bg-black/5 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-black text-white px-8 py-3 text-sm uppercase tracking-wider hover:bg-black/80 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enregistrement...
                </>
              ) : mode === "create" ? (
                "Créer le produit"
              ) : (
                "Sauvegarder"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
