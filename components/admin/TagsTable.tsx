"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import TagModal from "./TagModal";
import { deleteTag } from "@/app/admin/tags/actions";
import { useRouter } from "next/navigation";

/**
 * TagsTable - Tableau interactif des tags (Client Component)
 *
 * Design Byredo :
 * - Interface simple et épurée
 * - Tags = juste Nom + Slug
 * - Ajout/Édition via modal inline
 */

interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at?: string;
}

interface TagsTableProps {
  tags: Tag[];
}

export default function TagsTable({ tags }: TagsTableProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Ouvrir modal en mode création
  const handleAdd = () => {
    setSelectedTag(null);
    setIsModalOpen(true);
  };

  // Ouvrir modal en mode édition
  const handleEdit = (tag: Tag) => {
    setSelectedTag(tag);
    setIsModalOpen(true);
  };

  // Supprimer un tag avec confirmation
  const handleDelete = async (tag: Tag) => {
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer le tag "${tag.name}" ?\n\nCette action est irréversible.`
    );

    if (!confirmed) return;

    setIsDeleting(tag.id);

    try {
      const result = await deleteTag(tag.id);

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
            Tags
          </h1>
          <p className="text-xs md:text-sm text-gray-500 uppercase tracking-wider">
            {tags.length} tag(s)
          </p>
        </div>

        <button
          onClick={handleAdd}
          className="bg-black text-white px-4 md:px-6 py-2 md:py-3 uppercase tracking-wider text-xs md:text-sm hover:bg-black/80 transition-colors flex items-center justify-center gap-2 w-full md:w-auto"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          <span className="hidden sm:inline">Nouveau tag</span>
          <span className="sm:hidden">Ajouter</span>
        </button>
      </div>

      {/* Liste des tags */}
      {tags.length === 0 ? (
        <div className="border border-black/10 p-12 text-center">
          <p className="text-sm uppercase tracking-wider text-gray-400 mb-4">
            Aucun tag
          </p>
          <button
            onClick={handleAdd}
            className="text-xs uppercase tracking-widest underline hover:no-underline"
          >
            Créer le premier tag
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
                    Nom
                  </th>
                  <th className="text-left py-4 px-6 text-xs uppercase tracking-widest font-medium text-gray-600">
                    Slug
                  </th>
                  <th className="text-right py-4 px-6 text-xs uppercase tracking-widest font-medium text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {tags.map((tag) => (
                  <tr
                    key={tag.id}
                    className="border-b border-black/5 hover:bg-gray-50/50 transition-colors"
                  >
                    {/* Nom */}
                    <td className="py-4 px-6">
                      <span className="font-medium text-sm">{tag.name}</span>
                    </td>

                    {/* Slug */}
                    <td className="py-4 px-6">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-600">
                        {tag.slug}
                      </code>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(tag)}
                          className="p-2 hover:bg-black hover:text-white transition-colors rounded-sm border border-black/10"
                          title="Éditer"
                        >
                          <Edit2 className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={() => handleDelete(tag)}
                          disabled={isDeleting === tag.id}
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
            {tags.map((tag) => (
              <div key={tag.id} className="p-4">
                <div className="mb-3">
                  <h3 className="font-medium text-sm mb-1">{tag.name}</h3>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-600">
                    {tag.slug}
                  </code>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(tag)}
                    className="flex-1 py-2 text-xs uppercase tracking-wider border border-black/10 hover:bg-black hover:text-white transition-colors"
                  >
                    Éditer
                  </button>
                  <button
                    onClick={() => handleDelete(tag)}
                    disabled={isDeleting === tag.id}
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
        <TagModal
          tag={selectedTag}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleModalSuccess}
        />
      )}
    </>
  );
}
