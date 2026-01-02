import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

/**
 * AuthGuard - Server Component pour protéger les routes
 *
 * Usage:
 * - Wrapper dans un layout ou une page
 * - Si requireAdmin=true, vérifie que l'user est admin
 * - Si non connecté ou non autorisé, redirige
 *
 * @param requireAdmin - Si true, vérifie que l'user est admin
 * @param children - Composants enfants à protéger
 */
export default async function AuthGuard({
  requireAdmin = false,
  children,
}: {
  requireAdmin?: boolean;
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Récupérer la session utilisateur
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // Si pas connecté, rediriger vers login
  if (!user || authError) {
    redirect("/login");
  }

  // Si admin requis, vérifier le profil
  if (requireAdmin) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    // En cas d'erreur ou si pas admin, rediriger
    if (profileError || !profile || !profile.is_admin) {
      redirect("/account/profile");
    }
  }

  // Tout est OK, afficher les enfants
  return <>{children}</>;
}
