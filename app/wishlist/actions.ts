"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Server Action: Récupérer les IDs des produits dans la wishlist
 * 
 * Utilisé pour afficher l'état des cœurs (plein/vide) sur les cartes produits
 * sans avoir à fetcher la wishlist complète pour chaque produit
 */
export async function getWishlistIds(): Promise<string[]> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (!user || authError) {
      return [];
    }

    const { data: wishlist, error } = await supabase
      .from("wishlist")
      .select("product_id")
      .eq("user_id", user.id);

    if (error) {
      console.error("❌ Erreur récupération wishlist IDs:", error.message);
      return [];
    }

    return wishlist?.map((item) => item.product_id) || [];
  } catch (error) {
    console.error("❌ Erreur inattendue getWishlistIds:", error);
    return [];
  }
}

/**
 * Server Action: Toggle wishlist (Ajouter/Retirer)
 * 
 * Export de la fonction existante depuis app/account/actions.ts
 * pour centraliser les actions wishlist
 */
export { toggleWishlistAction } from "@/app/account/actions";

