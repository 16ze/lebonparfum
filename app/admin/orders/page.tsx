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
    .filter((id) => id !== null) as string[];

  console.log("🔍 [ADMIN ORDERS] User IDs à rechercher:", userIds.length, userIds);

  let profiles: any[] = [];
  if (userIds.length > 0) {
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", userIds);

    if (profilesError) {
      console.error("❌ [ADMIN ORDERS] Erreur récupération profils:", profilesError.message);
      console.error("❌ [ADMIN ORDERS] Détails erreur:", {
        code: profilesError.code,
        details: profilesError.details,
        hint: profilesError.hint,
      });
    } else {
      profiles = profilesData || [];
      console.log("✅ [ADMIN ORDERS] Profils récupérés:", profiles.length);
      console.log("📋 [ADMIN ORDERS] Détails profils:", profiles.map(p => ({ id: p.id, name: p.full_name, email: p.email })));
    }
  }

  // Créer un map des profils
  const profilesMap = new Map();
  profiles.forEach((profile) => {
    profilesMap.set(profile.id, profile);
  });

  console.log("📊 [ADMIN ORDERS] ProfilesMap size:", profilesMap.size);

  // Enrichir les commandes avec les infos profil
  // Logique d'affichage :
  // 1. Si utilisateur connecté : utiliser profiles (full_name, email)
  // 2. Sinon : utiliser customer_name et customer_email (snapshot pour invités)
  // 3. Sinon : afficher "Invité (Email manquant)"
  const enrichedOrders = orders.map((order: any) => {
    console.log(`🔍 [ADMIN ORDERS] Traitement commande ${order.id}:`, {
      user_id: order.user_id,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      hasShippingAddress: !!order.shipping_address,
    });

    // Cas 1 : Utilisateur connecté - utiliser le profil
    if (order.user_id) {
      const profile = profilesMap.get(order.user_id);
      if (profile) {
        console.log(`✅ [ADMIN ORDERS] Profil trouvé pour ${order.user_id}:`, {
          full_name: profile.full_name,
          email: profile.email,
        });
        return {
          ...order,
          profiles: {
            full_name: profile.full_name || "Utilisateur sans nom",
            email: profile.email || "Email manquant",
          },
        };
      } else {
        console.warn(`⚠️ [ADMIN ORDERS] Profil non trouvé pour user_id: ${order.user_id}`);
        // Si pas de profil mais qu'on a customer_email/customer_name, les utiliser
        const customerName = order.customer_name;
        const customerEmail = order.customer_email;
        if (customerName || customerEmail) {
          console.log(`📋 [ADMIN ORDERS] Utilisation customer_name/email pour ${order.user_id}:`, {
            customerName,
            customerEmail,
          });
          return {
            ...order,
            profiles: {
              full_name: customerName || "Utilisateur inconnu",
              email: customerEmail || "N/A",
            },
          };
        }
        // Dernier recours : essayer de récupérer depuis shipping_address
        if (order.shipping_address?.email || order.shipping_address?.first_name) {
          const shippingName = order.shipping_address.first_name 
            ? `${order.shipping_address.first_name} ${order.shipping_address.last_name || ''}`.trim()
            : null;
          const shippingEmail = order.shipping_address.email || null;
          if (shippingName || shippingEmail) {
            console.log(`📋 [ADMIN ORDERS] Utilisation shipping_address pour ${order.user_id}`);
            return {
              ...order,
              profiles: {
                full_name: shippingName || "Utilisateur inconnu",
                email: shippingEmail || "N/A",
              },
            };
          }
        }
        return {
          ...order,
          profiles: {
            full_name: "Utilisateur inconnu",
            email: "N/A",
          },
        };
      }
    }
    
    // Cas 2 : Invité - utiliser les snapshot customer_name/customer_email
    const customerName = order.customer_name || null;
    const customerEmail = order.customer_email || null;
    
    if (customerName || customerEmail) {
      console.log(`📋 [ADMIN ORDERS] Invité avec snapshot:`, { customerName, customerEmail });
      return {
        ...order,
        profiles: {
          full_name: customerName || "Invité",
          email: customerEmail || "Email manquant",
        },
      };
    }
    
    // Cas 3 : Essayer shipping_address pour les invités
    if (order.shipping_address) {
      const shippingName = order.shipping_address.first_name 
        ? `${order.shipping_address.first_name} ${order.shipping_address.last_name || ''}`.trim()
        : null;
      const shippingEmail = order.shipping_address.email || null;
      if (shippingName || shippingEmail) {
        console.log(`📋 [ADMIN ORDERS] Invité avec shipping_address:`, { shippingName, shippingEmail });
        return {
          ...order,
          profiles: {
            full_name: shippingName || "Invité",
            email: shippingEmail || "Email manquant",
          },
        };
      }
    }
    
    // Cas 4 : Aucune info disponible
    console.warn(`⚠️ [ADMIN ORDERS] Aucune info pour commande ${order.id}`);
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
