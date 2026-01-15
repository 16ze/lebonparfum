import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { ExternalLink } from "lucide-react";

/**
 * RecentOrders - Liste des dernières commandes
 *
 * Tableau simplifié avec client, montant, date, statut
 * Style Byredo: Bordures fines, badges uppercase
 */

interface Order {
  id: string;
  customer_email: string | null;
  customer_name: string | null;
  total_amount: number;
  status: string;
  created_at: string;
}

interface RecentOrdersProps {
  orders: Order[];
}

export default function RecentOrders({ orders }: RecentOrdersProps) {
  // Badge de statut
  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-orange-50 text-orange-700 border-orange-200",
      processing: "bg-blue-50 text-blue-700 border-blue-200",
      completed: "bg-green-50 text-green-700 border-green-200",
      cancelled: "bg-red-50 text-red-700 border-red-200",
    };

    const labels = {
      pending: "En attente",
      processing: "En cours",
      completed: "Livré",
      cancelled: "Annulé",
    };

    return (
      <span
        className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium border ${
          styles[status as keyof typeof styles] || styles.pending
        }`}
      >
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  return (
    <div className="bg-white border border-black">
      {/* Header */}
      <div className="px-6 py-4 border-b border-black">
        <h2 className="text-xs uppercase tracking-[0.2em] font-bold">
          Commandes Récentes
        </h2>
      </div>

      {/* Table */}
      {orders.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-sm text-gray-500 uppercase tracking-wide">
            Aucune commande récente
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          {/* Desktop Table */}
          <table className="w-full hidden md:table">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-[10px] uppercase tracking-wider font-bold p-4 text-gray-600">
                  Client
                </th>
                <th className="text-right text-[10px] uppercase tracking-wider font-bold p-4 text-gray-600">
                  Montant
                </th>
                <th className="text-left text-[10px] uppercase tracking-wider font-bold p-4 text-gray-600">
                  Date
                </th>
                <th className="text-center text-[10px] uppercase tracking-wider font-bold p-4 text-gray-600">
                  Statut
                </th>
                <th className="text-right text-[10px] uppercase tracking-wider font-bold p-4 text-gray-600">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  {/* Client */}
                  <td className="p-4">
                    <div>
                      <p className="text-sm font-medium">
                        {order.customer_name || "Client invité"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.customer_email || "Aucun email"}
                      </p>
                    </div>
                  </td>

                  {/* Montant */}
                  <td className="p-4 text-right">
                    <p className="text-sm font-bold">
                      {new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                      }).format(order.total_amount / 100)}
                    </p>
                  </td>

                  {/* Date */}
                  <td className="p-4">
                    <p className="text-xs text-gray-600">
                      Il y a{" "}
                      {formatDistanceToNow(new Date(order.created_at), {
                        locale: fr,
                      })}
                    </p>
                  </td>

                  {/* Statut */}
                  <td className="p-4 text-center">
                    {getStatusBadge(order.status)}
                  </td>

                  {/* Action */}
                  <td className="p-4 text-right">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="inline-flex items-center gap-1 text-xs uppercase tracking-wider font-medium hover:underline"
                    >
                      Voir
                      <ExternalLink size={12} strokeWidth={2} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile Cards */}
          <div className="md:hidden">
            {orders.map((order) => (
              <div
                key={order.id}
                className="p-4 border-b border-gray-200 last:border-b-0"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">
                      {order.customer_name || "Client invité"}
                    </p>
                    <p className="text-xs text-gray-500 mb-2">
                      {order.customer_email || "Aucun email"}
                    </p>
                  </div>
                  <p className="text-sm font-bold">
                    {new Intl.NumberFormat("fr-FR", {
                      style: "currency",
                      currency: "EUR",
                    }).format(order.total_amount / 100)}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.status)}
                    <p className="text-xs text-gray-600">
                      Il y a{" "}
                      {formatDistanceToNow(new Date(order.created_at), {
                        locale: fr,
                      })}
                    </p>
                  </div>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="text-xs uppercase tracking-wider font-medium hover:underline"
                  >
                    Voir
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
