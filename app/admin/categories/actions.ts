"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { checkIsAdmin } from "@/lib/auth";

/**
 * Actions serveur pour la gestion des catégories
 */

interface CategoryData {
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
}

/**
 * Créer une nouvelle catégorie
 */
export async function createCategory(data: CategoryData) {
  try {
    // Vérifier les permissions admin
    const auth = await checkIsAdmin();
    if (!auth.isAdmin) {
      return {
        success: false,
        error: auth.error || "Accès refusé",
      };
    }

    const supabase = await createClient();

    // Vérifier si le slug existe déjà
    const { data: existing } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", data.slug)
      .single();

    if (existing) {
      return {
        success: false,
        error: "Ce slug existe déjà",
      };
    }

    // Créer la catégorie
    const { error } = await supabase.from("categories").insert([data]);

    if (error) {
      console.error("❌ Erreur création catégorie:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    // Revalider la page
    revalidatePath("/admin/categories");

    return {
      success: true,
    };
  } catch (error) {
    console.error("❌ Erreur:", error);
    return {
      success: false,
      error: "Erreur serveur",
    };
  }
}

/**
 * Mettre à jour une catégorie
 */
export async function updateCategory(id: string, data: CategoryData) {
  try {
    // Vérifier les permissions admin
    const auth = await checkIsAdmin();
    if (!auth.isAdmin) {
      return {
        success: false,
        error: auth.error || "Accès refusé",
      };
    }

    const supabase = await createClient();

    // Vérifier si le slug existe déjà (sauf pour cette catégorie)
    const { data: existing } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", data.slug)
      .neq("id", id)
      .single();

    if (existing) {
      return {
        success: false,
        error: "Ce slug existe déjà",
      };
    }

    // Mettre à jour
    const { error } = await supabase
      .from("categories")
      .update(data)
      .eq("id", id);

    if (error) {
      console.error("❌ Erreur mise à jour catégorie:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    // Revalider la page
    revalidatePath("/admin/categories");

    return {
      success: true,
    };
  } catch (error) {
    console.error("❌ Erreur:", error);
    return {
      success: false,
      error: "Erreur serveur",
    };
  }
}

/**
 * Supprimer une catégorie
 */
export async function deleteCategory(id: string) {
  try {
    // Vérifier les permissions admin
    const auth = await checkIsAdmin();
    if (!auth.isAdmin) {
      return {
        success: false,
        error: auth.error || "Accès refusé",
      };
    }

    const supabase = await createClient();

    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) {
      console.error("❌ Erreur suppression catégorie:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    // Revalider la page
    revalidatePath("/admin/categories");

    return {
      success: true,
    };
  } catch (error) {
    console.error("❌ Erreur:", error);
    return {
      success: false,
      error: "Erreur serveur",
    };
  }
}
