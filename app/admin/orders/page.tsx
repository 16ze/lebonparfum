import { createClient } from "@/utils/supabase/server";
import { Package, Eye } from "lucide-react";
import Link from "next/link";

/**
 * Page Admin - Gestion des commandes
 *
 * Affiche :
 * - Liste de toutes les commandes
 * - Informations : ID, Client, Montant, Statut, Date
 * - Filtres par statut
 *
 * Design Byredo : Tableau épuré
 */

type Order = {
  id: string;
  user_id: string | null;
  stripe_payment_id: string;
  amount: number;
  status: string;
  items: any;
  shipping_address: any;
  created_at: string;
  profiles?: {
    email: string;
    full_name: string | null;
  };
};

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  // Récupérer toutes les commandes avec les infos client
  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      profiles (
        email,
        full_name
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Erreur récupération commandes:", error.message);
  }

  // Statistiques rapides
  const stats = {
    total: orders?.length || 0,
    pending: orders?.filter((o) => o.status === "pending").length || 0,
    paid: orders?.filter((o) => o.status === "paid").length || 0,
    shipped: orders?.filter((o) => o.status === "shipped").length || 0,
    totalRevenue:
      orders?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0,
  };

  // Statut badge helper
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

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl uppercase tracking-widest font-bold mb-2">
          Commandes
        </h1>
        <p className="text-sm text-gray-500 uppercase tracking-wider">
          {stats.total} commande(s) au total
        </p>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="border border-black/10 p-6">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">
            Chiffre d'affaires
          </p>
          <p className="text-2xl font-bold">
            {new Intl.NumberFormat("fr-FR", {
              style: "currency",
              currency: "EUR",
            }).format(stats.totalRevenue / 100)}
          </p>
        </div>

        <div className="border border-black/10 p-6">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">
            Commandes payées
          </p>
          <p className="text-2xl font-bold">{stats.paid}</p>
        </div>

        <div className="border border-black/10 p-6">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">
            À expédier
          </p>
          <p className="text-2xl font-bold text-orange-600">{stats.paid}</p>
        </div>

        <div className="border border-black/10 p-6">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">
            Expédiées
          </p>
          <p className="text-2xl font-bold text-green-600">{stats.shipped}</p>
        </div>
      </div>

      {/* Tableau des commandes */}
      {!orders || orders.length === 0 ? (
        <div className="border border-black/10 p-12 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
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
                  ID Commande
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
                  {/* ID Commande */}
                  <td className="px-6 py-4">
                    <p className="text-sm font-mono text-gray-600">
                      #{order.id.slice(0, 8)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Stripe: {order.stripe_payment_id?.slice(0, 12)}...
                    </p>
                  </td>

                  {/* Client */}
                  <td className="px-6 py-4">
                    {order.profiles ? (
                      <>
                        <p className="text-sm font-medium">
                          {order.profiles.full_name || "Client"}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {order.profiles.email}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-gray-400">Invité</p>
                    )}
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
                  <td className="px-6 py-4">{getStatusBadge(order.status)}</td>

                  {/* Date */}
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString("fr-FR", {
                        day: "numeric",
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
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="p-2 hover:bg-black/5 transition-colors border border-black/10"
                      >
                        <Eye
                          className="w-4 h-4 text-gray-600"
                          strokeWidth={1.5}
                        />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

