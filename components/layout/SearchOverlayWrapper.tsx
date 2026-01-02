import { createClient } from "@/utils/supabase/server";
import SearchOverlay from "./SearchOverlay";

/**
 * SearchOverlayWrapper - Server Component qui fetch les produits
 *
 * Récupère tous les produits depuis Supabase et les passe au SearchOverlay
 */
export default async function SearchOverlayWrapper() {
  const supabase = await createClient();

  // Récupérer tous les produits (id, name, slug, price, image_url, collection)
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, slug, price, image_url, collection")
    .order("name", { ascending: true });

  if (error) {
    console.error("❌ Erreur lors de la récupération des produits pour la recherche:", error);
    return null;
  }

  return <SearchOverlay products={products || []} />;
}

