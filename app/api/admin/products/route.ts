import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/admin/products
 * Créer un nouveau produit (Admin uniquement)
 */
export async function POST(request: NextRequest) {
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

    // Vérifier le rôle admin
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

    // Récupérer les données du produit
    const productData = await request.json();

    // Validation basique
    if (!productData.name || !productData.slug || !productData.price) {
      return NextResponse.json(
        { error: "Données manquantes (name, slug, price requis)" },
        { status: 400 }
      );
    }

    // Insérer le produit
    const { data: newProduct, error: insertError } = await supabase
      .from("products")
      .insert([
        {
          name: productData.name,
          slug: productData.slug,
          brand: productData.brand,
          price: productData.price,
          stock: productData.stock || 0,
          description: productData.description,
          notes_top: productData.notes_top,
          notes_heart: productData.notes_heart,
          notes_base: productData.notes_base,
          category: productData.category,
          image_url: productData.image_url,
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error("❌ Erreur insertion produit:", insertError);
      return NextResponse.json(
        { error: "Erreur lors de la création du produit" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Produit créé avec succès", product: newProduct },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Erreur API POST /products:", error);
    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}

