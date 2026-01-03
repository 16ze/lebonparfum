"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Server Action: Mettre à jour les paramètres du site
 *
 * @param settings - Objet avec les clés et valeurs à mettre à jour
 * @returns Objet avec success et error
 */
export async function updateSiteSettings(settings: Record<string, string>) {
  try {
    const supabase = await createClient();

    // Vérifier que l'utilisateur est admin
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Non authentifié",
      };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile || !profile.is_admin) {
      return {
        success: false,
        error: "Accès refusé. Admin requis.",
      };
    }

    // Mettre à jour chaque paramètre
    const updates = Object.entries(settings).map(([key, value]) =>
      supabase
        .from("site_settings")
        .update({ setting_value: value })
        .eq("setting_key", key)
    );

    const results = await Promise.all(updates);

    // Vérifier les erreurs
    const errors = results.filter((result) => result.error);
    if (errors.length > 0) {
      console.error("❌ Erreurs mise à jour settings:", errors);
      return {
        success: false,
        error: "Erreur lors de la mise à jour",
      };
    }

    // Revalider les pages
    revalidatePath("/admin/settings");
    revalidatePath("/");

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error("❌ Erreur inattendue updateSiteSettings:", error);
    return {
      success: false,
      error: "Erreur lors de la mise à jour des paramètres",
    };
  }
}
