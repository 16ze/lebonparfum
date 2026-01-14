import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import WishlistGrid from "@/components/account/WishlistGrid";

/**
 * Page Wishlist - Liste de souhaits
 *
 * Features :
 * - Affichage des produits en favoris
 * - Retirer de la wishlist
 * - Ajouter au panier
 * - Grid responsive Byredo-style
 */
export default async function WishlistPage() {
  const supabase = await createClient();

  // Récupérer l'utilisateur
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (!user || authError) {
    redirect("/login");
  }

  // Récupérer la wishlist avec les détails produits
  const { data: wishlist, error: wishlistError } = await supabase
    .from("wishlist")
    .select(`
      id,
      created_at,
      products (
        id,
        name,
        slug,
        brand,
        collection,
        price,
        image_url,
        stock
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (wishlistError) {
    console.error("❌ Erreur récupération wishlist:", wishlistError.message);
  }

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-2xl md:text-3xl uppercase tracking-widest font-bold mb-2">
          Ma Wishlist
        </h1>
        <p className="text-sm text-gray-500">
          Vos produits favoris en un seul endroit
        </p>
      </div>

      {/* Grid des produits */}
      <WishlistGrid wishlist={wishlist as any || []} />
    </div>
  );
}

