import { createClient } from "@/utils/supabase/server";
import CustomersTable from "@/components/admin/customers/CustomersTable";

/**
 * Page Admin - Base Clients (Marketing)
 *
 * Server Component qui agrège les données clients depuis orders et profiles
 * pour créer une vue unifiée par email
 */

interface CustomerData {
  email: string;
  name: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
  totalSpent: number; // en centimes
  orderCount: number;
  lastOrderDate: string | null;
}

export default async function AdminCustomersPage() {
  const supabase = await createClient();

  // Récupérer toutes les commandes avec shipping_address
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (ordersError) {
    console.error("❌ Erreur récupération commandes:", ordersError.message);
    return <CustomersTable customers={[]} />;
  }

  if (!orders || orders.length === 0) {
    return <CustomersTable customers={[]} />;
  }

  // Récupérer les profils des utilisateurs inscrits
  const userIds = orders
    .map((order) => order.user_id)
    .filter((id) => id !== null) as string[];

  let profilesMap = new Map();
  if (userIds.length > 0) {
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", userIds);

    if (profilesData) {
      profilesData.forEach((profile) => {
        profilesMap.set(profile.id, profile);
      });
    }
  }

  // Algorithme d'agrégation par email
  const customersMap = new Map<string, CustomerData>();

  orders.forEach((order: any) => {
    // Déterminer l'email du client (priorité: customer_email > profile.email > shipping_address.email)
    let customerEmail: string | null = null;
    let customerName: string | null = null;
    let phone: string | null = null;
    let city: string | null = null;
    let country: string | null = null;

    // Cas 1 : Utilisateur inscrit - utiliser le profil
    if (order.user_id) {
      const profile = profilesMap.get(order.user_id);
      if (profile) {
        customerEmail = profile.email;
        customerName = profile.full_name;
      }
    }

    // Cas 2 : Utiliser customer_email/customer_name (snapshot pour invités)
    if (!customerEmail && order.customer_email) {
      customerEmail = order.customer_email;
      customerName = order.customer_name || null;
    }

    // Cas 3 : Utiliser shipping_address
    if (order.shipping_address) {
      const shipping = order.shipping_address;
      
      // Email depuis shipping_address (si pas déjà défini)
      if (!customerEmail && shipping.email) {
        customerEmail = shipping.email;
      }

      // Nom depuis shipping_address (si pas déjà défini)
      if (!customerName && shipping.first_name) {
        customerName = `${shipping.first_name} ${shipping.last_name || ""}`.trim();
      }

      // Téléphone depuis shipping_address
      if (shipping.phone) {
        phone = shipping.phone;
      }

      // Localisation
      if (shipping.city) {
        city = shipping.city;
      }
      if (shipping.country) {
        country = shipping.country;
      }
    }

    // Si pas d'email, on skip cette commande (pas de client identifiable)
    if (!customerEmail) {
      return;
    }

    // Normaliser l'email (lowercase pour éviter les doublons)
    const normalizedEmail = customerEmail.toLowerCase().trim();

    // Récupérer ou créer l'entrée client
    let customer = customersMap.get(normalizedEmail);

    if (!customer) {
      customer = {
        email: normalizedEmail,
        name: customerName,
        phone: phone,
        city: city,
        country: country,
        totalSpent: 0,
        orderCount: 0,
        lastOrderDate: null,
      };
      customersMap.set(normalizedEmail, customer);
    }

    // Mettre à jour les statistiques
    customer.totalSpent += order.amount || 0;
    customer.orderCount += 1;

    // Mettre à jour la date de dernière commande (la plus récente)
    const orderDate = order.created_at;
    if (!customer.lastOrderDate || (orderDate && orderDate > customer.lastOrderDate)) {
      customer.lastOrderDate = orderDate;
    }

    // Mettre à jour les infos si elles sont plus récentes ou manquantes
    if (!customer.name && customerName) {
      customer.name = customerName;
    }
    if (!customer.phone && phone) {
      customer.phone = phone;
    }
    if (!customer.city && city) {
      customer.city = city;
    }
    if (!customer.country && country) {
      customer.country = country;
    }
  });

  // Convertir la Map en Array et trier par total dépensé (décroissant)
  const customers = Array.from(customersMap.values()).sort(
    (a, b) => b.totalSpent - a.totalSpent
  );

  console.log(`✅ [ADMIN CUSTOMERS] ${customers.length} clients uniques agrégés`);

  return <CustomersTable customers={customers} />;
}
