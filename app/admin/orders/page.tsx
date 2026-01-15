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
  // Logique d'affichage :
  // 1. Si utilisateur connecté : utiliser profiles (full_name, email)
  // 2. Sinon : utiliser customer_name et customer_email (snapshot pour invités)
  // 3. Sinon : afficher "Invité (Email manquant)"
  const enrichedOrders = orders.map((order) => {
    // Cas 1 : Utilisateur connecté - utiliser le profil
    if (order.user_id) {
      const profile = profilesMap.get(order.user_id);
      return {
        ...order,
        profiles: profile || {
          full_name: "Utilisateur inconnu",
          email: "N/A",
        },
      };
    }
    
    // Cas 2 : Invité - utiliser les snapshot customer_name/customer_email
    const customerName = order.customer_name || null;
    const customerEmail = order.customer_email || null;
    
    if (customerName || customerEmail) {
      return {
        ...order,
        profiles: {
          full_name: customerName || "Invité",
          email: customerEmail || "Email manquant",
        },
      };
    }
    
    // Cas 3 : Aucune info disponible
    return {
      ...order,
      profiles: {
        full_name: "Invité",
        email: "Email manquant",
      },
    };
  });

  return <OrdersTable orders={enrichedOrders} />;
}
