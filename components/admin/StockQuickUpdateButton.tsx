"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProductStock } from "@/app/admin/stock-alerts/actions";
import { Plus, Loader2 } from "lucide-react";

/**
 * StockQuickUpdateButton - Boutons d'action rapide pour modifier le stock
 *
 * Permet de réapprovisionner rapidement un produit:
 * - +5 unités
 * - +10 unités
 * - Custom (input manuel)
 *
 * Style Byredo: Boutons minimalistes avec bordures noires
 */

interface StockQuickUpdateButtonProps {
  productId: string;
  currentStock: number;
}

export default function StockQuickUpdateButton({
  productId,
  currentStock,
}: StockQuickUpdateButtonProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const [error, setError] = useState("");

  /**
   * handleQuickUpdate - Ajoute X unités au stock actuel
   */
  const handleQuickUpdate = async (increment: number) => {
    setIsUpdating(true);
    setError("");

    try {
      const newStock = currentStock + increment;
      const result = await updateProductStock(productId, newStock);

      if (result.success) {
        router.refresh(); // Rafraîchir la page pour mettre à jour les données
      } else {
        setError(result.error || "Erreur lors de la mise à jour");
      }
    } catch (err) {
      console.error("Erreur update stock:", err);
      setError("Erreur serveur");
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * handleCustomUpdate - Définit un stock personnalisé
   */
  const handleCustomUpdate = async () => {
    const value = parseInt(customValue, 10);

    if (isNaN(value) || value < 0) {
      setError("Valeur invalide (min: 0)");
      return;
    }

    setIsUpdating(true);
    setError("");

    try {
      const result = await updateProductStock(productId, value);

      if (result.success) {
        setShowCustomInput(false);
        setCustomValue("");
        router.refresh();
      } else {
        setError(result.error || "Erreur lors de la mise à jour");
      }
    } catch (err) {
      console.error("Erreur update stock:", err);
      setError("Erreur serveur");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-2">
      {/* Boutons rapides */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleQuickUpdate(5)}
          disabled={isUpdating}
          className="flex items-center gap-1 px-3 py-1.5 text-[10px] uppercase tracking-wider font-medium border border-black hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUpdating ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Plus size={12} strokeWidth={2} />
          )}
          +5
        </button>

        <button
          onClick={() => handleQuickUpdate(10)}
          disabled={isUpdating}
          className="flex items-center gap-1 px-3 py-1.5 text-[10px] uppercase tracking-wider font-medium border border-black hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUpdating ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Plus size={12} strokeWidth={2} />
          )}
          +10
        </button>

        <button
          onClick={() => setShowCustomInput(!showCustomInput)}
          disabled={isUpdating}
          className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-medium border border-black hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Custom
        </button>
      </div>

      {/* Input custom */}
      {showCustomInput && (
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            placeholder="Ex: 20"
            className="w-20 px-2 py-1 text-xs border border-black focus:outline-none focus:ring-1 focus:ring-black"
          />
          <button
            onClick={handleCustomUpdate}
            disabled={isUpdating || !customValue}
            className="px-3 py-1 text-[10px] uppercase tracking-wider font-medium bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              "OK"
            )}
          </button>
          <button
            onClick={() => {
              setShowCustomInput(false);
              setCustomValue("");
              setError("");
            }}
            className="px-3 py-1 text-[10px] uppercase tracking-wider font-medium border border-black hover:bg-gray-100 transition-colors"
          >
            Annuler
          </button>
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <p className="text-xs text-red-600 uppercase tracking-wider">{error}</p>
      )}
    </div>
  );
}
