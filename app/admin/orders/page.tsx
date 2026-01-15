import { createClient } from "@/utils/supabase/server";
import OrdersTable from "@/components/admin/OrdersTable";

/**
 * Page Admin - Gestion des commandes
 *
 * Server Component qui récupère toutes les commandes avec les infos user
 */
export default async function AdminOrdersPage() {
  const supabase = await createClient();

  // Récupérer toutes les commandes (sans filtre user_id - l'admin doit tout voir)
  // La policy RLS "Admin can view all orders" garantit que seuls les admins voient tout
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (ordersError) {
    console.error("❌ Erreur récupération commandes:", ordersError.message);
    return <OrdersTable orders={[]} />;
  }

  if (!orders || orders.length === 0) {
    return <OrdersTable orders={[]} />;
  }

  // Récupérer les profils des utilisateurs séparément
  const userIds = orders
    .map((order) => order.user_id)
    .filter((id) => id !== null);

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .in("id", userIds);

  // Créer un map des profils
  const profilesMap = new Map();
  profiles?.forEach((profile) => {
    profilesMap.set(profile.id, profile);
  });

  // Enrichir les commandes avec les infos profil
  const enrichedOrders = orders.map((order) => ({
    ...order,
    profiles: order.user_id
      ? profilesMap.get(order.user_id) || {
          full_name: "Utilisateur inconnu",
          email: "N/A",
        }
      : {
          full_name: "Invité",
          email: "N/A",
        },
  }));

  return <OrdersTable orders={enrichedOrders} />;
}
