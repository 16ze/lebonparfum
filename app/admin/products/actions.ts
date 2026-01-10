"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { uploadProductImage, deleteProductImage } from "@/utils/supabase/storage";

/**
 * Server Actions pour la gestion des produits (Admin)
 *
 * Actions :
 * - createProduct(): Créer un nouveau produit
 * - updateProduct(): Modifier un produit existant
 * - deleteProduct(): Supprimer un produit
 */

interface ProductFormData {
  name: string;
  slug: string;
  brand: string;
  description: string;
  price: number; // En centimes
  stock: number;
  image_url?: string | null;
}

/**
 * Créer un nouveau produit
 */
export async function createProduct(
  productData: ProductFormData,
  imageFile?: File,
  categoryIds?: string[],
  tagIds?: string[]
) {
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

    // Upload de l'image si fournie
    let imageUrl = productData.image_url || null;
    if (imageFile) {
      const uploadResult = await uploadProductImage(imageFile);
      if (uploadResult.error) {
        return {
          success: false,
          error: `Erreur upload image: ${uploadResult.error}`,
        };
      }
      imageUrl = uploadResult.url;
    }

    // Vérifier que le slug est unique
    const { data: existingProduct } = await supabase
      .from("products")
      .select("id")
      .eq("slug", productData.slug)
      .single();

    if (existingProduct) {
      return {
        success: false,
        error: "Ce slug existe déjà. Veuillez en choisir un autre.",
      };
    }

    // Créer le produit
    const { data, error } = await supabase
      .from("products")
      .insert([
        {
          name: productData.name,
          slug: productData.slug,
          brand: productData.brand,
          description: productData.description,
          price: productData.price,
          stock: productData.stock,
          image_url: imageUrl,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("❌ Erreur création produit:", error.message);
      return {
        success: false,
        error: error.message,
      };
    }

    // Gérer les relations catégories et tags
    if (data && data.id) {
      const productId = data.id;

      // Insérer les relations catégories
      if (categoryIds && categoryIds.length > 0) {
        const categoryRelations = categoryIds.map((catId) => ({
          product_id: productId,
          category_id: catId,
        }));

        await supabase.from("product_categories").insert(categoryRelations);
      }

      // Insérer les relations tags
      if (tagIds && tagIds.length > 0) {
        const tagRelations = tagIds.map((tagId) => ({
          product_id: productId,
          tag_id: tagId,
        }));

        await supabase.from("product_tags").insert(tagRelations);
      }
    }

    // Revalider la page produits
    revalidatePath("/admin/products");
    revalidatePath("/");

    return {
      success: true,
      product: data,
      error: null,
    };
  } catch (error) {
    console.error("❌ Erreur inattendue createProduct:", error);
    return {
      success: false,
      error: "Erreur lors de la création du produit",
    };
  }
}

/**
 * Modifier un produit existant
 */
export async function updateProduct(
  productId: string,
  productData: ProductFormData,
  imageFile?: File,
  categoryIds?: string[],
  tagIds?: string[]
) {
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

    // Récupérer le produit existant
    const { data: existingProduct } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (!existingProduct) {
      return {
        success: false,
        error: "Produit introuvable",
      };
    }

    // Upload de la nouvelle image si fournie
    let imageUrl = productData.image_url;
    if (imageFile) {
      const uploadResult = await uploadProductImage(imageFile);
      if (uploadResult.error) {
        return {
          success: false,
          error: `Erreur upload image: ${uploadResult.error}`,
        };
      }
      imageUrl = uploadResult.url;

      // Supprimer l'ancienne image si elle existe
      if (existingProduct.image_url) {
        await deleteProductImage(existingProduct.image_url);
      }
    }

    // Vérifier que le slug est unique (sauf pour ce produit)
    if (productData.slug !== existingProduct.slug) {
      const { data: slugExists } = await supabase
        .from("products")
        .select("id")
        .eq("slug", productData.slug)
        .neq("id", productId)
        .single();

      if (slugExists) {
        return {
          success: false,
          error: "Ce slug existe déjà. Veuillez en choisir un autre.",
        };
      }
    }

    // Mettre à jour le produit
    const { data, error } = await supabase
      .from("products")
      .update({
        name: productData.name,
        slug: productData.slug,
        brand: productData.brand,
        description: productData.description,
        price: productData.price,
        stock: productData.stock,
        image_url: imageUrl,
      })
      .eq("id", productId)
      .select()
      .single();

    if (error) {
      console.error("❌ Erreur mise à jour produit:", error.message);
      return {
        success: false,
        error: error.message,
      };
    }

    // Mettre à jour les relations catégories et tags
    // 1. Supprimer les anciennes relations
    await Promise.all([
      supabase.from("product_categories").delete().eq("product_id", productId),
      supabase.from("product_tags").delete().eq("product_id", productId),
    ]);

    // 2. Insérer les nouvelles relations catégories
    if (categoryIds && categoryIds.length > 0) {
      const categoryRelations = categoryIds.map((catId) => ({
        product_id: productId,
        category_id: catId,
      }));

      await supabase.from("product_categories").insert(categoryRelations);
    }

    // 3. Insérer les nouvelles relations tags
    if (tagIds && tagIds.length > 0) {
      const tagRelations = tagIds.map((tagId) => ({
        product_id: productId,
        tag_id: tagId,
      }));

      await supabase.from("product_tags").insert(tagRelations);
    }

    // Revalider les pages
    revalidatePath("/admin/products");
    revalidatePath("/");
    revalidatePath(`/product/${productData.slug}`);

    return {
      success: true,
      product: data,
      error: null,
    };
  } catch (error) {
    console.error("❌ Erreur inattendue updateProduct:", error);
    return {
      success: false,
      error: "Erreur lors de la mise à jour du produit",
    };
  }
}

/**
 * Supprimer un produit
 */
export async function deleteProduct(productId: string) {
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

    // Récupérer le produit pour supprimer son image
    const { data: product } = await supabase
      .from("products")
      .select("image_url")
      .eq("id", productId)
      .single();

    if (!product) {
      return {
        success: false,
        error: "Produit introuvable",
      };
    }

    // Supprimer le produit
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) {
      console.error("❌ Erreur suppression produit:", error.message);
      return {
        success: false,
        error: error.message,
      };
    }

    // Supprimer l'image du storage
    if (product.image_url) {
      await deleteProductImage(product.image_url);
    }

    // Revalider les pages
    revalidatePath("/admin/products");
    revalidatePath("/");

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error("❌ Erreur inattendue deleteProduct:", error);
    return {
      success: false,
      error: "Erreur lors de la suppression du produit",
    };
  }
}
