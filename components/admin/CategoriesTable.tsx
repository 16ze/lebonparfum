"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import Image from "next/image";
import CategoryModal from "./CategoryModal";
import { deleteCategory } from "@/app/admin/categories/actions";
import { useRouter } from "next/navigation";

/**
 * CategoriesTable - Tableau interactif des catégories (Client Component)
 *
 * Design Byredo :
 * - Tableau minimaliste noir et blanc
 * - Actions : Ajouter, Éditer, Supprimer
 * - Modal pour création/édition
 */

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  created_at?: string;
}

interface CategoriesTableProps {
  categories: Category[];
}

export default function CategoriesTable({ categories }: CategoriesTableProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Ouvrir modal en mode création
  const handleAdd = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  // Ouvrir modal en mode édition
  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  // Supprimer une catégorie avec confirmation
  const handleDelete = async (category: Category) => {
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer la catégorie "${category.name}" ?\n\nCette action est irréversible.`
    );

    if (!confirmed) return;

    setIsDeleting(category.id);

    try {
      const result = await deleteCategory(category.id);

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
            Catégories
          </h1>
          <p className="text-xs md:text-sm text-gray-500 uppercase tracking-wider">
            {categories.length} catégorie(s)
          </p>
        </div>

        <button
          onClick={handleAdd}
          className="bg-black text-white px-4 md:px-6 py-2 md:py-3 uppercase tracking-wider text-xs md:text-sm hover:bg-black/80 transition-colors flex items-center justify-center gap-2 w-full md:w-auto"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          <span className="hidden sm:inline">Nouvelle catégorie</span>
          <span className="sm:hidden">Ajouter</span>
        </button>
      </div>

      {/* Tableau */}
      {categories.length === 0 ? (
        <div className="border border-black/10 p-12 text-center">
          <p className="text-sm uppercase tracking-wider text-gray-400 mb-4">
            Aucune catégorie
          </p>
          <button
            onClick={handleAdd}
            className="text-xs uppercase tracking-widest underline hover:no-underline"
          >
            Créer la première catégorie
          </button>
        </div>
      ) : (
        <div className="border border-black/10 overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-black/10 bg-gray-50">
                  <th className="text-left py-4 px-6 text-xs uppercase tracking-widest font-medium text-gray-600">
                    Image
                  </th>
                  <th className="text-left py-4 px-6 text-xs uppercase tracking-widest font-medium text-gray-600">
                    Nom
                  </th>
                  <th className="text-left py-4 px-6 text-xs uppercase tracking-widest font-medium text-gray-600">
                    Slug
                  </th>
                  <th className="text-left py-4 px-6 text-xs uppercase tracking-widest font-medium text-gray-600">
                    Description
                  </th>
                  <th className="text-right py-4 px-6 text-xs uppercase tracking-widest font-medium text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr
                    key={category.id}
                    className="border-b border-black/5 hover:bg-gray-50/50 transition-colors"
                  >
                    {/* Image */}
                    <td className="py-4 px-6">
                      {category.image_url ? (
                        <div className="relative w-16 h-16 bg-gray-100 rounded-sm overflow-hidden">
                          <Image
                            src={category.image_url}
                            alt={category.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-sm flex items-center justify-center">
                          <span className="text-xs text-gray-400">—</span>
                        </div>
                      )}
                    </td>

                    {/* Nom */}
                    <td className="py-4 px-6">
                      <span className="font-medium text-sm">{category.name}</span>
                    </td>

                    {/* Slug */}
                    <td className="py-4 px-6">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-600">
                        {category.slug}
                      </code>
                    </td>

                    {/* Description */}
                    <td className="py-4 px-6">
                      <p className="text-xs text-gray-600 line-clamp-2 max-w-xs">
                        {category.description || "—"}
                      </p>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-2 hover:bg-black hover:text-white transition-colors rounded-sm border border-black/10"
                          title="Éditer"
                        >
                          <Edit2 className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={() => handleDelete(category)}
                          disabled={isDeleting === category.id}
                          className="p-2 hover:bg-red-600 hover:text-white transition-colors rounded-sm border border-black/10 disabled:opacity-50"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-black/10">
            {categories.map((category) => (
              <div key={category.id} className="p-4">
                <div className="flex gap-4">
                  {/* Image */}
                  {category.image_url ? (
                    <div className="relative w-20 h-20 bg-gray-100 rounded-sm overflow-hidden flex-shrink-0">
                      <Image
                        src={category.image_url}
                        alt={category.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 rounded-sm flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-gray-400">—</span>
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm mb-1">{category.name}</h3>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-600 inline-block mb-2">
                      {category.slug}
                    </code>
                    {category.description && (
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4">
                  <button
                    onClick={() => handleEdit(category)}
                    className="flex-1 py-2 text-xs uppercase tracking-wider border border-black/10 hover:bg-black hover:text-white transition-colors"
                  >
                    Éditer
                  </button>
                  <button
                    onClick={() => handleDelete(category)}
                    disabled={isDeleting === category.id}
                    className="flex-1 py-2 text-xs uppercase tracking-wider border border-black/10 hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de création/édition */}
      {isModalOpen && (
        <CategoryModal
          category={selectedCategory}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleModalSuccess}
        />
      )}
    </>
  );
}
