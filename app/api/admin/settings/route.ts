import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/admin/settings
 * Récupérer les paramètres du site
 */
export async function GET(request: NextRequest) {
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

    // Récupérer tous les settings
    const { data: settings, error } = await supabase
      .from("site_settings")
      .select("*");

    if (error) {
      console.error("❌ Erreur récupération settings:", error);
      return NextResponse.json(
        { error: "Erreur lors de la récupération" },
        { status: 500 }
      );
    }

    // Transformer en objet
    const settingsObj: Record<string, string> = {};
    settings?.forEach((setting) => {
      settingsObj[setting.key] = setting.value || "";
    });

    return NextResponse.json(settingsObj);
  } catch (error: any) {
    console.error("❌ Erreur API GET /settings:", error);
    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/settings
 * Mettre à jour les paramètres du site
 */
export async function PUT(request: NextRequest) {
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

    // Récupérer les nouvelles valeurs
    const newSettings = await request.json();

    // Mettre à jour chaque setting (upsert)
    for (const [key, value] of Object.entries(newSettings)) {
      const { error } = await supabase
        .from("site_settings")
        .upsert({ key, value: value as string }, { onConflict: "key" });

      if (error) {
        console.error(`❌ Erreur update setting ${key}:`, error);
        throw new Error(`Échec mise à jour de ${key}`);
      }
    }

    return NextResponse.json({ message: "Paramètres mis à jour avec succès" });
  } catch (error: any) {
    console.error("❌ Erreur API PUT /settings:", error);
    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}

