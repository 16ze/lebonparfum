import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * PUT /api/admin/products/[id]
 * Mettre à jour un produit (Admin uniquement)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    // Vérifier que l'utilisateur est admin
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json(
        { error: "Accès refusé : Admin uniquement" },
        { status: 403 }
      );
    }

    // Récupérer les données
    const productData = await request.json();
    const productId = params.id;

    // Mettre à jour le produit
    const { data: updatedProduct, error: updateError } = await supabase
      .from("products")
      .update({
        name: productData.name,
        slug: productData.slug,
        brand: productData.brand,
        price: productData.price,
        stock: productData.stock,
        description: productData.description,
        notes_top: productData.notes_top,
        notes_heart: productData.notes_heart,
        notes_base: productData.notes_base,
        category: productData.category,
        image_url: productData.image_url,
      })
      .eq("id", productId)
      .select()
      .single();

    if (updateError) {
      console.error("❌ Erreur update produit:", updateError);
      return NextResponse.json(
        { error: "Erreur lors de la mise à jour" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Produit mis à jour",
      product: updatedProduct,
    });
  } catch (error: any) {
    console.error("❌ Erreur API PUT /products/[id]:", error);
    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/products/[id]
 * Supprimer un produit (Admin uniquement)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    // Vérifier que l'utilisateur est admin
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json(
        { error: "Accès refusé : Admin uniquement" },
        { status: 403 }
      );
    }

    const productId = params.id;

    // Supprimer le produit
    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (deleteError) {
      console.error("❌ Erreur suppression produit:", deleteError);
      return NextResponse.json(
        { error: "Erreur lors de la suppression" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Produit supprimé avec succès" });
  } catch (error: any) {
    console.error("❌ Erreur API DELETE /products/[id]:", error);
    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}

