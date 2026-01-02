import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

/**
 * Page Account - Redirection intelligente selon le rôle
 *
 * Logique :
 * - Non connecté -> Redirige vers /login
 * - Connecté + Admin -> Redirige vers /admin/dashboard
 * - Connecté + Client -> Redirige vers /account/profile
 */
export default async function AccountPage() {
  const supabase = createClient();

  // Récupérer la session utilisateur
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // Si pas connecté, rediriger vers login
  if (!user || authError) {
    redirect("/login");
  }

  // Récupérer le profil pour vérifier is_admin
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  // En cas d'erreur, rediriger vers login (sécurité)
  if (profileError || !profile) {
    redirect("/login");
  }

  // Redirection selon le rôle
  if (profile.is_admin) {
    // Admin -> Dashboard admin
    redirect("/admin/dashboard");
  } else {
    // Client -> Profil client
    redirect("/account/profile");
  }
}

