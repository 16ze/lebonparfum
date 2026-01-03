import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import OrdersList from "@/components/account/OrdersList";

/**
 * Page Orders - Historique des commandes
 *
 * Features :
 * - Liste des commandes de l'utilisateur
 * - Tri par date décroissante
 * - Badge statut
 * - Détails de chaque commande
 */
export default async function OrdersPage() {
  const supabase = await createClient();

  // Récupérer l'utilisateur
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (!user || authError) {
    redirect("/login");
  }

  // Récupérer les commandes de l'utilisateur
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (ordersError) {
    console.error("❌ Erreur récupération commandes:", ordersError.message);
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-2xl md:text-3xl uppercase tracking-widest font-bold mb-2">
          Mes Commandes
        </h1>
        <p className="text-sm text-gray-500">
          Consultez l'historique de vos achats et suivez vos livraisons
        </p>
      </div>

      {/* Liste des commandes */}
      <OrdersList orders={orders || []} />
    </div>
  );
}

