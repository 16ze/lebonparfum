import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import AddressesList from "@/components/account/AddressesList";

/**
 * Page Addresses - Gestion des adresses de livraison
 *
 * Features :
 * - Liste des adresses
 * - CRUD complet (create, update, delete)
 * - Définir adresse par défaut
 * - Modal de formulaire
 */
export default async function AddressesPage() {
  const supabase = await createClient();

  // Récupérer l'utilisateur
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (!user || authError) {
    redirect("/login");
  }

  // Récupérer les adresses de l'utilisateur
  const { data: addressesRaw, error: addressesError } = await supabase
    .from("user_addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (addressesError) {
    console.error("❌ Erreur récupération adresses:", addressesError.message);
  }

  // Mapping: DB -> code TypeScript
  // - address_line1 -> address
  // - name -> first_name + last_name (séparation du nom complet)
  const addresses = addressesRaw?.map((addr: any) => {
    // Séparer name en first_name et last_name
    let first_name = "";
    let last_name = "";
    if (addr.name) {
      const nameParts = addr.name.trim().split(/\s+/);
      if (nameParts.length > 0) {
        first_name = nameParts[0];
        last_name = nameParts.slice(1).join(" ") || "";
      }
    }
    
    return {
      ...addr,
      address: addr.address_line1 || addr.address, // Support des deux formats pour compatibilité
      first_name: addr.first_name || first_name, // Priorité à first_name si existe, sinon extrait de name
      last_name: addr.last_name || last_name, // Priorité à last_name si existe, sinon extrait de name
    };
  }) || [];

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-2xl md:text-3xl uppercase tracking-widest font-bold mb-2">
          Mes Adresses
        </h1>
        <p className="text-sm text-gray-500">
          Gérez vos adresses de livraison pour vos commandes
        </p>
      </div>

      {/* Liste des adresses */}
      <AddressesList addresses={addresses || []} />
    </div>
  );
}

