import { createClient as createBrowserClient } from "@/utils/supabase/client";

/**
 * Upload une image produit vers Supabase Storage
 *
 * @param file - Fichier image à uploader
 * @returns URL publique de l'image ou erreur
 */
export async function uploadProductImage(
  file: File
): Promise<{ url: string; error: null } | { url: null; error: string }> {
  try {
    const supabase = createBrowserClient();

    // Vérifier l'extension du fichier
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    const validExtensions = ["jpg", "jpeg", "png", "webp", "gif"];

    if (!fileExt || !validExtensions.includes(fileExt)) {
      return {
        url: null,
        error: "Format d'image invalide. Utilisez JPG, PNG, WEBP ou GIF.",
      };
    }

    // Générer un nom unique pour l'image (UUID + extension)
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    // Upload vers le bucket product-images
    const { data, error } = await supabase.storage
      .from("product-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("❌ Erreur upload Supabase Storage:", error);
      return {
        url: null,
        error: error.message || "Erreur lors de l'upload de l'image",
      };
    }

    // Récupérer l'URL publique
    const {
      data: { publicUrl },
    } = supabase.storage.from("product-images").getPublicUrl(data.path);

    return {
      url: publicUrl,
      error: null,
    };
  } catch (error) {
    console.error("❌ Erreur inattendue lors de l'upload:", error);
    return {
      url: null,
      error: "Erreur inattendue lors de l'upload",
    };
  }
}

/**
 * Supprime une image produit de Supabase Storage
 *
 * @param url - URL publique de l'image à supprimer
 * @returns Success boolean
 */
export async function deleteProductImage(
  url: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createBrowserClient();

    // Extraire le path depuis l'URL
    // Format: https://xxx.supabase.co/storage/v1/object/public/product-images/products/uuid.jpg
    const urlParts = url.split("/product-images/");
    if (urlParts.length < 2) {
      return {
        success: false,
        error: "URL invalide",
      };
    }

    const filePath = urlParts[1];

    // Supprimer du bucket
    const { error } = await supabase.storage
      .from("product-images")
      .remove([filePath]);

    if (error) {
      console.error("❌ Erreur suppression Supabase Storage:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("❌ Erreur inattendue lors de la suppression:", error);
    return {
      success: false,
      error: "Erreur inattendue lors de la suppression",
    };
  }
}

/**
 * Vérifie la taille d'un fichier
 *
 * @param file - Fichier à vérifier
 * @param maxSizeMB - Taille max en MB (défaut: 5MB)
 * @returns True si valide
 */
export function validateFileSize(file: File, maxSizeMB: number = 5): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}
