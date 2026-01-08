"use client";

import { useState, useMemo } from "react";
import { Plus, Edit2, Trash2, Filter } from "lucide-react";
import Image from "next/image";
import ProductModal from "./ProductModal";
import { deleteProduct } from "@/app/admin/products/actions";
import { useRouter } from "next/navigation";

/**
 * ProductsTable - Tableau interactif des produits (Client Component)
 *
 * Features :
 * - Affichage tableau
 * - Filtrage par marque
 * - Bouton ajouter → ouvre modal
 * - Bouton éditer → ouvre modal avec produit
 * - Bouton supprimer → confirmation + suppression
 */

interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  description: string;
  price: number;
  stock: number;
  image_url?: string | null;
}

interface ProductsTableProps {
  products: Product[];
}

export default function ProductsTable({ products }: ProductsTableProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string>("all");

  // Extraire toutes les marques uniques
  const brands = useMemo(() => {
    const uniqueBrands = new Set(products.map((p) => p.brand));
    return Array.from(uniqueBrands).sort();
  }, [products]);

  // Filtrer les produits par marque
  const filteredProducts = useMemo(() => {
    if (selectedBrand === "all") return products;
    return products.filter((p) => p.brand === selectedBrand);
  }, [products, selectedBrand]);

  // Ouvrir modal en mode création
  const handleAdd = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  // Ouvrir modal en mode édition
  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // Supprimer un produit avec confirmation
  const handleDelete = async (product: Product) => {
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer "${product.name}" ?\n\nCette action est irréversible.`
    );

    if (!confirmed) return;

    setIsDeleting(product.id);

    try {
      const result = await deleteProduct(product.id);

      if (!result.success) {
        alert(`Erreur: ${result.error}`);
        setIsDeleting(null);
        return;
      }

      // Rafraîchir la page
      router.refresh();
    } catch (error) {
      console.error("❌ Erreur suppression:", error);
      alert("Erreur lors de la suppression");
      setIsDeleting(null);
    }
  };

  // Callback après succès du modal
  const handleModalSuccess = () => {
    router.refresh();
  };

  return (
    <>
      {/* Header avec titre + bouton ajouter */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl uppercase tracking-widest font-bold mb-1 md:mb-2">
            Produits
          </h1>
          <p className="text-xs md:text-sm text-gray-500 uppercase tracking-wider">
            {filteredProducts.length} / {products.length} produit(s)
          </p>
        </div>

        <button
          onClick={handleAdd}
          className="bg-black text-white px-4 md:px-6 py-2 md:py-3 uppercase tracking-wider text-xs md:text-sm hover:bg-black/80 transition-colors flex items-center justify-center gap-2 w-full md:w-auto"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          <span className="hidden sm:inline">Ajouter un produit</span>
          <span className="sm:hidden">Ajouter</span>
        </button>
      </div>

      {/* Barre de filtres */}
      {products.length > 0 && (
        <div className="mb-4 md:mb-6 border border-black/10 p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
            <div className="flex items-center gap-2 md:gap-4">
              <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" strokeWidth={1.5} />
              <span className="text-xs uppercase tracking-widest text-gray-500 font-medium whitespace-nowrap">
                Filtrer par marque :
              </span>
            </div>

            {/* Scroll horizontal sur mobile, flex-wrap sur desktop */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 md:flex-wrap scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
              {/* Bouton "Toutes" */}
              <button
                onClick={() => setSelectedBrand("all")}
                className={`px-3 md:px-4 py-1.5 md:py-2 text-xs uppercase tracking-wider transition-colors border whitespace-nowrap flex-shrink-0 ${
                  selectedBrand === "all"
                    ? "bg-black text-white border-black"
                    : "bg-white text-black border-black/20 hover:border-black"
                }`}
              >
                Toutes ({products.length})
              </button>

              {/* Boutons par marque */}
              {brands.map((brand) => {
                const count = products.filter((p) => p.brand === brand).length;
                return (
                  <button
                    key={brand}
                    onClick={() => setSelectedBrand(brand)}
                    className={`px-3 md:px-4 py-1.5 md:py-2 text-xs uppercase tracking-wider transition-colors border whitespace-nowrap flex-shrink-0 ${
                      selectedBrand === brand
                        ? "bg-black text-white border-black"
                        : "bg-white text-black border-black/20 hover:border-black"
                    }`}
                  >
                    {brand} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tableau des produits */}
      {filteredProducts.length === 0 ? (
        <div className="border border-black/10 p-8 md:p-12 text-center">
          <p className="text-xs md:text-sm text-gray-400 uppercase tracking-wider mb-4">
            Aucun produit
          </p>
          <button
            onClick={handleAdd}
            className="text-xs uppercase tracking-widest text-black hover:underline"
          >
            Créer votre premier produit →
          </button>
        </div>
      ) : (
        <>
          {/* Desktop : Tableau */}
          <div className="hidden md:block border border-black/10 overflow-hidden">
            <table className="w-full">
              <thead className="bg-black/5 border-b border-black/10">
                <tr>
                  <th className="text-left px-4 lg:px-6 py-3 lg:py-4 text-xs uppercase tracking-widest text-gray-500 font-medium">
                    Image
                  </th>
                  <th className="text-left px-4 lg:px-6 py-3 lg:py-4 text-xs uppercase tracking-widest text-gray-500 font-medium">
                    Nom
                  </th>
                  <th className="text-left px-4 lg:px-6 py-3 lg:py-4 text-xs uppercase tracking-widest text-gray-500 font-medium">
                    Marque
                  </th>
                  <th className="text-left px-4 lg:px-6 py-3 lg:py-4 text-xs uppercase tracking-widest text-gray-500 font-medium">
                    Prix
                  </th>
                  <th className="text-left px-4 lg:px-6 py-3 lg:py-4 text-xs uppercase tracking-widest text-gray-500 font-medium">
                    Stock
                  </th>
                  <th className="text-right px-4 lg:px-6 py-3 lg:py-4 text-xs uppercase tracking-widest text-gray-500 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-black/5 hover:bg-black/[0.02] transition-colors"
                  >
                    {/* Image */}
                    <td className="px-4 lg:px-6 py-3 lg:py-4">
                      <div className="relative w-12 h-12 lg:w-16 lg:h-16 bg-gray-100 border border-black/10">
                        {product.image_url ? (
                          <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 48px, 64px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px] lg:text-xs">
                            N/A
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Nom */}
                    <td className="px-4 lg:px-6 py-3 lg:py-4">
                      <p className="text-xs lg:text-sm font-medium">{product.name}</p>
                      <p className="text-[10px] lg:text-xs text-gray-400 mt-0.5 lg:mt-1">
                        {product.slug}
                      </p>
                    </td>

                    {/* Marque */}
                    <td className="px-4 lg:px-6 py-3 lg:py-4">
                      <p className="text-xs lg:text-sm uppercase tracking-wide text-gray-600">
                        {product.brand}
                      </p>
                    </td>

                    {/* Prix */}
                    <td className="px-4 lg:px-6 py-3 lg:py-4">
                      <p className="text-xs lg:text-sm font-medium">
                        {new Intl.NumberFormat("fr-FR", {
                          style: "currency",
                          currency: "EUR",
                        }).format(product.price / 100)}
                      </p>
                    </td>

                    {/* Stock */}
                    <td className="px-4 lg:px-6 py-3 lg:py-4">
                      <span
                        className={`inline-block px-2 lg:px-3 py-0.5 lg:py-1 text-[10px] lg:text-xs uppercase tracking-wider ${
                          product.stock > 10
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : product.stock > 0
                            ? "bg-orange-50 text-orange-700 border border-orange-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 lg:px-6 py-3 lg:py-4">
                      <div className="flex items-center justify-end gap-1.5 lg:gap-2">
                        {/* Bouton Éditer */}
                        <button
                          onClick={() => handleEdit(product)}
                          disabled={isDeleting === product.id}
                          className="p-1.5 lg:p-2 hover:bg-black/5 transition-colors border border-black/10 disabled:opacity-50"
                          aria-label="Éditer"
                        >
                          <Edit2
                            className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-gray-600"
                            strokeWidth={1.5}
                          />
                        </button>

                        {/* Bouton Supprimer */}
                        <button
                          onClick={() => handleDelete(product)}
                          disabled={isDeleting === product.id}
                          className="p-1.5 lg:p-2 hover:bg-red-50 transition-colors border border-black/10 hover:border-red-200 disabled:opacity-50"
                          aria-label="Supprimer"
                        >
                          <Trash2
                            className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-gray-600 hover:text-red-600"
                            strokeWidth={1.5}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile : Cartes */}
          <div className="md:hidden space-y-3">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="border border-black/10 bg-white p-4 space-y-3"
              >
                {/* En-tête : Image + Nom + Actions */}
                <div className="flex items-start gap-3">
                  {/* Image */}
                  <div className="relative w-20 h-20 bg-gray-100 border border-black/10 flex-shrink-0">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                        N/A
                      </div>
                    )}
                  </div>

                  {/* Nom + Marque */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium mb-1 truncate">{product.name}</h3>
                    <p className="text-xs text-gray-400 mb-1 truncate">
                      {product.slug}
                    </p>
                    <p className="text-xs uppercase tracking-wide text-gray-600">
                      {product.brand}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-start gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(product)}
                      disabled={isDeleting === product.id}
                      className="p-2 hover:bg-black/5 transition-colors border border-black/10 disabled:opacity-50"
                      aria-label="Éditer"
                    >
                      <Edit2
                        className="w-4 h-4 text-gray-600"
                        strokeWidth={1.5}
                      />
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      disabled={isDeleting === product.id}
                      className="p-2 hover:bg-red-50 transition-colors border border-black/10 hover:border-red-200 disabled:opacity-50"
                      aria-label="Supprimer"
                    >
                      <Trash2
                        className="w-4 h-4 text-gray-600 hover:text-red-600"
                        strokeWidth={1.5}
                      />
                    </button>
                  </div>
                </div>

                {/* Informations : Prix + Stock */}
                <div className="flex items-center justify-between pt-2 border-t border-black/5">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-0.5">
                      Prix
                    </p>
                    <p className="text-sm font-medium">
                      {new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                      }).format(product.price / 100)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-0.5">
                      Stock
                    </p>
                    <span
                      className={`inline-block px-2 py-1 text-xs uppercase tracking-wider ${
                        product.stock > 10
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : product.stock > 0
                          ? "bg-orange-50 text-orange-700 border border-orange-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      {product.stock}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal CRUD */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
        onSuccess={handleModalSuccess}
      />
    </>
  );
}
