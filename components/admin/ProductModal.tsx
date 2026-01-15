"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import Drawer from "@/components/ui/Drawer";
import ImageUpload from "./ImageUpload";
import { createProduct, updateProduct } from "@/app/admin/products/actions";
import { createClient } from "@/utils/supabase/client";
import { generateSlug } from "@/lib/validation";

interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  description: string;
  price: number;
  stock: number;
  image_url?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  seo_keywords?: string[] | null;
  status?: string;
}

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

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  onSuccess?: () => void;
}

export default function ProductModal({
  isOpen,
  onClose,
  product = null,
  onSuccess,
}: ProductModalProps) {
  const isEditMode = !!product;

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    brand: "",
    description: "",
    price: "",
    stock: "0",
    meta_title: "",
    meta_description: "",
    seo_keywords: "",
    status: "draft",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // États pour catégories et tags
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    if (isEditMode && product) {
      setFormData({
        name: product.name || "",
        slug: product.slug || "",
        brand: product.brand || "",
        description: product.description || "",
        price: (product.price / 100).toString(),
        stock: product.stock.toString(),
        meta_title: product.meta_title || "",
        meta_description: product.meta_description || "",
        seo_keywords: product.seo_keywords?.join(", ") || "",
        status: product.status || "draft",
      });
    } else {
      setFormData({
        name: "",
        slug: "",
        brand: "",
        description: "",
        price: "",
        stock: "0",
        meta_title: "",
        meta_description: "",
        seo_keywords: "",
        status: "draft",
      });
      setImageFile(null);
    }
    setError(null);
  }, [isEditMode, product, isOpen]);

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

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({ ...prev, name }));

    // Auto-générer le slug uniquement en mode création
    if (!isEditMode) {
      const slug = generateSlug(name);
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  // Fonction pour générer manuellement le slug depuis le nom
  const handleGenerateSlug = () => {
    const slug = generateSlug(formData.name);
    setFormData((prev) => ({ ...prev, slug }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!formData.name || !formData.slug || !formData.brand) {
        setError("Veuillez remplir tous les champs obligatoires");
        setIsLoading(false);
        return;
      }

      const priceInCents = Math.round(parseFloat(formData.price) * 100);
      if (isNaN(priceInCents) || priceInCents <= 0) {
        setError("Prix invalide");
        setIsLoading(false);
        return;
      }

      const stock = parseInt(formData.stock);
      if (isNaN(stock) || stock < 0) {
        setError("Stock invalide");
        setIsLoading(false);
        return;
      }

      // Préparer les mots-clés SEO (convertir string en array)
      const seo_keywords = formData.seo_keywords
        ? formData.seo_keywords.split(",").map((k) => k.trim()).filter((k) => k.length > 0)
        : null;

      const productData = {
        name: formData.name,
        slug: formData.slug,
        brand: formData.brand,
        description: formData.description,
        price: priceInCents,
        stock,
        image_url: product?.image_url || null,
        meta_title: formData.meta_title || null,
        meta_description: formData.meta_description || null,
        seo_keywords,
        status: formData.status as "draft" | "published" | "archived",
      };

      let result;
      if (isEditMode && product) {
        result = await updateProduct(
          product.id,
          productData,
          imageFile || undefined,
          selectedCategoryIds,
          selectedTagIds
        );
      } else {
        result = await createProduct(
          productData,
          imageFile || undefined,
          selectedCategoryIds,
          selectedTagIds
        );
      }

      if (!result.success) {
        setError(result.error || "Erreur lors de l'enregistrement");
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("❌ Erreur inattendue:", err);
      setError("Une erreur inattendue s'est produite");
      setIsLoading(false);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Modifier le produit" : "Ajouter un produit"}
      subtitle={isEditMode ? "Éditer les informations" : "Nouveau produit"}
    >
      <form onSubmit={handleSubmit} className="h-full flex flex-col">
        {/* Layout Grid : 3 colonnes - Image | Infos de base | Description + Prix/Stock */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 flex-1 overflow-y-auto">
          {/* Colonne 1 : Image */}
          <div className="border-b lg:border-b-0 lg:border-r border-black/10 p-4 md:p-6 lg:p-8 flex flex-col">
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-4">
              Image du produit
            </label>
            <div className="flex-1 flex items-center justify-center">
              <ImageUpload
                onImageChange={setImageFile}
                currentImageUrl={product?.image_url}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Colonne 2 : Nom, Slug, Marque */}
          <div className="border-b lg:border-b-0 lg:border-r border-black/10 flex flex-col">
            {/* Section Nom */}
            <div className="border-b border-black/10 px-4 md:px-6 py-4 md:py-6">
              <label htmlFor="name" className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                Nom du produit *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                disabled={isLoading}
                className="w-full border-0 border-b border-black/20 pb-2 text-sm focus:outline-none focus:border-black transition-colors disabled:opacity-50"
                placeholder="Ex: Bal d'Afrique"
              />
            </div>

            {/* Section Slug */}
            <div className="border-b border-black/10 px-4 md:px-6 py-4 md:py-6">
              <div className="flex items-end justify-between gap-2 mb-2">
                <label htmlFor="slug" className="block text-xs uppercase tracking-widest text-gray-500">
                  Slug (URL) *
                </label>
                <button
                  type="button"
                  onClick={handleGenerateSlug}
                  disabled={isLoading || !formData.name}
                  className="text-xs text-gray-500 hover:text-black underline disabled:opacity-50 disabled:no-underline"
                >
                  Générer depuis le nom
                </button>
              </div>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="w-full border-0 border-b border-black/20 pb-2 text-sm focus:outline-none focus:border-black transition-colors disabled:opacity-50"
                placeholder="Ex: bal-d-afrique"
              />
              <p className="text-xs text-gray-400 mt-2">
                {isEditMode ? "Modifiable mais changera l'URL du produit" : "Généré automatiquement depuis le nom"}
              </p>
            </div>

            {/* Section Marque */}
            <div className="border-b border-black/10 px-4 md:px-6 py-4 md:py-6">
              <label htmlFor="brand" className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                Marque *
              </label>
              <input
                type="text"
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="w-full border-0 border-b border-black/20 pb-2 text-sm focus:outline-none focus:border-black transition-colors disabled:opacity-50"
                placeholder="Ex: Byredo"
              />
            </div>

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
          </div>

          {/* Colonne 3 : Description, Prix, Stock */}
          <div className="flex flex-col">
            {/* Section Description */}
            <div className="border-b border-black/10 px-4 md:px-6 py-4 md:py-6 flex-1">
              <label htmlFor="description" className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={isLoading}
                rows={6}
                className="w-full border border-black/20 p-3 text-sm focus:outline-none focus:border-black transition-colors disabled:opacity-50 resize-none min-h-[120px] lg:h-full"
                placeholder="Description du produit..."
              />
            </div>

            {/* Section Prix */}
            <div className="border-b border-black/10 px-4 md:px-6 py-4 md:py-6">
              <label htmlFor="price" className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                Prix (€) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                step="0.01"
                min="0"
                disabled={isLoading}
                className="w-full border-0 border-b border-black/20 pb-2 text-sm focus:outline-none focus:border-black transition-colors disabled:opacity-50"
                placeholder="Ex: 195.00"
              />
            </div>

            {/* Section Stock */}
            <div className="border-b border-black/10 px-4 md:px-6 py-4 md:py-6">
              <label htmlFor="stock" className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                Stock *
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                required
                min="0"
                disabled={isLoading}
                className="w-full border-0 border-b border-black/20 pb-2 text-sm focus:outline-none focus:border-black transition-colors disabled:opacity-50"
                placeholder="Ex: 50"
              />
            </div>

            {/* Section Statut */}
            <div className="border-b border-black/10 px-4 md:px-6 py-4 md:py-6">
              <label htmlFor="status" className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                Statut de publication *
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="w-full border border-black/20 px-3 py-2 text-sm focus:outline-none focus:border-black transition-colors disabled:opacity-50"
              >
                <option value="draft">🟠 Brouillon (invisible clients)</option>
                <option value="published">🟢 Publié (visible site)</option>
                <option value="archived">🔴 Archivé (masqué, conservé)</option>
              </select>
              <p className="text-xs text-gray-400 mt-2">
                {formData.status === "draft" && "Le produit est invisible sur le site, visible uniquement dans l'admin"}
                {formData.status === "published" && "Le produit est visible et accessible aux clients"}
                {formData.status === "archived" && "Le produit est masqué mais conservé dans la base de données"}
              </p>
            </div>

            {/* Section SEO (Référencement) */}
            <div className="bg-gray-50/50 px-4 md:px-6 py-4 md:py-6 border-b border-black/10">
              <h3 className="text-xs uppercase tracking-widest text-gray-700 mb-4 font-medium">
                🎯 Référencement (SEO)
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Personnalisez les métadonnées SEO pour optimiser le référencement Google.
                Si vide, des valeurs seront générées automatiquement.
              </p>

              {/* Meta Title */}
              <div className="mb-4">
                <label htmlFor="meta_title" className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                  Meta Title <span className="normal-case text-gray-400">(max 60 caractères)</span>
                </label>
                <input
                  type="text"
                  id="meta_title"
                  name="meta_title"
                  value={formData.meta_title}
                  onChange={handleChange}
                  maxLength={60}
                  disabled={isLoading}
                  className="w-full border border-black/20 px-3 py-2 text-sm focus:outline-none focus:border-black transition-colors disabled:opacity-50"
                  placeholder={`${formData.name || 'Nom du produit'} - ${formData.brand || 'Marque'} | Le Bon Parfum`}
                />
                <p className="text-xs text-gray-400 mt-1">
                  {formData.meta_title.length}/60 caractères
                </p>
              </div>

              {/* Meta Description */}
              <div className="mb-4">
                <label htmlFor="meta_description" className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                  Meta Description <span className="normal-case text-gray-400">(max 160 caractères)</span>
                </label>
                <textarea
                  id="meta_description"
                  name="meta_description"
                  value={formData.meta_description}
                  onChange={handleChange}
                  maxLength={160}
                  rows={3}
                  disabled={isLoading}
                  className="w-full border border-black/20 px-3 py-2 text-sm focus:outline-none focus:border-black transition-colors disabled:opacity-50 resize-none"
                  placeholder="Description courte qui apparaîtra dans les résultats Google..."
                />
                <p className="text-xs text-gray-400 mt-1">
                  {formData.meta_description.length}/160 caractères
                </p>
              </div>

              {/* SEO Keywords */}
              <div>
                <label htmlFor="seo_keywords" className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                  Mots-clés SEO <span className="normal-case text-gray-400">(séparés par des virgules)</span>
                </label>
                <input
                  type="text"
                  id="seo_keywords"
                  name="seo_keywords"
                  value={formData.seo_keywords}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full border border-black/20 px-3 py-2 text-sm focus:outline-none focus:border-black transition-colors disabled:opacity-50"
                  placeholder="parfum niche, oud, boisé, luxe..."
                />
                <p className="text-xs text-gray-400 mt-1">
                  Pour référence interne (non affichés sur le site)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Message d'erreur + Boutons - Barre fixe en bas */}
        <div className="border-t border-black/10 bg-white flex-shrink-0">
          {error && (
            <div className="px-4 md:px-8 py-3 md:py-4 bg-red-50 border-b border-red-200">
              <p className="text-xs md:text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="px-4 md:px-8 py-4 md:py-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 max-w-md sm:ml-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 md:px-6 py-2.5 md:py-3 border border-black/20 uppercase tracking-wider text-xs md:text-sm hover:bg-black/5 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-black text-white px-4 md:px-6 py-2.5 md:py-3 uppercase tracking-wider text-xs md:text-sm hover:bg-black/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoading ? "Enregistrement..." : isEditMode ? "Enregistrer" : "Créer"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </Drawer>
  );
}
