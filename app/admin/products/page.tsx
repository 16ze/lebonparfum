"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import Image from "next/image";
import ProductModal from "@/components/admin/ProductModal";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";

/**
 * Page Admin - Gestion des produits
 *
 * Affiche :
 * - Tableau de tous les produits (image, nom, prix, stock, actions)
 * - Bouton "Ajouter un produit"
 * - Actions : Éditer, Supprimer
 *
 * Design Byredo : Tableau minimal avec bordures fines
 */

type Product = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  price: number;
  stock: number;
  description?: string;
  notes_top?: string;
  notes_heart?: string;
  notes_base?: string;
  category?: string;
  image_url?: string;
  created_at: string;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // États Modal
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // États Delete Confirm
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Charger les produits
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Erreur chargement produits:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Ouvrir modal création
  const handleCreateClick = () => {
    setSelectedProduct(null);
    setModalMode("create");
  };

  // Ouvrir modal édition
  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setModalMode("edit");
  };

  // Ouvrir modal suppression
  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  // Confirmer la suppression
  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      const res = await fetch(`/api/admin/products/${productToDelete.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // Recharger la liste
        fetchProducts();
      } else {
        const error = await res.json();
        alert(`Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error("Erreur suppression:", error);
      alert("Erreur lors de la suppression");
    }
  };

  // Callback succès du modal
  const handleModalSuccess = () => {
    setModalMode(null);
    fetchProducts(); // Recharger la liste
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-gray-400 uppercase tracking-wider">
          Chargement...
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header avec titre + bouton ajouter */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl uppercase tracking-widest font-bold mb-2">
            Produits
          </h1>
          <p className="text-sm text-gray-500 uppercase tracking-wider">
            {products.length} produit(s) au total
          </p>
        </div>

        <button
          onClick={handleCreateClick}
          className="bg-black text-white px-6 py-3 uppercase tracking-wider text-sm hover:bg-black/80 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          Ajouter un produit
        </button>
      </div>

      {/* Tableau des produits */}
      {products.length === 0 ? (
        <div className="border border-black/10 p-12 text-center">
          <p className="text-sm text-gray-400 uppercase tracking-wider">
            Aucun produit
          </p>
        </div>
      ) : (
        <div className="border border-black/10 overflow-hidden">
          <table className="w-full">
            <thead className="bg-black/5 border-b border-black/10">
              <tr>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-gray-500 font-medium">
                  Image
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-gray-500 font-medium">
                  Nom
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-gray-500 font-medium">
                  Marque
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-gray-500 font-medium">
                  Prix
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-gray-500 font-medium">
                  Stock
                </th>
                <th className="text-right px-6 py-4 text-xs uppercase tracking-widest text-gray-500 font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-black/5 hover:bg-black/[0.02] transition-colors"
                >
                  {/* Image */}
                  <td className="px-6 py-4">
                    <div className="relative w-16 h-16 bg-gray-100 border border-black/10">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                          N/A
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Nom */}
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {product.slug}
                    </p>
                  </td>

                  {/* Marque */}
                  <td className="px-6 py-4">
                    <p className="text-sm uppercase tracking-wide text-gray-600">
                      {product.brand}
                    </p>
                  </td>

                  {/* Prix */}
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium">
                      {new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                      }).format(product.price / 100)}
                    </p>
                  </td>

                  {/* Stock */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 text-xs uppercase tracking-wider ${
                        product.stock > 10
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : product.stock > 0
                          ? "bg-orange-50 text-orange-700 border border-orange-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      {product.stock} unités
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {/* Bouton Éditer */}
                      <button
                        onClick={() => handleEditClick(product)}
                        className="p-2 hover:bg-black/5 transition-colors border border-black/10"
                      >
                        <Edit2
                          className="w-4 h-4 text-gray-600"
                          strokeWidth={1.5}
                        />
                      </button>

                      {/* Bouton Supprimer */}
                      <button
                        onClick={() => handleDeleteClick(product)}
                        className="p-2 hover:bg-red-50 transition-colors border border-black/10 hover:border-red-200"
                      >
                        <Trash2
                          className="w-4 h-4 text-gray-600 hover:text-red-600"
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
      )}

      {/* Modal Produit (Création / Édition) */}
      <ProductModal
        mode={modalMode}
        product={selectedProduct}
        onClose={() => setModalMode(null)}
        onSuccess={handleModalSuccess}
      />

      {/* Modal Confirmation Suppression */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        productName={productToDelete?.name || ""}
      />
    </div>
  );
}
