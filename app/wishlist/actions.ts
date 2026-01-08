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
 * Ajoute un produit à la wishlist s'il n'y est pas, le retire sinon
 */
export async function toggleWishlistAction(productId: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (!user || authError) {
      return { success: false, error: "Non authentifié", inWishlist: false };
    }

    // Vérifier si le produit est déjà dans la wishlist
    const { data: existing } = await supabase
      .from("wishlist")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .single();

    if (existing) {
      // Retirer de la wishlist
      const { error: deleteError } = await supabase
        .from("wishlist")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);

      if (deleteError) {
        console.error("❌ Erreur remove from wishlist:", deleteError.message);
        return { success: false, error: "Erreur lors du retrait", inWishlist: true };
      }

      revalidatePath("/account/wishlist");
      revalidatePath("/");
      return { success: true, error: null, inWishlist: false };
    } else {
      // Ajouter à la wishlist
      const { error: insertError } = await supabase
        .from("wishlist")
        .insert({
          user_id: user.id,
          product_id: productId,
        });

      if (insertError) {
        console.error("❌ Erreur add to wishlist:", insertError.message);
        return { success: false, error: "Erreur lors de l'ajout", inWishlist: false };
      }

      revalidatePath("/account/wishlist");
      revalidatePath("/");
      return { success: true, error: null, inWishlist: true };
    }
  } catch (error) {
    console.error("❌ Erreur inattendue toggle wishlist:", error);
    return { success: false, error: "Une erreur inattendue s'est produite", inWishlist: false };
  }
}

