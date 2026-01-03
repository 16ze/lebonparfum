"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { createAddressAction, updateAddressAction } from "@/app/account/actions";

/**
 * AddressModal - Modal de formulaire d'adresse
 *
 * Design Byredo :
 * - Modal full-screen avec overlay
 * - Formulaire avec validation
 * - Toggle "Adresse par défaut"
 */

interface Address {
  id: string;
  label: string;
  first_name: string;
  last_name: string;
  address: string;
  address_complement: string | null;
  city: string;
  postal_code: string;
  country: string;
  phone: string | null;
  is_default: boolean;
}

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: Address | null; // null = création, non-null = édition
}

export default function AddressModal({
  isOpen,
  onClose,
  address,
}: AddressModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    label: "",
    first_name: "",
    last_name: "",
    address: "",
    address_complement: "",
    city: "",
    postal_code: "",
    country: "France",
    phone: "",
    is_default: false,
  });

  // Remplir le formulaire en mode édition
  useEffect(() => {
    if (address) {
      setFormData({
        label: address.label,
        first_name: address.first_name,
        last_name: address.last_name,
        address: address.address,
        address_complement: address.address_complement || "",
        city: address.city,
        postal_code: address.postal_code,
        country: address.country,
        phone: address.phone || "",
        is_default: address.is_default,
      });
    } else {
      // Reset en mode création
      setFormData({
        label: "",
        first_name: "",
        last_name: "",
        address: "",
        address_complement: "",
        city: "",
        postal_code: "",
        country: "France",
        phone: "",
        is_default: false,
      });
    }
    setError(null);
  }, [address, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let result;

      if (address) {
        // Mode édition
        result = await updateAddressAction(address.id, formData);
      } else {
        // Mode création
        result = await createAddressAction(formData);
      }

      if (!result.success) {
        setError(result.error || "Une erreur est survenue");
        setIsLoading(false);
        return;
      }

      // Succès : fermer le modal
      onClose();
    } catch (err) {
      console.error("❌ Erreur adresse:", err);
      setError("Une erreur inattendue s'est produite");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-black/10 p-6 flex items-center justify-between">
          <h2 className="text-lg uppercase tracking-widest font-bold">
            {address ? "Modifier l'adresse" : "Nouvelle adresse"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-black/5 transition-colors"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Label */}
          <div>
            <label
              htmlFor="label"
              className="block text-xs uppercase tracking-widest text-gray-500 mb-2"
            >
              Nom de l'adresse *
            </label>
            <input
              type="text"
              id="label"
              name="label"
              value={formData.label}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full border-0 border-b border-black/20 pb-2 text-sm focus:outline-none focus:border-black transition-colors disabled:opacity-50"
              placeholder="Maison, Bureau, etc."
            />
          </div>

          {/* Prénom / Nom */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="first_name"
                className="block text-xs uppercase tracking-widest text-gray-500 mb-2"
              >
                Prénom *
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="w-full border-0 border-b border-black/20 pb-2 text-sm focus:outline-none focus:border-black transition-colors disabled:opacity-50"
              />
            </div>

            <div>
              <label
                htmlFor="last_name"
                className="block text-xs uppercase tracking-widest text-gray-500 mb-2"
              >
                Nom *
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="w-full border-0 border-b border-black/20 pb-2 text-sm focus:outline-none focus:border-black transition-colors disabled:opacity-50"
              />
            </div>
          </div>

          {/* Adresse */}
          <div>
            <label
              htmlFor="address"
              className="block text-xs uppercase tracking-widest text-gray-500 mb-2"
            >
              Adresse *
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full border-0 border-b border-black/20 pb-2 text-sm focus:outline-none focus:border-black transition-colors disabled:opacity-50"
              placeholder="123 Rue de la Paix"
            />
          </div>

          {/* Complément d'adresse */}
          <div>
            <label
              htmlFor="address_complement"
              className="block text-xs uppercase tracking-widest text-gray-500 mb-2"
            >
              Complément d'adresse
            </label>
            <input
              type="text"
              id="address_complement"
              name="address_complement"
              value={formData.address_complement}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full border-0 border-b border-black/20 pb-2 text-sm focus:outline-none focus:border-black transition-colors disabled:opacity-50"
              placeholder="Appartement, Étage, etc."
            />
          </div>

          {/* Code postal / Ville */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="postal_code"
                className="block text-xs uppercase tracking-widest text-gray-500 mb-2"
              >
                Code postal *
              </label>
              <input
                type="text"
                id="postal_code"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="w-full border-0 border-b border-black/20 pb-2 text-sm focus:outline-none focus:border-black transition-colors disabled:opacity-50"
              />
            </div>

            <div>
              <label
                htmlFor="city"
                className="block text-xs uppercase tracking-widest text-gray-500 mb-2"
              >
                Ville *
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="w-full border-0 border-b border-black/20 pb-2 text-sm focus:outline-none focus:border-black transition-colors disabled:opacity-50"
              />
            </div>
          </div>

          {/* Pays */}
          <div>
            <label
              htmlFor="country"
              className="block text-xs uppercase tracking-widest text-gray-500 mb-2"
            >
              Pays *
            </label>
            <select
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full border-0 border-b border-black/20 pb-2 text-sm focus:outline-none focus:border-black transition-colors disabled:opacity-50"
            >
              <option value="France">France</option>
              <option value="Belgique">Belgique</option>
              <option value="Suisse">Suisse</option>
              <option value="Luxembourg">Luxembourg</option>
            </select>
          </div>

          {/* Téléphone */}
          <div>
            <label
              htmlFor="phone"
              className="block text-xs uppercase tracking-widest text-gray-500 mb-2"
            >
              Téléphone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full border-0 border-b border-black/20 pb-2 text-sm focus:outline-none focus:border-black transition-colors disabled:opacity-50"
              placeholder="+33 6 12 34 56 78"
            />
          </div>

          {/* Adresse par défaut */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_default"
              name="is_default"
              checked={formData.is_default}
              onChange={handleChange}
              disabled={isLoading}
              className="w-4 h-4 border-black/20"
            />
            <label
              htmlFor="is_default"
              className="text-xs uppercase tracking-widest text-gray-700"
            >
              Définir comme adresse par défaut
            </label>
          </div>

          {/* Erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* Boutons */}
          <div className="flex items-center gap-4 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-black text-white uppercase tracking-wider text-xs py-4 px-6 hover:bg-black/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading
                ? "Enregistrement..."
                : address
                ? "Enregistrer"
                : "Ajouter l'adresse"}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-4 border border-black/20 uppercase tracking-wider text-xs hover:bg-black/5 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

