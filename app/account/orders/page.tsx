"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Package, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import Image from "next/image";

/**
 * Page Mes Commandes - Espace Client
 *
 * Affiche :
 * - Historique des commandes de l'utilisateur
 * - Détails de chaque commande (produits, montant, statut)
 *
 * Design Byredo : Cards expandables
 */

type Order = {
  id: string;
  stripe_payment_id: string;
  amount: number;
  status: string;
  items: any;
  shipping_address: any;
  created_at: string;
};

export default function AccountOrdersPage() {
  const supabase = createClient();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Charger les commandes de l'utilisateur
  useEffect(() => {
    const fetchOrders = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (data) {
          setOrders(data);
        }
      }

      setLoading(false);
    };

    fetchOrders();
  }, [supabase]);

  // Toggle détails commande
  const toggleOrder = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  // Badge statut
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
      paid: "bg-blue-50 text-blue-700 border-blue-200",
      shipped: "bg-green-50 text-green-700 border-green-200",
      cancelled: "bg-red-50 text-red-700 border-red-200",
    };

    const labels: Record<string, string> = {
      pending: "En attente",
      paid: "Payée",
      shipped: "Expédiée",
      cancelled: "Annulée",
    };

    return (
      <span
        className={`inline-block px-3 py-1 text-xs uppercase tracking-wider border ${
          styles[status] || "bg-gray-50 text-gray-700 border-gray-200"
        }`}
      >
        {labels[status] || status}
      </span>
    );
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
      {/* Titre */}
      <div className="mb-8">
        <h1 className="text-3xl uppercase tracking-widest font-bold mb-2">
          Mes Commandes
        </h1>
        <p className="text-sm text-gray-500 uppercase tracking-wider">
          {orders.length} commande(s)
        </p>
      </div>

      {/* Liste des commandes */}
      {orders.length === 0 ? (
        <div className="border border-black/10 p-12 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-sm text-gray-400 uppercase tracking-wider mb-2">
            Aucune commande
          </p>
          <p className="text-xs text-gray-400">
            Vos commandes apparaîtront ici une fois effectuées
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const items = order.items || [];

            return (
              <div key={order.id} className="border border-black/10">
                {/* Header de la commande */}
                <button
                  onClick={() => toggleOrder(order.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-black/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-6 text-left">
                    {/* Date */}
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">
                        Date
                      </p>
                      <p className="text-sm font-medium">
                        {new Date(order.created_at).toLocaleDateString(
                          "fr-FR",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </p>
                    </div>

                    {/* Montant */}
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">
                        Montant
                      </p>
                      <p className="text-sm font-medium">
                        {new Intl.NumberFormat("fr-FR", {
                          style: "currency",
                          currency: "EUR",
                        }).format(order.amount / 100)}
                      </p>
                    </div>

                    {/* Statut */}
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">
                        Statut
                      </p>
                      {getStatusBadge(order.status)}
                    </div>

                    {/* ID */}
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">
                        N° Commande
                      </p>
                      <p className="text-sm font-mono text-gray-600">
                        #{order.id.slice(0, 8)}
                      </p>
                    </div>
                  </div>

                  {/* Icône expand */}
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {/* Détails de la commande (expandable) */}
                {isExpanded && (
                  <div className="border-t border-black/10 px-6 py-6 bg-gray-50/50">
                    <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">
                      Articles commandés
                    </h3>

                    <div className="space-y-4">
                      {items.map((item: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 bg-white border border-black/10 p-4"
                        >
                          {/* Image produit */}
                          {item.image_url && (
                            <div className="relative w-16 h-16 bg-gray-100 border border-black/10 flex-shrink-0">
                              <Image
                                src={item.image_url}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}

                          {/* Infos produit */}
                          <div className="flex-1">
                            <p className="text-sm font-medium">{item.name}</p>
                            <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">
                              {item.brand}
                            </p>
                          </div>

                          {/* Quantité */}
                          <div className="text-sm text-gray-600">
                            Qté : {item.quantity}
                          </div>

                          {/* Prix */}
                          <div className="text-sm font-medium">
                            {new Intl.NumberFormat("fr-FR", {
                              style: "currency",
                              currency: "EUR",
                            }).format((item.price * item.quantity) / 100)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Adresse de livraison */}
                    {order.shipping_address && (
                      <div className="mt-6 pt-6 border-t border-black/10">
                        <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-3">
                          Adresse de livraison
                        </h3>
                        <div className="text-sm text-gray-600">
                          <p>{order.shipping_address.name}</p>
                          <p>{order.shipping_address.line1}</p>
                          {order.shipping_address.line2 && (
                            <p>{order.shipping_address.line2}</p>
                          )}
                          <p>
                            {order.shipping_address.postal_code}{" "}
                            {order.shipping_address.city}
                          </p>
                          <p>{order.shipping_address.country}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

