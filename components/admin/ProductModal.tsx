"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader2, ChevronDown, ChevronUp, Check, AlertCircle, Package, Tag, Settings, Search } from "lucide-react";
import Drawer from "@/components/ui/Drawer";
import ImageUpload from "./ImageUpload";
import { createProduct, updateProduct } from "@/app/admin/products/actions";
import { createClient } from "@/utils/supabase/client";
import { generateSlug } from "@/lib/validation";

interface ProductVariant {
  label: string;
  price: number; // En centimes
  stock: number;
}

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
  variants?: ProductVariant[] | null;
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
  
  // État pour les variantes
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [useVariants, setUseVariants] = useState(false);

  // État pour les sections collapsibles
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    categories: true,
    pricing: true,
    variants: false,
    seo: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Calculer la progression du formulaire
  const formProgress = useMemo(() => {
    let completed = 0;
    let total = 5; // Champs obligatoires : name, slug, brand, price, stock

    if (formData.name.trim()) completed++;
    if (formData.slug.trim()) completed++;
    if (formData.brand.trim()) completed++;
    if (formData.price && parseFloat(formData.price) > 0) completed++;
    if (formData.stock && parseInt(formData.stock) >= 0) completed++;

    // Bonus pour champs optionnels
    if (formData.description.trim()) { completed += 0.5; total += 0.5; }
    if (imageFile || product?.image_url) { completed += 0.5; total += 0.5; }
    if (selectedCategoryIds.length > 0) { completed += 0.5; total += 0.5; }

    return Math.round((completed / total) * 100);
  }, [formData, imageFile, product?.image_url, selectedCategoryIds]);

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
      setVariants([]);
      setUseVariants(false);
    }
    
    // Charger les variantes si elles existent
    if (isEditMode && product && product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
      setVariants(product.variants);
      setUseVariants(true);
    } else if (isEditMode && product) {
      setVariants([]);
      setUseVariants(false);
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
    // Effacer l'erreur quand l'utilisateur modifie le nom
    if (error) {
      setError(null);
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
    // Effacer l'erreur quand l'utilisateur modifie un champ
    if (error) {
      setError(null);
    }
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

  // Fonctions pour gérer les variantes
  const addVariant = () => {
    setVariants([...variants, { label: "50ml", price: 0, stock: 0 }]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: string | number) => {
    const updated = [...variants];
    if (field === "price") {
      updated[index] = { ...updated[index], price: Math.round(Number(value) * 100) }; // Convertir en centimes
    } else if (field === "stock") {
      updated[index] = { ...updated[index], stock: Number(value) };
    } else if (field === "label") {
      updated[index] = { ...updated[index], label: String(value) };
    }
    setVariants(updated);
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

      // Préparer les variantes (si activées)
      const variantsData = useVariants && variants.length > 0 
        ? variants.filter(v => v.label.trim() && v.price > 0) // Filtrer les variantes vides
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
        variants: variantsData,
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

  // Composant Section collapsible
  const Section = ({
    id,
    title,
    icon: Icon,
    children,
    defaultOpen = true,
    badge,
  }: {
    id: keyof typeof expandedSections;
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
    defaultOpen?: boolean;
    badge?: string | number;
  }) => {
    const isExpanded = expandedSections[id];
    return (
      <div className="border-b border-black/10">
        <button
          type="button"
          onClick={() => toggleSection(id)}
          className="w-full px-4 md:px-6 py-4 flex items-center justify-between hover:bg-black/[0.02] transition-colors"
        >
          <div className="flex items-center gap-3">
            <Icon size={16} className="text-gray-400" strokeWidth={1.5} />
            <span className="text-xs uppercase tracking-widest font-medium">{title}</span>
            {badge && (
              <span className="px-2 py-0.5 bg-black text-white text-[10px] uppercase tracking-wider">
                {badge}
              </span>
            )}
          </div>
          {isExpanded ? (
            <ChevronUp size={16} className="text-gray-400" strokeWidth={1.5} />
          ) : (
            <ChevronDown size={16} className="text-gray-400" strokeWidth={1.5} />
          )}
        </button>
        {isExpanded && (
          <div className="px-4 md:px-6 pb-6">
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Modifier le produit" : "Ajouter un produit"}
      subtitle={isEditMode ? product?.name : "Remplissez les informations"}
    >
      <form onSubmit={handleSubmit} className="flex flex-col">
        {/* Barre de progression */}
        <div className="px-4 md:px-6 py-3 border-b border-black/10 bg-gray-50/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-widest text-gray-500">
              Progression
            </span>
            <span className="text-xs font-medium">
              {formProgress}%
            </span>
          </div>
          <div className="h-1 bg-gray-200 overflow-hidden">
            <div
              className="h-full bg-black transition-all duration-300 ease-out"
              style={{ width: `${formProgress}%` }}
            />
          </div>
        </div>

        {/* Layout 2 colonnes sur desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 flex-1">
          {/* Colonne gauche : Image + Informations de base */}
          <div className="lg:border-r border-black/10">
            {/* Image */}
            <div className="border-b border-black/10 p-4 md:p-6">
              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-4">
                Image du produit
              </label>
              <div className="flex items-center justify-center">
                <ImageUpload
                  onImageChange={setImageFile}
                  currentImageUrl={product?.image_url}
                  isLoading={isLoading}
                />
              </div>
            </div>

            {/* Section Informations de base */}
            <Section id="basic" title="Informations" icon={Package}>
              <div className="space-y-4">
                {/* Nom */}
                <div>
                  <label htmlFor="name" className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                    Nom du produit <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full border border-black/20 px-3 py-2.5 text-sm focus:outline-none focus:border-black transition-colors disabled:opacity-50"
                    placeholder="Ex: Bal d'Afrique"
                  />
                </div>

                {/* Slug */}
                <div>
                  <div className="flex items-end justify-between gap-2 mb-2">
                    <label htmlFor="slug" className="block text-xs uppercase tracking-widest text-gray-500">
                      Slug (URL) <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateSlug}
                      disabled={isLoading || !formData.name}
                      className="text-[10px] text-gray-500 hover:text-black underline disabled:opacity-50 disabled:no-underline uppercase tracking-wider"
                    >
                      Régénérer
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
                    className="w-full border border-black/20 px-3 py-2.5 text-sm focus:outline-none focus:border-black transition-colors disabled:opacity-50 font-mono"
                    placeholder="bal-d-afrique"
                  />
                </div>

                {/* Marque */}
                <div>
                  <label htmlFor="brand" className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                    Marque <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="w-full border border-black/20 px-3 py-2.5 text-sm focus:outline-none focus:border-black transition-colors disabled:opacity-50"
                    placeholder="Ex: Byredo"
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    disabled={isLoading}
                    rows={4}
                    className="w-full border border-black/20 p-3 text-sm focus:outline-none focus:border-black transition-colors disabled:opacity-50 resize-none"
                    placeholder="Description du produit..."
                  />
                </div>

                {/* Statut */}
                <div>
                  <label htmlFor="status" className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                    Statut <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    {[
                      { value: "draft", label: "Brouillon", color: "bg-orange-100 text-orange-700 border-orange-200" },
                      { value: "published", label: "Publié", color: "bg-green-100 text-green-700 border-green-200" },
                      { value: "archived", label: "Archivé", color: "bg-gray-100 text-gray-700 border-gray-200" },
                    ].map((status) => (
                      <button
                        key={status.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, status: status.value }))}
                        disabled={isLoading}
                        className={`flex-1 px-3 py-2 text-xs uppercase tracking-wider border transition-colors disabled:opacity-50 ${
                          formData.status === status.value
                            ? status.color
                            : "bg-white text-gray-500 border-black/20 hover:border-black/40"
                        }`}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Section>

            {/* Section Catégories & Tags */}
            <Section
              id="categories"
              title="Catégories & Tags"
              icon={Tag}
              badge={selectedCategoryIds.length + selectedTagIds.length || undefined}
            >
              <div className="space-y-4">
                {/* Catégories */}
                <div>
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
                          className={`px-3 py-1.5 text-xs uppercase tracking-wider border transition-colors disabled:opacity-50 flex items-center gap-1.5 ${
                            selectedCategoryIds.includes(category.id)
                              ? "bg-black text-white border-black"
                              : "bg-white text-black border-black/20 hover:border-black"
                          }`}
                        >
                          {selectedCategoryIds.includes(category.id) && <Check size={12} strokeWidth={2} />}
                          {category.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div>
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
                          className={`px-3 py-1.5 text-xs uppercase tracking-wider border transition-colors disabled:opacity-50 flex items-center gap-1.5 ${
                            selectedTagIds.includes(tag.id)
                              ? "bg-black text-white border-black"
                              : "bg-white text-black border-black/20 hover:border-black"
                          }`}
                        >
                          {selectedTagIds.includes(tag.id) && <Check size={12} strokeWidth={2} />}
                          {tag.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Section>
          </div>

          {/* Colonne droite : Prix, Stock, Variantes, SEO */}
          <div className="flex flex-col">
            {/* Section Prix & Stock */}
            <Section id="pricing" title="Prix & Stock" icon={Settings}>
              <div className="space-y-4">
                {/* Prix */}
                <div>
                  <label htmlFor="price" className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                    Prix (€) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
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
                      className="w-full border border-black/20 px-3 py-2.5 text-sm focus:outline-none focus:border-black transition-colors disabled:opacity-50 pr-12"
                      placeholder="195.00"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
                  </div>
                </div>

                {/* Stock */}
                <div>
                  <label htmlFor="stock" className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                    Stock <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    required={!useVariants}
                    min="0"
                    disabled={isLoading || useVariants}
                    className="w-full border border-black/20 px-3 py-2.5 text-sm focus:outline-none focus:border-black transition-colors disabled:opacity-50"
                    placeholder="50"
                  />
                  {useVariants && (
                    <p className="text-xs text-gray-400 mt-1">
                      Stock géré par les variantes
                    </p>
                  )}
                </div>
              </div>
            </Section>

            {/* Section Variantes */}
            <Section
              id="variants"
              title="Variantes (Tailles)"
              icon={Package}
              badge={useVariants && variants.length > 0 ? variants.length : undefined}
            >
              <div className="space-y-4">
                {/* Toggle variantes */}
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={useVariants}
                      onChange={(e) => {
                        setUseVariants(e.target.checked);
                        if (!e.target.checked) {
                          setVariants([]);
                        } else if (variants.length === 0) {
                          const defaultPrice = Math.round(parseFloat(formData.price || "0") * 100);
                          setVariants([{ label: "50ml", price: defaultPrice, stock: parseInt(formData.stock) || 0 }]);
                        }
                      }}
                      disabled={isLoading}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-gray-200 rounded-full peer-checked:bg-black transition-colors" />
                    <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
                  </div>
                  <span className="text-xs text-gray-600 group-hover:text-black transition-colors">
                    Activer les variantes de taille
                  </span>
                </label>

                {useVariants ? (
                  <div className="space-y-3">
                    {variants.map((variant, index) => (
                      <div key={index} className="border border-black/10 p-3 bg-gray-50/50">
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                              Taille
                            </label>
                            <input
                              type="text"
                              value={variant.label}
                              onChange={(e) => updateVariant(index, "label", e.target.value)}
                              disabled={isLoading}
                              className="w-full border border-black/20 px-2 py-1.5 text-xs focus:outline-none focus:border-black transition-colors disabled:opacity-50"
                              placeholder="50ml"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                              Prix (€)
                            </label>
                            <input
                              type="number"
                              value={(variant.price / 100).toFixed(2)}
                              onChange={(e) => updateVariant(index, "price", e.target.value)}
                              disabled={isLoading}
                              step="0.01"
                              min="0"
                              className="w-full border border-black/20 px-2 py-1.5 text-xs focus:outline-none focus:border-black transition-colors disabled:opacity-50"
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                              Stock
                            </label>
                            <div className="flex gap-1">
                              <input
                                type="number"
                                value={variant.stock}
                                onChange={(e) => updateVariant(index, "stock", e.target.value)}
                                disabled={isLoading}
                                min="0"
                                className="flex-1 border border-black/20 px-2 py-1.5 text-xs focus:outline-none focus:border-black transition-colors disabled:opacity-50"
                                placeholder="0"
                              />
                              <button
                                type="button"
                                onClick={() => removeVariant(index)}
                                disabled={isLoading}
                                className="px-2 py-1 text-xs text-red-600 hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-50"
                                aria-label={`Supprimer la variante ${variant.label}`}
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addVariant}
                      disabled={isLoading}
                      className="w-full px-3 py-2.5 text-xs uppercase tracking-wider border border-dashed border-black/30 hover:border-black hover:bg-black/[0.02] transition-colors disabled:opacity-50"
                    >
                      + Ajouter une variante
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">
                    Activez les variantes pour gérer plusieurs tailles avec des prix et stocks différents.
                  </p>
                )}
              </div>
            </Section>

            {/* Section SEO (Référencement) */}
            <Section id="seo" title="Référencement SEO" icon={Search}>
              <div className="space-y-4">
                <p className="text-xs text-gray-500">
                  Optimisez le référencement Google. Si vide, des valeurs seront générées automatiquement.
                </p>

                {/* Meta Title */}
                <div>
                  <label htmlFor="meta_title" className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    id="meta_title"
                    name="meta_title"
                    value={formData.meta_title}
                    onChange={handleChange}
                    maxLength={60}
                    disabled={isLoading}
                    className="w-full border border-black/20 px-3 py-2.5 text-sm focus:outline-none focus:border-black transition-colors disabled:opacity-50"
                    placeholder={`${formData.name || 'Nom du produit'} - ${formData.brand || 'Marque'} | Le Bon Parfum`}
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-gray-400">Titre affiché dans Google</span>
                    <span className={`text-[10px] ${formData.meta_title.length > 55 ? 'text-orange-500' : 'text-gray-400'}`}>
                      {formData.meta_title.length}/60
                    </span>
                  </div>
                </div>

                {/* Meta Description */}
                <div>
                  <label htmlFor="meta_description" className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    id="meta_description"
                    name="meta_description"
                    value={formData.meta_description}
                    onChange={handleChange}
                    maxLength={160}
                    rows={3}
                    disabled={isLoading}
                    className="w-full border border-black/20 px-3 py-2.5 text-sm focus:outline-none focus:border-black transition-colors disabled:opacity-50 resize-none"
                    placeholder="Description courte qui apparaîtra dans les résultats Google..."
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-gray-400">Description affichée dans Google</span>
                    <span className={`text-[10px] ${formData.meta_description.length > 150 ? 'text-orange-500' : 'text-gray-400'}`}>
                      {formData.meta_description.length}/160
                    </span>
                  </div>
                </div>

                {/* SEO Keywords */}
                <div>
                  <label htmlFor="seo_keywords" className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                    Mots-clés
                  </label>
                  <input
                    type="text"
                    id="seo_keywords"
                    name="seo_keywords"
                    value={formData.seo_keywords}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full border border-black/20 px-3 py-2.5 text-sm focus:outline-none focus:border-black transition-colors disabled:opacity-50"
                    placeholder="parfum niche, oud, boisé, luxe..."
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    Séparés par des virgules - Pour référence interne
                  </span>
                </div>
              </div>
            </Section>
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
