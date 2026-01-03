"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Server Actions pour l'espace client
 * - Profile
 * - Addresses
 * - Wishlist
 * - Notifications
 * - Loyalty Points
 */

// =============================================
// PROFILE ACTIONS
// =============================================

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

/**
 * Changer le mot de passe
 */
export async function updatePasswordAction(newPassword: string) {
  try {
    // Validation
    if (!newPassword || newPassword.length < 8) {
      return {
        success: false,
        error: "Le mot de passe doit contenir au moins 8 caractères",
      };
    }

    // Vérifier qu'il contient au moins une majuscule et un chiffre
    if (!/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      return {
        success: false,
        error: "Le mot de passe doit contenir au moins une majuscule et un chiffre",
      };
    }

    const supabase = await createClient();

    // Vérifier l'authentification
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

    // Mettre à jour le mot de passe
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      console.error("❌ Erreur update password:", updateError.message);
      return {
        success: false,
        error: updateError.message,
      };
    }

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error("❌ Erreur inattendue update password:", error);
    return {
      success: false,
      error: "Une erreur inattendue s'est produite",
    };
  }
}

// =============================================
// ADDRESS ACTIONS
// =============================================

/**
 * Créer une nouvelle adresse
 */
export async function createAddressAction(data: {
  label: string;
  first_name: string;
  last_name: string;
  address: string;
  address_complement?: string;
  city: string;
  postal_code: string;
  country: string;
  phone?: string;
  is_default: boolean;
}) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (!user || authError) {
      return { success: false, error: "Non authentifié" };
    }

    // Si cette adresse est par défaut, retirer le flag des autres
    if (data.is_default) {
      await supabase
        .from("user_addresses")
        .update({ is_default: false })
        .eq("user_id", user.id);
    }

    // Créer l'adresse
    const { error: insertError } = await supabase
      .from("user_addresses")
      .insert({
        user_id: user.id,
        ...data,
      });

    if (insertError) {
      console.error("❌ Erreur create address:", insertError.message);
      return { success: false, error: "Erreur lors de la création de l'adresse" };
    }

    revalidatePath("/account/addresses");

    return { success: true, error: null };
  } catch (error) {
    console.error("❌ Erreur inattendue create address:", error);
    return { success: false, error: "Une erreur inattendue s'est produite" };
  }
}

/**
 * Mettre à jour une adresse
 */
export async function updateAddressAction(
  addressId: string,
  data: Partial<{
    label: string;
    first_name: string;
    last_name: string;
    address: string;
    address_complement: string;
    city: string;
    postal_code: string;
    country: string;
    phone: string;
    is_default: boolean;
  }>
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (!user || authError) {
      return { success: false, error: "Non authentifié" };
    }

    // Si cette adresse devient par défaut, retirer le flag des autres
    if (data.is_default) {
      await supabase
        .from("user_addresses")
        .update({ is_default: false })
        .eq("user_id", user.id)
        .neq("id", addressId);
    }

    // Mettre à jour l'adresse
    const { error: updateError } = await supabase
      .from("user_addresses")
      .update(data)
      .eq("id", addressId)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("❌ Erreur update address:", updateError.message);
      return { success: false, error: "Erreur lors de la mise à jour" };
    }

    revalidatePath("/account/addresses");

    return { success: true, error: null };
  } catch (error) {
    console.error("❌ Erreur inattendue update address:", error);
    return { success: false, error: "Une erreur inattendue s'est produite" };
  }
}

/**
 * Supprimer une adresse
 */
export async function deleteAddressAction(addressId: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (!user || authError) {
      return { success: false, error: "Non authentifié" };
    }

    const { error: deleteError } = await supabase
      .from("user_addresses")
      .delete()
      .eq("id", addressId)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("❌ Erreur delete address:", deleteError.message);
      return { success: false, error: "Erreur lors de la suppression" };
    }

    revalidatePath("/account/addresses");

    return { success: true, error: null };
  } catch (error) {
    console.error("❌ Erreur inattendue delete address:", error);
    return { success: false, error: "Une erreur inattendue s'est produite" };
  }
}

// =============================================
// WISHLIST ACTIONS
// =============================================

/**
 * Ajouter/Retirer un produit de la wishlist (toggle)
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
      return { success: true, error: null, inWishlist: true };
    }
  } catch (error) {
    console.error("❌ Erreur inattendue toggle wishlist:", error);
    return { success: false, error: "Une erreur inattendue s'est produite", inWishlist: false };
  }
}

// =============================================
// NOTIFICATION ACTIONS
// =============================================

/**
 * Marquer une notification comme lue
 */
export async function markNotificationAsReadAction(notificationId: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (!user || authError) {
      return { success: false, error: "Non authentifié" };
    }

    const { error: updateError } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("❌ Erreur mark notification:", updateError.message);
      return { success: false, error: "Erreur lors de la mise à jour" };
    }

    revalidatePath("/account");

    return { success: true, error: null };
  } catch (error) {
    console.error("❌ Erreur inattendue mark notification:", error);
    return { success: false, error: "Une erreur inattendue s'est produite" };
  }
}

/**
 * Marquer toutes les notifications comme lues
 */
export async function markAllNotificationsAsReadAction() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (!user || authError) {
      return { success: false, error: "Non authentifié" };
    }

    const { error: updateError } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (updateError) {
      console.error("❌ Erreur mark all notifications:", updateError.message);
      return { success: false, error: "Erreur lors de la mise à jour" };
    }

    revalidatePath("/account");

    return { success: true, error: null };
  } catch (error) {
    console.error("❌ Erreur inattendue mark all notifications:", error);
    return { success: false, error: "Une erreur inattendue s'est produite" };
  }
}


