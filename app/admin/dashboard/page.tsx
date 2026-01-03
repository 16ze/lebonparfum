import { createClient } from "@/utils/supabase/server";
import { Package, ShoppingBag, TrendingUp, Archive } from "lucide-react";

/**
 * Page Dashboard Admin - Statistiques principales
 *
 * Affiche :
 * - Nombre total de produits
 * - Nombre de commandes
 * - Revenu total
 * - Stock total
 *
 * Design Byredo : Cards minimalistes avec icônes et chiffres
 */
export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Récupérer les statistiques
  const [productsResult, ordersResult] = await Promise.all([
    supabase.from("products").select("id, stock, price", { count: "exact" }),
    supabase.from("orders").select("amount", { count: "exact" }),
  ]);

  // Calculer les statistiques
  const totalProducts = productsResult.count || 0;
  const totalOrders = ordersResult.count || 0;

  // Calculer le stock total
  const totalStock =
    productsResult.data?.reduce((sum, product) => sum + (product.stock || 0), 0) || 0;

  // Calculer le revenu total
  const totalRevenue =
    ordersResult.data?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0;

  // Formater le revenu en euros
  const formattedRevenue = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(totalRevenue / 100); // Convertir centimes en euros

  const stats = [
    {
      name: "Produits",
      value: totalProducts,
      icon: Package,
      description: "Produits en catalogue",
    },
    {
      name: "Commandes",
      value: totalOrders,
      icon: ShoppingBag,
      description: "Commandes totales",
    },
    {
      name: "Revenu",
      value: formattedRevenue,
      icon: TrendingUp,
      description: "Revenu total",
    },
    {
      name: "Stock",
      value: totalStock,
      icon: Archive,
      description: "Unités en stock",
    },
  ];

  return (
    <div>
      {/* Titre de la page */}
      <div className="mb-8">
        <h1 className="text-3xl uppercase tracking-widest font-bold mb-2">
          Dashboard
        </h1>
        <p className="text-sm text-gray-500 uppercase tracking-wider">
          Vue d'ensemble de votre boutique
        </p>
      </div>

      {/* Grille de stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.name}
              className="border border-black/10 p-6 hover:border-black/20 transition-colors"
            >
              {/* Icône */}
              <div className="flex items-center justify-between mb-4">
                <Icon className="w-8 h-8 text-black/60" strokeWidth={1.5} />
              </div>

              {/* Valeur */}
              <div className="mb-2">
                <p className="text-3xl font-bold tracking-tight">
                  {stat.value}
                </p>
              </div>

              {/* Label */}
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500">
                  {stat.name}
                </p>
                <p className="text-xs text-gray-400 mt-1">{stat.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Section activité récente (placeholder) */}
      <div className="mt-12">
        <h2 className="text-xl uppercase tracking-widest font-bold mb-6">
          Activité récente
        </h2>
        <div className="border border-black/10 p-8 text-center">
          <p className="text-sm text-gray-400 uppercase tracking-wider">
            Aucune activité récente
          </p>
        </div>
      </div>
    </div>
  );
}
