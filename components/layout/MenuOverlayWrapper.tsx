import { createClient } from "@/utils/supabase/server";
import MenuOverlay from "./MenuOverlay";

/**
 * MenuOverlayWrapper - Server Component wrapper pour fetcher les données
 *
 * Récupère les collections et produits depuis Supabase
 * et les passe au Client Component MenuOverlay
 */
export default async function MenuOverlayWrapper() {
  const supabase = await createClient();

  // Récupérer la session utilisateur
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  // Si utilisateur connecté, récupérer le profil (pour is_admin)
  let userProfile = null;
  if (authUser) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, email, is_admin")
      .eq("id", authUser.id)
      .single();

    if (profile) {
      userProfile = {
        id: profile.id,
        email: profile.email || undefined,
        isAdmin: profile.is_admin || false,
      };
    }
  }

  // Récupérer toutes les collections distinctes (produits publiés uniquement)
  const { data: collectionsData, error: collectionsError } = await supabase
    .from("products")
    .select("collection")
    .eq("status", "published")
    .order("collection");

  // Récupérer tous les produits publiés avec leurs collections
  const { data: productsData, error: productsError } = await supabase
    .from("products")
    .select("name, slug, collection, image_url")
    .eq("status", "published")
    .order("name");

  // Logs pour débugger
  console.log("🔍 MenuOverlayWrapper - Debug:");
  console.log("Collections data:", collectionsData);
  console.log("Collections error:", collectionsError);
  console.log("Products data:", productsData?.length, "produits");
  console.log("Products error:", productsError);

  // Gestion des erreurs
  if (collectionsError || productsError) {
    console.error("❌ Erreur lors du fetch des données:", {
      collectionsError: collectionsError?.message,
      productsError: productsError?.message,
    });
    // Retourner un menu vide en cas d'erreur
    return <MenuOverlay collections={[]} products={[]} user={userProfile} />;
  }

  // Vérifier si les données sont vides
  if (!collectionsData || collectionsData.length === 0) {
    console.warn("⚠️ Aucune collection trouvée dans la base de données");
    console.warn("💡 Vérifiez que:");
    console.warn("   1. La table 'products' existe dans Supabase");
    console.warn("   2. La RLS policy 'Public Read' est créée");
    console.warn("   3. Les données ont été injectées (npm run seed)");
    return <MenuOverlay collections={[]} products={[]} user={userProfile} />;
  }

  // Extraire les collections uniques
  const uniqueCollections = Array.from(
    new Set(collectionsData?.map((item) => item.collection) || [])
  );

  console.log("✅ Collections uniques trouvées:", uniqueCollections);

  // Organiser les produits par collection
  const productsByCollection = uniqueCollections.map((collection) => {
    const collectionProducts =
      productsData
        ?.filter((product) => product.collection === collection)
        .map((product) => ({
          id: product.slug,
          name: product.name,
          slug: product.slug,
          image: product.image_url || undefined,
        })) || [];

    console.log(`   - ${collection}: ${collectionProducts.length} produits`);

    return {
      id: collection.toLowerCase().replace(/\s+/g, "-"),
      name: collection,
      products: collectionProducts,
    };
  });

  console.log("✅ MenuOverlayWrapper - Données prêtes:", {
    collections: uniqueCollections.length,
    totalProducts: productsData?.length || 0,
  });

  return (
    <MenuOverlay
      collections={uniqueCollections}
      products={productsByCollection}
      user={userProfile}
    />
  );
}

