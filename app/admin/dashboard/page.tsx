import { createClient } from "@/utils/supabase/server";
import { Package, ShoppingBag, AlertTriangle, TrendingUp } from "lucide-react";
import Link from "next/link";

/**
 * Page Admin Dashboard - Vue d'ensemble
 *
 * Affiche :
 * - Statistiques globales (produits, commandes, revenus)
 * - Produits avec stock faible
 * - Dernières commandes
 *
 * Design Byredo : Cards minimalistes avec chiffres clés
 */

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Récupérer les statistiques
  const { data: products } = await supabase.from("products").select("*");

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  // Calculs statistiques
  const stats = {
    totalProducts: products?.length || 0,
    lowStockProducts:
      products?.filter((p) => p.stock > 0 && p.stock < 5).length || 0,
    outOfStockProducts: products?.filter((p) => p.stock === 0).length || 0,
    totalOrders: orders?.length || 0,
    pendingOrders: orders?.filter((o) => o.status === "pending").length || 0,
    paidOrders: orders?.filter((o) => o.status === "paid").length || 0,
    totalRevenue:
      orders
        ?.filter((o) => o.status === "paid" || o.status === "shipped")
        .reduce((sum, order) => sum + (order.amount || 0), 0) || 0,
  };

  // Produits avec stock faible
  const lowStockProducts = products
    ?.filter((p) => p.stock > 0 && p.stock < 10)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5);

  // Dernières commandes
  const recentOrders = orders?.slice(0, 5);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl uppercase tracking-widest font-bold mb-2">
          Dashboard
        </h1>
        <p className="text-sm text-gray-500 uppercase tracking-wider">
          Vue d'ensemble de votre boutique
        </p>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Produits */}
        <div className="border border-black/10 p-6">
          <div className="flex items-start justify-between mb-4">
            <Package className="w-8 h-8 text-gray-400" strokeWidth={1.5} />
          </div>
          <p className="text-3xl font-bold mb-1">{stats.totalProducts}</p>
          <p className="text-xs uppercase tracking-widest text-gray-500">
            Produits au catalogue
          </p>
        </div>

        {/* Stock faible */}
        <div className="border border-orange-200 bg-orange-50/30 p-6">
          <div className="flex items-start justify-between mb-4">
            <AlertTriangle
              className="w-8 h-8 text-orange-600"
              strokeWidth={1.5}
            />
          </div>
          <p className="text-3xl font-bold mb-1 text-orange-700">
            {stats.lowStockProducts}
          </p>
          <p className="text-xs uppercase tracking-widest text-orange-600">
            Stock faible (&lt; 5)
          </p>
          {stats.outOfStockProducts > 0 && (
            <p className="text-xs text-red-600 mt-2">
              + {stats.outOfStockProducts} en rupture
            </p>
          )}
        </div>

        {/* Commandes */}
        <div className="border border-black/10 p-6">
          <div className="flex items-start justify-between mb-4">
            <ShoppingBag className="w-8 h-8 text-gray-400" strokeWidth={1.5} />
          </div>
          <p className="text-3xl font-bold mb-1">{stats.totalOrders}</p>
          <p className="text-xs uppercase tracking-widest text-gray-500">
            Commandes totales
          </p>
          <p className="text-xs text-blue-600 mt-2">
            {stats.paidOrders} payées
          </p>
        </div>

        {/* Chiffre d'affaires */}
        <div className="border border-green-200 bg-green-50/30 p-6">
          <div className="flex items-start justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-green-600" strokeWidth={1.5} />
          </div>
          <p className="text-3xl font-bold mb-1 text-green-700">
            {new Intl.NumberFormat("fr-FR", {
              style: "currency",
              currency: "EUR",
              maximumFractionDigits: 0,
            }).format(stats.totalRevenue / 100)}
          </p>
          <p className="text-xs uppercase tracking-widest text-green-600">
            Chiffre d'affaires
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Produits avec stock faible */}
        <div className="border border-black/10">
          <div className="border-b border-black/10 px-6 py-4">
            <h2 className="text-lg uppercase tracking-widest font-bold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" strokeWidth={1.5} />
              Stock Faible
            </h2>
          </div>

          <div className="p-6">
            {!lowStockProducts || lowStockProducts.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8 uppercase tracking-wider">
                Tous les stocks sont corrects
              </p>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 border border-black/10 hover:bg-black/[0.02] transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">
                        {product.brand}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 text-xs uppercase tracking-wider border ${
                        product.stock === 0
                          ? "bg-red-50 text-red-700 border-red-200"
                          : product.stock < 5
                          ? "bg-orange-50 text-orange-700 border-orange-200"
                          : "bg-yellow-50 text-yellow-700 border-yellow-200"
                      }`}
                    >
                      {product.stock} restant{product.stock > 1 ? "s" : ""}
                    </span>
                  </div>
                ))}
                <Link
                  href="/admin/products"
                  className="block text-center text-sm uppercase tracking-wider text-gray-600 hover:text-black transition-colors pt-2"
                >
                  Voir tous les produits →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Dernières commandes */}
        <div className="border border-black/10">
          <div className="border-b border-black/10 px-6 py-4">
            <h2 className="text-lg uppercase tracking-widest font-bold flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
              Dernières Commandes
            </h2>
          </div>

          <div className="p-6">
            {!recentOrders || recentOrders.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8 uppercase tracking-wider">
                Aucune commande
              </p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => {
                  const statusStyles: Record<string, string> = {
                    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
                    paid: "bg-blue-50 text-blue-700 border-blue-200",
                    shipped: "bg-green-50 text-green-700 border-green-200",
                    cancelled: "bg-red-50 text-red-700 border-red-200",
                  };

                  const statusLabels: Record<string, string> = {
                    pending: "En attente",
                    paid: "Payée",
                    shipped: "Expédiée",
                    cancelled: "Annulée",
                  };

                  return (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3 border border-black/10 hover:bg-black/[0.02] transition-colors"
                    >
                      <div>
                        <p className="text-sm font-mono text-gray-600">
                          #{order.id.slice(0, 8)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(order.created_at).toLocaleDateString(
                            "fr-FR",
                            {
                              day: "numeric",
                              month: "short",
                            }
                          )}{" "}
                          •{" "}
                          {new Intl.NumberFormat("fr-FR", {
                            style: "currency",
                            currency: "EUR",
                          }).format(order.amount / 100)}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 text-xs uppercase tracking-wider border ${
                          statusStyles[order.status] ||
                          "bg-gray-50 text-gray-700 border-gray-200"
                        }`}
                      >
                        {statusLabels[order.status] || order.status}
                      </span>
                    </div>
                  );
                })}
                <Link
                  href="/admin/orders"
                  className="block text-center text-sm uppercase tracking-wider text-gray-600 hover:text-black transition-colors pt-2"
                >
                  Voir toutes les commandes →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
