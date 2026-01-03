"use client";

import { useState } from "react";
import { MapPin, Plus, Edit, Trash2, Star } from "lucide-react";
import AddressModal from "./AddressModal";
import { deleteAddressAction, updateAddressAction } from "@/app/account/actions";

/**
 * AddressesList - Liste des adresses de livraison
 *
 * Design Byredo :
 * - Cards flat avec bordures
 * - Badge "Par défaut" avec étoile
 * - Boutons d'action minimalistes
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

interface AddressesListProps {
  addresses: Address[];
}

export default function AddressesList({ addresses }: AddressesListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette adresse ?")) {
      return;
    }

    setDeletingId(addressId);
    const result = await deleteAddressAction(addressId);
    setDeletingId(null);

    if (!result.success) {
      alert(result.error || "Erreur lors de la suppression");
    }
  };

  const handleSetDefault = async (addressId: string) => {
    const result = await updateAddressAction(addressId, { is_default: true });

    if (!result.success) {
      alert(result.error || "Erreur lors de la mise à jour");
    }
  };

  if (addresses.length === 0) {
    return (
      <>
        <div className="border border-black/10 p-12 text-center">
          <MapPin size={48} strokeWidth={1} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-sm uppercase tracking-widest text-gray-500 mb-2">
            Aucune adresse
          </h3>
          <p className="text-sm text-gray-400 mb-6">
            Ajoutez une adresse de livraison pour faciliter vos commandes
          </p>
          <button
            onClick={handleCreate}
            className="bg-black text-white uppercase tracking-wider text-xs py-3 px-6 hover:bg-black/80 transition-colors inline-flex items-center gap-2"
          >
            <Plus size={16} />
            <span>Ajouter une adresse</span>
          </button>
        </div>

        <AddressModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          address={editingAddress}
        />
      </>
    );
  }

  return (
    <>
      {/* Bouton Ajouter */}
      <div className="mb-6">
        <button
          onClick={handleCreate}
          className="bg-black text-white uppercase tracking-wider text-xs py-3 px-6 hover:bg-black/80 transition-colors inline-flex items-center gap-2"
        >
          <Plus size={16} />
          <span>Ajouter une adresse</span>
        </button>
      </div>

      {/* Liste des adresses */}
      <div className="space-y-4">
        {addresses.map((address) => (
          <div
            key={address.id}
            className="border border-black/10 p-6 transition-all hover:border-black/30"
          >
            <div className="flex items-start justify-between gap-4">
              {/* Infos adresse */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider">
                    {address.label}
                  </h3>
                  {address.is_default && (
                    <span className="bg-black text-white px-2 py-1 text-[10px] uppercase tracking-widest inline-flex items-center gap-1">
                      <Star size={10} fill="white" />
                      Par défaut
                    </span>
                  )}
                </div>

                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-medium">
                    {address.first_name} {address.last_name}
                  </p>
                  <p>{address.address}</p>
                  {address.address_complement && <p>{address.address_complement}</p>}
                  <p>
                    {address.postal_code} {address.city}
                  </p>
                  <p>{address.country}</p>
                  {address.phone && <p>Tél : {address.phone}</p>}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {!address.is_default && (
                  <button
                    onClick={() => handleSetDefault(address.id)}
                    className="p-2 text-gray-400 hover:text-black hover:bg-black/5 transition-all"
                    title="Définir par défaut"
                  >
                    <Star size={18} strokeWidth={1.5} />
                  </button>
                )}

                <button
                  onClick={() => handleEdit(address)}
                  className="p-2 text-gray-400 hover:text-black hover:bg-black/5 transition-all"
                  title="Modifier"
                >
                  <Edit size={18} strokeWidth={1.5} />
                </button>

                <button
                  onClick={() => handleDelete(address.id)}
                  disabled={deletingId === address.id}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all disabled:opacity-50"
                  title="Supprimer"
                >
                  <Trash2 size={18} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <AddressModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAddress(null);
        }}
        address={editingAddress}
      />
    </>
  );
}

