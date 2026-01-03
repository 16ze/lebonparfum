"use client";

import { useState } from "react";
import { Package, ChevronDown, ChevronUp } from "lucide-react";
import clsx from "clsx";

/**
 * OrdersList - Liste des commandes client
 *
 * Design Byredo :
 * - Cards flat avec bordures
 * - Badge statut avec couleurs
 * - Accordéon pour les détails
 */

interface Order {
  id: string;
  stripe_payment_id: string | null;
  amount: number;
  status: string;
  items: any;
  shipping_address: any;
  created_at: string;
}

interface OrdersListProps {
  orders: Order[];
}

export default function OrdersList({ orders }: OrdersListProps) {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  if (orders.length === 0) {
    return (
      <div className="border border-black/10 p-12 text-center">
        <Package size={48} strokeWidth={1} className="mx-auto mb-4 text-gray-300" />
        <h3 className="text-sm uppercase tracking-widest text-gray-500 mb-2">
          Aucune commande
        </h3>
        <p className="text-sm text-gray-400">
          Vous n'avez pas encore passé de commande
        </p>
      </div>
    );
  }

  const toggleExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const isExpanded = expandedOrder === order.id;
        const orderDate = new Date(order.created_at).toLocaleDateString("fr-FR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        const items = order.items || [];
        const itemCount = Array.isArray(items)
          ? items.reduce((sum, item) => sum + (item.quantity || 0), 0)
          : 0;

        return (
          <div
            key={order.id}
            className="border border-black/10 transition-all hover:border-black/30"
          >
            {/* Header (toujours visible) */}
            <button
              onClick={() => toggleExpand(order.id)}
              className="w-full p-6 flex items-center justify-between hover:bg-black/5 transition-colors"
            >
              <div className="flex items-center gap-6 text-left">
                {/* Icône */}
                <Package size={24} strokeWidth={1.5} className="text-gray-400" />

                {/* Infos */}
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">
                    Commande #{order.id.slice(0, 8)}
                  </p>
                  <p className="text-sm font-medium">{orderDate}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {itemCount} article{itemCount > 1 ? "s" : ""} • {(order.amount / 100).toFixed(2)} €
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Badge Statut */}
                <StatusBadge status={order.status} />

                {/* Chevron */}
                {isExpanded ? (
                  <ChevronUp size={20} strokeWidth={1.5} />
                ) : (
                  <ChevronDown size={20} strokeWidth={1.5} />
                )}
              </div>
            </button>

            {/* Détails (expandable) */}
            {isExpanded && (
              <div className="border-t border-black/10 p-6 bg-gray-50">
                <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-4">
                  Détails de la commande
                </h4>

                {/* Liste des articles */}
                <div className="space-y-3">
                  {Array.isArray(items) && items.length > 0 ? (
                    items.map((item: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-3 border-b border-black/10 last:border-0"
                      >
                        <div className="flex items-center gap-4">
                          {/* Image */}
                          {item.image_url && (
                            <img
                              src={item.image_url}
                              alt={item.product_name}
                              className="w-12 h-12 object-cover border border-black/10"
                            />
                          )}

                          {/* Nom + Quantité */}
                          <div>
                            <p className="text-sm font-medium">{item.product_name}</p>
                            <p className="text-xs text-gray-500">
                              Quantité : {item.quantity}
                            </p>
                          </div>
                        </div>

                        {/* Prix */}
                        <p className="text-sm font-medium">
                          {((item.price_at_time * item.quantity) / 100).toFixed(2)} €
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Aucun article</p>
                  )}
                </div>

                {/* Total */}
                <div className="mt-6 pt-4 border-t border-black/10 flex justify-between items-center">
                  <p className="text-xs uppercase tracking-widest text-gray-500">
                    Total
                  </p>
                  <p className="text-lg font-bold">
                    {(order.amount / 100).toFixed(2)} €
                  </p>
                </div>

                {/* Stripe Payment ID */}
                {order.stripe_payment_id && (
                  <div className="mt-4 pt-4 border-t border-black/10">
                    <p className="text-xs uppercase tracking-widest text-gray-400">
                      ID Paiement Stripe
                    </p>
                    <p className="text-xs text-gray-600 mt-1 font-mono">
                      {order.stripe_payment_id}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * StatusBadge - Badge de statut de commande
 */
function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    pending: {
      label: "En attente",
      className: "bg-yellow-50 text-yellow-700 border-yellow-200",
    },
    paid: {
      label: "Payée",
      className: "bg-green-50 text-green-700 border-green-200",
    },
    shipped: {
      label: "Expédiée",
      className: "bg-blue-50 text-blue-700 border-blue-200",
    },
    delivered: {
      label: "Livrée",
      className: "bg-gray-50 text-gray-700 border-gray-200",
    },
    cancelled: {
      label: "Annulée",
      className: "bg-red-50 text-red-700 border-red-200",
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: status,
    className: "bg-gray-50 text-gray-700 border-gray-200",
  };

  return (
    <span
      className={clsx(
        "px-3 py-1 text-[10px] uppercase tracking-widest font-medium border",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}

