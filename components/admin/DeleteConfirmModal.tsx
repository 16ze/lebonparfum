"use client";

import { X, AlertTriangle, Loader2 } from "lucide-react";
import { useState } from "react";

/**
 * DeleteConfirmModal - Confirmation suppression
 *
 * Design Byredo : Modal simple avec warning
 */

type DeleteConfirmModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  productName: string;
};

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  productName,
}: DeleteConfirmModalProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Erreur suppression:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md border border-black/10 p-8">
        {/* Icône Warning */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 border-2 border-red-500 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-500" strokeWidth={2} />
          </div>
        </div>

        {/* Titre */}
        <h2 className="text-xl uppercase tracking-widest font-bold text-center mb-4">
          Supprimer ce produit ?
        </h2>

        {/* Message */}
        <p className="text-sm text-center text-gray-600 mb-2">
          Vous êtes sur le point de supprimer :
        </p>
        <p className="text-sm text-center font-medium mb-6">"{productName}"</p>

        <p className="text-xs text-center text-red-600 uppercase tracking-wider mb-8">
          Cette action est irréversible
        </p>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-6 py-3 text-sm uppercase tracking-wider text-gray-600 border border-black/10 hover:bg-black/5 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 bg-red-600 text-white px-6 py-3 text-sm uppercase tracking-wider hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Suppression...
              </>
            ) : (
              "Supprimer"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

