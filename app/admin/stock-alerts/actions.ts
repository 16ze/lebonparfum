"use server";

import { createClient } from "@/utils/supabase/server";
import { checkIsAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * Server Actions - Alertes Stock
 *
 * Actions pour mise à jour rapide du stock depuis la page d'alertes
 */

interface ActionResult {
  success: boolean;
  error?: string;
}

/**
 * updateProductStock - Met à jour le stock d'un produit
 *
 * @param productId - ID du produit
 * @param newStock - Nouvelle valeur du stock
 * @returns Résultat de l'opération
 */
export async function updateProductStock(
  productId: string,
  newStock: number
): Promise<ActionResult> {
  try {
    // Vérification authentification admin
    const adminCheck = await checkIsAdmin();
    if (!adminCheck.isAdmin) {
      return {
        success: false,
        error: "Non autorisé. Accès admin requis.",
      };
    }

    // Validation du stock
    if (newStock < 0) {
      return {
        success: false,
        error: "Le stock ne peut pas être négatif.",
      };
    }

    if (newStock > 9999) {
      return {
        success: false,
        error: "Le stock ne peut pas dépasser 9999.",
      };
    }

    const supabase = await createClient();

    // Mettre à jour le stock
    const { error } = await supabase
      .from("products")
      .update({
        stock: newStock,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId);

    if (error) {
      console.error("Erreur Supabase update stock:", error);
      return {
        success: false,
        error: "Erreur lors de la mise à jour du stock.",
      };
    }

    // Revalider les pages concernées
    revalidatePath("/admin/stock-alerts");
    revalidatePath("/admin/products");
    revalidatePath("/product/[slug]", "page"); // Revalider toutes les pages produits

    return {
      success: true,
    };
  } catch (error) {
    console.error("Erreur updateProductStock:", error);
    return {
      success: false,
      error: "Erreur serveur lors de la mise à jour.",
    };
  }
}
