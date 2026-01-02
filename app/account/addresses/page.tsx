"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { MapPin, Plus, Edit2, Trash2, Loader2 } from "lucide-react";
import AddressModal from "@/components/account/AddressModal";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";

/**
 * Page Mes Adresses - Espace Client
 *
 * Affiche et permet de gérer :
 * - Liste des adresses de livraison
 * - Ajout, modification, suppression
 * - Définir une adresse par défaut
 *
 * Design Byredo : Cards d'adresses
 */

type Address = {
  id: string;
  name: string;
  line1: string;
  line2?: string;
  city: string;
  postal_code: string;
  country: string;
  phone?: string;
  is_default: boolean;
};

export default function AccountAddressesPage() {
  const supabase = createClient();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal états
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);

  // Charger les adresses
  const fetchAddresses = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from("user_addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false });

      if (data) {
        setAddresses(data);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchAddresses();
  }, [supabase]);

  // Ouvrir modal création
  const handleCreateClick = () => {
    setSelectedAddress(null);
    setModalMode("create");
  };

  // Ouvrir modal édition
  const handleEditClick = (address: Address) => {
    setSelectedAddress(address);
    setModalMode("edit");
  };

  // Ouvrir modal suppression
  const handleDeleteClick = (address: Address) => {
    setAddressToDelete(address);
    setDeleteModalOpen(true);
  };

  // Confirmer suppression
  const handleDeleteConfirm = async () => {
    if (!addressToDelete) return;

    const { error } = await supabase
      .from("user_addresses")
      .delete()
      .eq("id", addressToDelete.id);

    if (!error) {
      fetchAddresses();
    } else {
      alert(`Erreur: ${error.message}`);
    }
  };

  // Définir comme adresse par défaut
  const handleSetDefault = async (addressId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // Retirer le défaut de toutes les adresses
    await supabase
      .from("user_addresses")
      .update({ is_default: false })
      .eq("user_id", user.id);

    // Définir la nouvelle adresse par défaut
    const { error } = await supabase
      .from("user_addresses")
      .update({ is_default: true })
      .eq("id", addressId);

    if (!error) {
      fetchAddresses();
    }
  };

  // Callback succès modal
  const handleModalSuccess = () => {
    setModalMode(null);
    fetchAddresses();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl uppercase tracking-widest font-bold mb-2">
            Mes Adresses
          </h1>
          <p className="text-sm text-gray-500 uppercase tracking-wider">
            {addresses.length} adresse(s)
          </p>
        </div>

        <button
          onClick={handleCreateClick}
          className="bg-black text-white px-6 py-3 uppercase tracking-wider text-sm hover:bg-black/80 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          Ajouter une adresse
        </button>
      </div>

      {/* Liste des adresses */}
      {addresses.length === 0 ? (
        <div className="border border-black/10 p-12 text-center">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-sm text-gray-400 uppercase tracking-wider mb-2">
            Aucune adresse enregistrée
          </p>
          <p className="text-xs text-gray-400">
            Ajoutez une adresse pour faciliter vos futures commandes
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`border p-6 relative ${
                address.is_default
                  ? "border-black bg-black/[0.02]"
                  : "border-black/10"
              }`}
            >
              {/* Badge par défaut */}
              {address.is_default && (
                <div className="absolute top-4 right-4">
                  <span className="inline-block px-2 py-1 bg-black text-white text-xs uppercase tracking-wider">
                    Par défaut
                  </span>
                </div>
              )}

              {/* Adresse */}
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">{address.name}</p>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>{address.line1}</p>
                  {address.line2 && <p>{address.line2}</p>}
                  <p>
                    {address.postal_code} {address.city}
                  </p>
                  <p className="uppercase tracking-wider">{address.country}</p>
                  {address.phone && <p>Tél : {address.phone}</p>}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-black/10">
                {!address.is_default && (
                  <button
                    onClick={() => handleSetDefault(address.id)}
                    className="text-xs uppercase tracking-wider text-gray-600 hover:text-black transition-colors"
                  >
                    Définir par défaut
                  </button>
                )}

                <div className="ml-auto flex items-center gap-2">
                  <button
                    onClick={() => handleEditClick(address)}
                    className="p-2 hover:bg-black/5 transition-colors border border-black/10"
                  >
                    <Edit2 className="w-4 h-4 text-gray-600" strokeWidth={1.5} />
                  </button>

                  <button
                    onClick={() => handleDeleteClick(address)}
                    className="p-2 hover:bg-red-50 transition-colors border border-black/10 hover:border-red-200"
                  >
                    <Trash2
                      className="w-4 h-4 text-gray-600 hover:text-red-600"
                      strokeWidth={1.5}
                    />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Adresse */}
      <AddressModal
        mode={modalMode}
        address={selectedAddress}
        onClose={() => setModalMode(null)}
        onSuccess={handleModalSuccess}
      />

      {/* Modal Confirmation Suppression */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        productName={addressToDelete?.name || "cette adresse"}
      />
    </div>
  );
}

