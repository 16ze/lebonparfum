"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Server Actions pour l'espace client
 */

/**
 * Mettre à jour le profil utilisateur
 */
export async function updateProfileAction(
  userId: string,
  data: {
    full_name: string;
  }
) {
  try {
    // Validation
    if (!data.full_name || data.full_name.trim().length === 0) {
      return {
        success: false,
        error: "Le nom complet est requis",
      };
    }

    if (data.full_name.trim().length < 2) {
      return {
        success: false,
        error: "Le nom complet doit contenir au moins 2 caractères",
      };
    }

    const supabase = await createClient();

    // Vérifier que l'utilisateur est connecté
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (!user || authError) {
      return {
        success: false,
        error: "Non authentifié",
      };
    }

    // Vérifier que l'utilisateur modifie bien son propre profil
    if (user.id !== userId) {
      return {
        success: false,
        error: "Non autorisé",
      };
    }

    // Mettre à jour le profil
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: data.full_name.trim(),
      })
      .eq("id", userId);

    if (updateError) {
      console.error("❌ Erreur update profil:", updateError.message);
      return {
        success: false,
        error: "Erreur lors de la mise à jour du profil",
      };
    }

    // Revalider les pages qui dépendent du profil
    revalidatePath("/account/profile");
    revalidatePath("/account");

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error("❌ Erreur inattendue update profil:", error);
    return {
      success: false,
      error: "Une erreur inattendue s'est produite",
    };
  }
}

