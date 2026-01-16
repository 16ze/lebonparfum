"use client";

import { Package, User, MapPin, CreditCard } from "lucide-react";
import Drawer from "@/components/ui/Drawer";

/**
 * OrderDetailsModal - Modal affichant les détails d'une commande
 */

interface Order {
  id: string;
  user_id: string | null; // Nullable pour les commandes invités
  amount: number;
  status: string;
  shipping_address: {
    first_name: string;
    last_name: string;
    address: string;
    city: string;
    postal_code: string;
    country: string;
    phone?: string;
    email?: string;
  } | null; // Peut être null pour les anciennes commandes
  created_at: string;
  customer_email?: string | null; // Snapshot email pour invités
  customer_name?: string | null; // Snapshot nom pour invités
  profiles: {
    full_name: string;
    email: string;
  };
}

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export default function OrderDetailsModal({
  isOpen,
  onClose,
  order,
}: OrderDetailsModalProps) {
  if (!order) return null;

  // Traduction des statuts
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      paid: "Payée",
      pending: "En attente",
      cancelled: "Annulée",
      shipped: "Expédiée",
      delivered: "Livrée",
    };
    return labels[status] || status;
  };

  // Couleur du badge
  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      paid: "bg-green-50 text-green-700 border-green-200",
      pending: "bg-orange-50 text-orange-700 border-orange-200",
      cancelled: "bg-red-50 text-red-700 border-red-200",
      shipped: "bg-blue-50 text-blue-700 border-blue-200",
      delivered: "bg-purple-50 text-purple-700 border-purple-200",
    };
    return badges[status] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Détails de la commande"
      subtitle={`#${order.id.slice(0, 8).toUpperCase()}`}
    >
      <div className="p-8 space-y-8">
        {/* Statut et Montant */}
        <div className="grid grid-cols-2 gap-6">
          <div className="border border-black/10 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-black/60" strokeWidth={1.5} />
              <p className="text-xs uppercase tracking-widest text-gray-500">
                Statut
              </p>
            </div>
            <span
              className={`inline-block px-4 py-2 text-sm uppercase tracking-wider border ${getStatusBadge(
                order.status
              )}`}
            >
              {getStatusLabel(order.status)}
            </span>
          </div>

          <div className="border border-black/10 p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-black/60" strokeWidth={1.5} />
              <p className="text-xs uppercase tracking-widest text-gray-500">
                Montant
              </p>
            </div>
            <p className="text-3xl font-bold tracking-tight">
              {new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: "EUR",
              }).format(order.amount / 100)}
            </p>
          </div>
        </div>

        {/* Informations client */}
        <div className="border border-black/10 p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-black/60" strokeWidth={1.5} />
            <h3 className="text-xs uppercase tracking-widest text-gray-500">
              Informations client
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400">
                Nom
              </p>
              <p className="text-sm font-medium mt-1">
                {order.profiles.full_name}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400">
                Email
              </p>
              <p className="text-sm mt-1">{order.profiles.email}</p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400">
                Date de commande
              </p>
              <p className="text-sm mt-1">
                {new Date(order.created_at).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Adresse de livraison */}
        <div className="border border-black/10 p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-black/60" strokeWidth={1.5} />
            <h3 className="text-xs uppercase tracking-widest text-gray-500">
              Adresse de livraison
            </h3>
          </div>

          {order.shipping_address ? (
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {order.shipping_address.first_name}{" "}
              {order.shipping_address.last_name}
            </p>
            <p className="text-sm">{order.shipping_address.address}</p>
            <p className="text-sm">
              {order.shipping_address.postal_code}{" "}
              {order.shipping_address.city}
            </p>
            <p className="text-sm uppercase tracking-wide">
              {order.shipping_address.country}
            </p>
              {order.shipping_address.phone && (
                <p className="text-sm text-gray-600 mt-2">
                  <span className="text-xs uppercase tracking-wider text-gray-400">
                    Tél :
                  </span>{" "}
                  {order.shipping_address.phone}
                </p>
              )}
              {order.shipping_address.email && (
                <p className="text-sm text-gray-600">
                  <span className="text-xs uppercase tracking-wider text-gray-400">
                    Email :
                  </span>{" "}
                  {order.shipping_address.email}
                </p>
              )}
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-sm p-4">
              <p className="text-xs text-amber-700 uppercase tracking-wider">
                Aucune adresse de livraison
              </p>
              <p className="text-xs text-amber-600 mt-2">
                Cette commande a été passée avant l'implémentation du système
                d'adresses. Contactez le client via son email pour obtenir les
                informations de livraison.
              </p>
          </div>
          )}
        </div>

        {/* Bouton fermer */}
        <div className="pt-4 border-t border-black/10">
          <button
            onClick={onClose}
            className="w-full bg-black text-white px-6 py-3 uppercase tracking-wider text-sm hover:bg-black/80 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </Drawer>
  );
}
