"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { checkIsAdmin } from "@/lib/auth";

/**
 * Actions serveur pour la gestion des tags
 */

interface TagData {
  name: string;
  slug: string;
}

/**
 * Créer un nouveau tag
 */
export async function createTag(data: TagData) {
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
      .from("tags")
      .select("id")
      .eq("slug", data.slug)
      .single();

    if (existing) {
      return {
        success: false,
        error: "Ce slug existe déjà",
      };
    }

    // Créer le tag
    const { error } = await supabase.from("tags").insert([data]);

    if (error) {
      console.error("❌ Erreur création tag:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    // Revalider la page
    revalidatePath("/admin/tags");

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
 * Mettre à jour un tag
 */
export async function updateTag(id: string, data: TagData) {
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

    // Vérifier si le slug existe déjà (sauf pour ce tag)
    const { data: existing } = await supabase
      .from("tags")
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
    const { error } = await supabase.from("tags").update(data).eq("id", id);

    if (error) {
      console.error("❌ Erreur mise à jour tag:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    // Revalider la page
    revalidatePath("/admin/tags");

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
 * Supprimer un tag
 */
export async function deleteTag(id: string) {
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

    const { error } = await supabase.from("tags").delete().eq("id", id);

    if (error) {
      console.error("❌ Erreur suppression tag:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    // Revalider la page
    revalidatePath("/admin/tags");

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
