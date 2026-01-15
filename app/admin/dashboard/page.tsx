import { createClient } from "@/utils/supabase/server";
import { Package, ShoppingBag, TrendingUp, Archive } from "lucide-react";
import { sub, format, eachDayOfInterval, startOfDay } from "date-fns";
import RevenueChart from "@/components/admin/dashboard/RevenueChart";
import RecentOrders from "@/components/admin/dashboard/RecentOrders";
import StockAlertsWidget from "@/components/admin/dashboard/StockAlertsWidget";

/**
 * Page Dashboard Admin - Vue de pilotage complète
 *
 * Affiche :
 * - Cartes de stats globales (produits, commandes, revenus, stock)
 * - Graphique d'évolution du CA (30 derniers jours)
 * - Widget des stocks critiques
 * - Liste des dernières commandes
 *
 * Design Byredo : Minimaliste, cartes avec bordures fines, graphiques épurés
 */
export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // =============================================
  // STATISTIQUES GLOBALES
  // =============================================
  const [productsResult, ordersResult, paidOrdersResult] = await Promise.all([
    supabase.from("products").select("id, stock, price", { count: "exact" }),
    supabase.from("orders").select("id", { count: "exact" }),
    // Récupérer uniquement les commandes payées pour le calcul du chiffre d'affaires
    supabase.from("orders").select("amount").eq("status", "paid"),
  ]);

  // Calculer les statistiques
  const totalProducts = productsResult.count || 0;
  const totalOrders = ordersResult.count || 0;

  // Calculer le stock total
  const totalStock =
    productsResult.data?.reduce(
      (sum, product) => sum + (product.stock || 0),
      0
    ) || 0;

  // Calculer le revenu total (uniquement les commandes payées)
  const totalRevenue =
    paidOrdersResult.data?.reduce(
      (sum, order) => sum + (Number(order.amount) || 0),
      0
    ) || 0;

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
      description: "Chiffre d'affaires (commandes payées)",
    },
    {
      name: "Stock",
      value: totalStock,
      icon: Archive,
      description: "Unités en stock",
    },
  ];

  // =============================================
  // DONNÉES GRAPHIQUE - ÉVOLUTION CA (30 JOURS)
  // =============================================
  const thirtyDaysAgo = sub(new Date(), { days: 30 });

  // Récupérer toutes les commandes payées des 30 derniers jours
  const { data: recentOrders } = await supabase
    .from("orders")
    .select("created_at, amount")
    .eq("status", "paid")
    .gte("created_at", thirtyDaysAgo.toISOString())
    .order("created_at", { ascending: true });

  // Générer un tableau avec tous les jours des 30 derniers jours
  const daysInterval = eachDayOfInterval({
    start: thirtyDaysAgo,
    end: new Date(),
  });

  // Agréger les commandes par jour
  const revenueByDay: { [key: string]: number } = {};

  // Initialiser tous les jours à 0
  daysInterval.forEach((day) => {
    const dateKey = format(startOfDay(day), "yyyy-MM-dd");
    revenueByDay[dateKey] = 0;
  });

  // Additionner les commandes par jour
  recentOrders?.forEach((order) => {
    const dateKey = format(startOfDay(new Date(order.created_at)), "yyyy-MM-dd");
    revenueByDay[dateKey] = (revenueByDay[dateKey] || 0) + Number(order.amount);
  });

  // Convertir en tableau pour Recharts
  const revenueData = Object.keys(revenueByDay)
    .sort()
    .map((date) => ({
      date,
      revenue: revenueByDay[date],
    }));

  // =============================================
  // DERNIÈRES COMMANDES (5 dernières)
  // =============================================
  const { data: latestOrders } = await supabase
    .from("orders")
    .select("id, customer_email, customer_name, amount, status, created_at, user_id, shipping_address")
    .order("created_at", { ascending: false })
    .limit(5);

  // Enrichir les commandes avec les profils utilisateurs
  let enrichedOrders = latestOrders || [];
  if (enrichedOrders.length > 0) {
    // Récupérer les user_ids uniques
    const userIds = enrichedOrders
      .map((order) => order.user_id)
      .filter((id) => id !== null) as string[];

    // Fetch profiles si on a des user_ids
    let profilesMap = new Map();
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds);

      profiles?.forEach((profile) => {
        profilesMap.set(profile.id, profile);
      });
    }

    // Enrichir chaque commande avec les infos client
    enrichedOrders = enrichedOrders.map((order: any) => {
      // Cas 1 : Utilisateur connecté - utiliser le profil
      if (order.user_id) {
        const profile = profilesMap.get(order.user_id);
        if (profile) {
          return {
            ...order,
            customer_name: profile.full_name || order.customer_name || "Utilisateur sans nom",
            customer_email: profile.email || order.customer_email || "Email manquant",
          };
        }
      }

      // Cas 2 : Utiliser customer_name/customer_email (snapshot)
      if (order.customer_name || order.customer_email) {
        return order;
      }

      // Cas 3 : Essayer shipping_address pour les invités
      if (order.shipping_address) {
        const shippingName = order.shipping_address.first_name
          ? `${order.shipping_address.first_name} ${order.shipping_address.last_name || ""}`.trim()
          : null;
        const shippingEmail = order.shipping_address.email || null;

        return {
          ...order,
          customer_name: shippingName || "Invité",
          customer_email: shippingEmail || "Email manquant",
        };
      }

      // Cas 4 : Aucune info disponible
      return {
        ...order,
        customer_name: "Invité",
        customer_email: "Email manquant",
      };
    });
  }

  // =============================================
  // ALERTES STOCK (5 produits critiques)
  // =============================================
  const { data: lowStockProducts } = await supabase
    .from("products")
    .select("id, name, slug, stock")
    .eq("status", "published")
    .lte("stock", 5)
    .order("stock", { ascending: true })
    .order("name", { ascending: true })
    .limit(5);

  return (
    <div className="p-4 md:p-8">
      {/* Titre de la page */}
      <div className="mb-8">
        <h1 className="text-3xl uppercase tracking-widest font-bold mb-2">
          Dashboard
        </h1>
        <p className="text-sm text-gray-500 uppercase tracking-wider">
          Vue d'ensemble de votre boutique
        </p>
      </div>

      {/* ========================================= */}
      {/* SECTION 1 : CARTES DE STATS (INTOUCHÉES) */}
      {/* ========================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
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
                <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
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

      {/* ========================================= */}
      {/* SECTION 2 : GRAPHIQUE + WIDGET STOCK */}
      {/* ========================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        {/* Graphique évolution CA (2/3 largeur) */}
        <div className="lg:col-span-2">
          <RevenueChart data={revenueData} />
        </div>

        {/* Widget Stocks Critiques (1/3 largeur) */}
        <div className="lg:col-span-1">
          <StockAlertsWidget products={lowStockProducts || []} />
        </div>
      </div>

      {/* ========================================= */}
      {/* SECTION 3 : COMMANDES RÉCENTES */}
      {/* ========================================= */}
      <div>
        <RecentOrders orders={enrichedOrders} />
      </div>
    </div>
  );
}
