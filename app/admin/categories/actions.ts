"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { checkIsAdmin } from "@/lib/auth";
import {
  categorySchema,
  validateWithSchema,
  validateAndSanitizeDescription,
} from "@/lib/validation";

/**
 * Actions serveur pour la gestion des catégories
 *
 * Sécurité :
 * - Validation Zod de tous les inputs
 * - Sanitization HTML des descriptions
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

    // Valider les données avec Zod
    const validation = validateWithSchema(categorySchema, data);
    if (!validation.valid) {
      return {
        success: false,
        error: `Données invalides: ${validation.errors?.join(", ")}`,
      };
    }

    // Sanitizer la description HTML
    const descriptionResult = validateAndSanitizeDescription(data.description);
    if (!descriptionResult.valid) {
      return {
        success: false,
        error: descriptionResult.error || "Description invalide",
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

    // Créer la catégorie avec données validées et sanitized
    const { error } = await supabase.from("categories").insert([
      {
        name: data.name.trim(),
        slug: data.slug,
        description: descriptionResult.sanitized,
        image_url: data.image_url,
      },
    ]);

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

    // Valider les données avec Zod
    const validation = validateWithSchema(categorySchema, data);
    if (!validation.valid) {
      return {
        success: false,
        error: `Données invalides: ${validation.errors?.join(", ")}`,
      };
    }

    // Sanitizer la description HTML
    const descriptionResult = validateAndSanitizeDescription(data.description);
    if (!descriptionResult.valid) {
      return {
        success: false,
        error: descriptionResult.error || "Description invalide",
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

    // Mettre à jour avec données validées et sanitized
    const { error } = await supabase
      .from("categories")
      .update({
        name: data.name.trim(),
        slug: data.slug,
        description: descriptionResult.sanitized,
        image_url: data.image_url,
      })
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
