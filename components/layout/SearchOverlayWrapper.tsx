import { createClient } from "@/utils/supabase/server";
import SearchOverlay from "./SearchOverlay";

/**
 * SearchOverlayWrapper - Server Component qui fetch les produits
 *
 * Récupère tous les produits depuis Supabase et les passe au SearchOverlay
 *
 * FAIL-SAFE: En cas d'erreur DB, retourne une recherche vide au lieu de crasher
 */

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  image_url: string | null;
  collection: string;
  brand?: string;
}

export default async function SearchOverlayWrapper() {
  let products: Product[] = [];

  try {
    const supabase = await createClient();

    // Récupérer tous les produits publiés pour la recherche instantanée
    const { data, error } = await supabase
      .from("products")
      .select("id, name, slug, price, image_url, collection, brand")
      .eq("status", "published")
      .order("name", { ascending: true });

    if (error) {
      throw new Error(`Erreur fetch produits recherche: ${error.message}`);
    }

    if (data && data.length > 0) {
      products = data as Product[];
      console.log("✅ [SERVER] SearchWrapper:", products.length, "produits chargés");
    } else {
      console.warn("⚠️ [SERVER] SearchWrapper: Aucun produit publié trouvé");
    }
  } catch (error: any) {
    // Logging robuste avec stack trace si disponible
    console.error("❌ [SERVER] Erreur SearchOverlayWrapper:", {
      message: error.message || "Erreur inconnue",
      name: error.name,
      stack: error.stack?.split("\n").slice(0, 3).join("\n"), // Première ligne de stack
    });

    // Ne pas throw : on retourne une recherche vide pour ne pas crasher le site
  }

  // Retourner le composant avec les données (vides ou remplies)
  return <SearchOverlay products={products} />;
}
