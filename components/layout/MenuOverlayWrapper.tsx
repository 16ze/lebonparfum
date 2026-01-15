import { createClient } from "@/utils/supabase/server";
import MenuOverlay from "./MenuOverlay";

/**
 * MenuOverlayWrapper - Server Component wrapper pour fetcher les données
 *
 * Récupère les collections et produits depuis Supabase
 * et les passe au Client Component MenuOverlay
 *
 * FAIL-SAFE: En cas d'erreur DB, retourne un menu vide au lieu de crasher
 */

interface Product {
  name: string;
  slug: string;
  collection: string;
  image_url: string | null;
  brand: string;
}

interface UserProfile {
  id: string;
  email?: string;
  isAdmin: boolean;
}

export default async function MenuOverlayWrapper() {
  let collections: string[] = [];
  let productsByCollection: Array<{
    id: string;
    name: string;
    products: Array<{
      id: string;
      name: string;
      slug: string;
      image?: string;
    }>;
  }> = [];
  let userProfile: UserProfile | null = null;

  try {
    const supabase = await createClient();

    // 1. Récupérer l'utilisateur connecté
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id, email, is_admin")
          .eq("id", authUser.id)
          .single();

        if (profileError) {
          console.error("⚠️ [SERVER] Erreur fetch profil:", profileError.message);
        } else if (profile) {
          userProfile = {
            id: profile.id,
            email: profile.email || undefined,
            isAdmin: profile.is_admin || false,
          };
        }
      }
    } catch (authError: any) {
      console.error("⚠️ [SERVER] Erreur authentification:", authError.message || authError);
      // Pas bloquant, on continue avec user = null
    }

    // 2. Récupérer tous les produits publiés
    const { data: productsData, error: productsError } = await supabase
      .from("products")
      .select("name, slug, collection, image_url, brand")
      .eq("status", "published")
      .order("collection")
      .order("name");

    if (productsError) {
      throw new Error(`Erreur fetch produits: ${productsError.message}`);
    }

    if (productsData && productsData.length > 0) {
      // Extraire les collections uniques (utiliser 'brand' ou 'collection')
      const uniqueCollections = Array.from(
        new Set(
          productsData
            .map((p: Product) => p.brand || p.collection)
            .filter(Boolean)
        )
      ) as string[];

      collections = uniqueCollections;

      // Organiser les produits par collection
      productsByCollection = uniqueCollections.map((collectionName) => {
        const collectionProducts = productsData
          .filter((p: Product) => (p.brand || p.collection) === collectionName)
          .map((p: Product) => ({
            id: p.slug,
            name: p.name,
            slug: p.slug,
            image: p.image_url || undefined,
          }));

        return {
          id: collectionName.toLowerCase().replace(/\s+/g, "-"),
          name: collectionName,
          products: collectionProducts,
        };
      });

      console.log("✅ [SERVER] MenuWrapper: ", {
        collections: collections.length,
        totalProducts: productsData.length,
      });
    } else {
      console.warn("⚠️ [SERVER] MenuWrapper: Aucun produit publié trouvé");
    }
  } catch (error: any) {
    // Logging robuste avec stack trace si disponible
    console.error("❌ [SERVER] Erreur MenuOverlayWrapper:", {
      message: error.message || "Erreur inconnue",
      name: error.name,
      stack: error.stack?.split("\n").slice(0, 3).join("\n"), // Première ligne de stack
    });

    // Ne pas throw : on retourne un menu vide pour ne pas crasher le site
  }

  // Retourner le composant avec les données (vides ou remplies)
  return (
    <MenuOverlay
      collections={collections}
      products={productsByCollection}
      user={userProfile}
    />
  );
}
