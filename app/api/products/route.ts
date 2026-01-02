import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/products
 * Récupérer tous les produits (publique)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Récupérer tous les produits
    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Erreur récupération produits:", error);
      return NextResponse.json(
        { error: "Erreur lors de la récupération des produits" },
        { status: 500 }
      );
    }

    return NextResponse.json(products || []);
  } catch (error: any) {
    console.error("❌ Erreur API GET /products:", error);
    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}

