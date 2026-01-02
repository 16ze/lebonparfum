"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

/**
 * AddressModal - Modal CRUD pour Adresses
 *
 * Modes :
 * - "create" : Création nouvelle adresse
 * - "edit" : Édition adresse existante
 *
 * Design Byredo : Modal simple
 */

type Address = {
  id?: string;
  name: string;
  line1: string;
  line2?: string;
  city: string;
  postal_code: string;
  country: string;
  phone?: string;
  is_default: boolean;
};

type AddressModalProps = {
  mode: "create" | "edit" | null;
  address?: Address | null;
  onClose: () => void;
  onSuccess: () => void;
};

export default function AddressModal({
  mode,
  address,
  onClose,
  onSuccess,
}: AddressModalProps) {
  const supabase = createClient();

  const [formData, setFormData] = useState<Address>({
    name: "",
    line1: "",
    line2: "",
    city: "",
    postal_code: "",
    country: "France",
    phone: "",
    is_default: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Charger les données de l'adresse en mode édition
  useEffect(() => {
    if (mode === "edit" && address) {
      setFormData(address);
    } else if (mode === "create") {
      setFormData({
        name: "",
        line1: "",
        line2: "",
        city: "",
        postal_code: "",
        country: "France",
        phone: "",
        is_default: false,
      });
    }
  }, [mode, address]);

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Non authentifié");

      if (mode === "create") {
        // Si c'est la première adresse, la définir par défaut
        const { data: existingAddresses } = await supabase
          .from("user_addresses")
          .select("id")
          .eq("user_id", user.id);

        const isFirstAddress = !existingAddresses || existingAddresses.length === 0;

        const { error: insertError } = await supabase
          .from("user_addresses")
          .insert([
            {
              user_id: user.id,
              name: formData.name,
              line1: formData.line1,
              line2: formData.line2,
              city: formData.city,
              postal_code: formData.postal_code,
              country: formData.country,
              phone: formData.phone,
              is_default: isFirstAddress ? true : formData.is_default,
            },
          ]);

        if (insertError) throw insertError;
      } else if (mode === "edit" && address) {
        const { error: updateError } = await supabase
          .from("user_addresses")
          .update({
            name: formData.name,
            line1: formData.line1,
            line2: formData.line2,
            city: formData.city,
            postal_code: formData.postal_code,
            country: formData.country,
            phone: formData.phone,
          })
          .eq("id", address.id);

        if (updateError) throw updateError;
      }

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
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-black/10">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-black/10 px-8 py-6 flex items-center justify-between">
          <h2 className="text-2xl uppercase tracking-widest font-bold">
            {mode === "create" ? "Nouvelle Adresse" : "Éditer Adresse"}
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

          {/* Nom du destinataire */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
              Nom complet *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
              className="w-full px-4 py-3 border border-black/10 focus:outline-none focus:border-black transition-colors"
              placeholder="Jean Dupont"
            />
          </div>

          {/* Adresse ligne 1 */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
              Adresse ligne 1 *
            </label>
            <input
              type="text"
              value={formData.line1}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, line1: e.target.value }))
              }
              required
              className="w-full px-4 py-3 border border-black/10 focus:outline-none focus:border-black transition-colors"
              placeholder="12 Rue de la Paix"
            />
          </div>

          {/* Adresse ligne 2 */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
              Adresse ligne 2
            </label>
            <input
              type="text"
              value={formData.line2}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, line2: e.target.value }))
              }
              className="w-full px-4 py-3 border border-black/10 focus:outline-none focus:border-black transition-colors"
              placeholder="Appartement, étage, etc."
            />
          </div>

          {/* Code postal et Ville */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                Code postal *
              </label>
              <input
                type="text"
                value={formData.postal_code}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    postal_code: e.target.value,
                  }))
                }
                required
                className="w-full px-4 py-3 border border-black/10 focus:outline-none focus:border-black transition-colors"
                placeholder="75001"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                Ville *
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, city: e.target.value }))
                }
                required
                className="w-full px-4 py-3 border border-black/10 focus:outline-none focus:border-black transition-colors"
                placeholder="Paris"
              />
            </div>
          </div>

          {/* Pays */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
              Pays *
            </label>
            <select
              value={formData.country}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, country: e.target.value }))
              }
              required
              className="w-full px-4 py-3 border border-black/10 focus:outline-none focus:border-black transition-colors"
            >
              <option value="France">France</option>
              <option value="Belgique">Belgique</option>
              <option value="Suisse">Suisse</option>
              <option value="Luxembourg">Luxembourg</option>
            </select>
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
              Téléphone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              className="w-full px-4 py-3 border border-black/10 focus:outline-none focus:border-black transition-colors"
              placeholder="+33 6 12 34 56 78"
            />
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
                "Créer l'adresse"
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

