import { createClient } from "@/utils/supabase/server";
import MenuOverlay from "./MenuOverlay";

/**
 * MenuOverlayWrapper - Server Component wrapper pour fetcher les données
 *
 * Récupère les collections et produits depuis Supabase
 * et les passe au Client Component MenuOverlay
 */
export default async function MenuOverlayWrapper() {
  const supabase = createClient();

  // Récupérer toutes les collections distinctes
  const { data: collectionsData, error: collectionsError } = await supabase
    .from("products")
    .select("collection")
    .order("collection");

  // Récupérer tous les produits avec leurs collections
  const { data: productsData, error: productsError } = await supabase
    .from("products")
    .select("name, slug, collection, image_url")
    .order("name");

  // Gestion des erreurs
  if (collectionsError || productsError) {
    console.error("Erreur lors du fetch des données:", {
      collectionsError,
      productsError,
    });
    // Retourner un menu vide en cas d'erreur
    return <MenuOverlay collections={[]} products={[]} />;
  }

  // Extraire les collections uniques
  const uniqueCollections = Array.from(
    new Set(collectionsData?.map((item) => item.collection) || [])
  );

  // Organiser les produits par collection
  const productsByCollection = uniqueCollections.map((collection) => ({
    id: collection.toLowerCase().replace(/\s+/g, "-"),
    name: collection,
    products:
      productsData
        ?.filter((product) => product.collection === collection)
        .map((product) => ({
          id: product.slug,
          name: product.name,
          slug: product.slug,
          image: product.image_url || undefined,
        })) || [],
  }));

  return (
    <MenuOverlay collections={uniqueCollections} products={productsByCollection} />
  );
}

