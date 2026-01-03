"use client";

import { useState } from "react";
import { Package, Eye } from "lucide-react";
import OrderDetailsModal from "./OrderDetailsModal";

/**
 * OrdersTable - Tableau des commandes (Client Component)
 *
 * Features :
 * - Affichage liste des commandes
 * - Badge statut avec couleurs
 * - Bouton "Voir détails" → modal
 * - Tri par date décroissante
 */

interface Order {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  shipping_address: any;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

interface OrdersTableProps {
  orders: Order[];
}

export default function OrdersTable({ orders }: OrdersTableProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Ouvrir le modal avec les détails de la commande
  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  // Couleur du badge selon le statut
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-50 text-green-700 border-green-200";
      case "pending":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      case "shipped":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "delivered":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  // Traduction des statuts
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "paid":
        return "Payée";
      case "pending":
        return "En attente";
      case "cancelled":
        return "Annulée";
      case "shipped":
        return "Expédiée";
      case "delivered":
        return "Livrée";
      default:
        return status;
    }
  };

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl uppercase tracking-widest font-bold mb-2">
          Commandes
        </h1>
        <p className="text-sm text-gray-500 uppercase tracking-wider">
          {orders.length} commande(s) au total
        </p>
      </div>

      {/* Tableau */}
      {orders.length === 0 ? (
        <div className="border border-black/10 p-12 text-center">
          <Package className="w-12 h-12 mx-auto mb-4 text-black/20" strokeWidth={1.5} />
          <p className="text-sm text-gray-400 uppercase tracking-wider">
            Aucune commande
          </p>
        </div>
      ) : (
        <div className="border border-black/10 overflow-hidden">
          <table className="w-full">
            <thead className="bg-black/5 border-b border-black/10">
              <tr>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-gray-500 font-medium">
                  N° Commande
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-gray-500 font-medium">
                  Client
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-gray-500 font-medium">
                  Montant
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-gray-500 font-medium">
                  Statut
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-gray-500 font-medium">
                  Date
                </th>
                <th className="text-right px-6 py-4 text-xs uppercase tracking-widest text-gray-500 font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-black/5 hover:bg-black/[0.02] transition-colors"
                >
                  {/* N° Commande */}
                  <td className="px-6 py-4">
                    <p className="text-sm font-mono font-medium">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                  </td>

                  {/* Client */}
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium">
                      {order.profiles.full_name}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {order.profiles.email}
                    </p>
                  </td>

                  {/* Montant */}
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium">
                      {new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                      }).format(order.amount / 100)}
                    </p>
                  </td>

                  {/* Statut */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 text-xs uppercase tracking-wider border ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(order.created_at).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end">
                      <button
                        onClick={() => handleViewDetails(order)}
                        className="p-2 hover:bg-black/5 transition-colors border border-black/10 flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4 text-gray-600" strokeWidth={1.5} />
                        <span className="text-xs uppercase tracking-wider">
                          Détails
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal détails commande */}
      <OrderDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        order={selectedOrder}
      />
    </>
  );
}
