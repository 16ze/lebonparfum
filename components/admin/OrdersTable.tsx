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
  user_id: string | null; // Nullable pour les commandes invités
  amount: number;
  status: string;
  shipping_address: any;
  created_at: string;
  customer_email?: string | null; // Snapshot email pour invités
  customer_name?: string | null; // Snapshot nom pour invités
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

      {/* Contenu */}
      {orders.length === 0 ? (
        <div className="border border-black/10 p-12 text-center">
          <Package className="w-12 h-12 mx-auto mb-4 text-black/20" strokeWidth={1.5} />
          <p className="text-sm text-gray-400 uppercase tracking-wider">
            Aucune commande
          </p>
        </div>
      ) : (
        <>
          {/* Version Mobile - Cartes */}
          <div className="md:hidden space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="border border-black/10 p-4 bg-white"
              >
                {/* Header carte : N° + Statut */}
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-mono font-bold">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <span
                    className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider border ${getStatusBadge(
                      order.status
                    )}`}
                  >
                    {getStatusLabel(order.status)}
                  </span>
                </div>

                {/* Infos client */}
                <div className="mb-3">
                  <p className="text-sm font-medium">
                    {order.profiles.full_name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {order.profiles.email}
                  </p>
                </div>

                {/* Montant + Date */}
                <div className="flex items-center justify-between mb-4 pt-3 border-t border-black/5">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">
                      Montant
                    </p>
                    <p className="text-lg font-bold">
                      {new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                      }).format(order.amount / 100)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">
                      Date
                    </p>
                    <p className="text-sm">
                      {new Date(order.created_at).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </p>
                  </div>
                </div>

                {/* Bouton action - Touch target 44px minimum */}
                <button
                  onClick={() => handleViewDetails(order)}
                  className="w-full py-3 bg-black text-white text-xs uppercase tracking-widest font-medium flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <Eye className="w-4 h-4" strokeWidth={1.5} />
                  Voir les détails
                </button>
              </div>
            ))}
          </div>

          {/* Version Desktop - Tableau */}
          <div className="hidden md:block border border-black/10 overflow-hidden">
            <table className="w-full">
              <thead className="bg-black/5 border-b border-black/10">
                <tr>
                  <th className="text-left px-4 lg:px-6 py-3 lg:py-4 text-xs uppercase tracking-widest text-gray-500 font-medium">
                    N° Commande
                  </th>
                  <th className="text-left px-4 lg:px-6 py-3 lg:py-4 text-xs uppercase tracking-widest text-gray-500 font-medium">
                    Client
                  </th>
                  <th className="text-left px-4 lg:px-6 py-3 lg:py-4 text-xs uppercase tracking-widest text-gray-500 font-medium">
                    Montant
                  </th>
                  <th className="text-left px-4 lg:px-6 py-3 lg:py-4 text-xs uppercase tracking-widest text-gray-500 font-medium">
                    Statut
                  </th>
                  <th className="text-left px-4 lg:px-6 py-3 lg:py-4 text-xs uppercase tracking-widest text-gray-500 font-medium hidden lg:table-cell">
                    Date
                  </th>
                  <th className="text-right px-4 lg:px-6 py-3 lg:py-4 text-xs uppercase tracking-widest text-gray-500 font-medium">
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
                    <td className="px-4 lg:px-6 py-3 lg:py-4">
                      <p className="text-sm font-mono font-medium">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                    </td>

                    {/* Client */}
                    <td className="px-4 lg:px-6 py-3 lg:py-4">
                      <p className="text-sm font-medium truncate max-w-[150px] lg:max-w-none">
                        {order.profiles.full_name}
                      </p>
                      <p className="text-xs text-gray-400 mt-1 truncate max-w-[150px] lg:max-w-none">
                        {order.profiles.email}
                      </p>
                    </td>

                    {/* Montant */}
                    <td className="px-4 lg:px-6 py-3 lg:py-4">
                      <p className="text-sm font-medium">
                        {new Intl.NumberFormat("fr-FR", {
                          style: "currency",
                          currency: "EUR",
                        }).format(order.amount / 100)}
                      </p>
                    </td>

                    {/* Statut */}
                    <td className="px-4 lg:px-6 py-3 lg:py-4">
                      <span
                        className={`inline-block px-2 lg:px-3 py-1 text-[10px] lg:text-xs uppercase tracking-wider border ${getStatusBadge(
                          order.status
                        )}`}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </td>

                    {/* Date - Hidden on tablet */}
                    <td className="px-4 lg:px-6 py-3 lg:py-4 hidden lg:table-cell">
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
                    <td className="px-4 lg:px-6 py-3 lg:py-4">
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="p-2 lg:p-2.5 hover:bg-black/5 transition-colors border border-black/10 flex items-center gap-1.5 lg:gap-2 min-h-[44px] min-w-[44px] justify-center"
                        >
                          <Eye className="w-4 h-4 text-gray-600" strokeWidth={1.5} />
                          <span className="text-xs uppercase tracking-wider hidden lg:inline">
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
        </>
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
