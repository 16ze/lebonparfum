import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import AccountSidebar from "@/components/account/AccountSidebar";

/**
 * Layout Account - Espace client
 *
 * Design Byredo :
 * - Sidebar fixe à gauche (navigation)
 * - Content à droite (scrollable)
 * - Mobile : Stack vertical
 */
export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Vérifier l'authentification
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // Si pas connecté, rediriger vers login
  if (!user || authError) {
    redirect("/login");
  }

  // Récupérer le profil
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, full_name, is_admin")
    .eq("id", user.id)
    .single();

  // En cas d'erreur profil, rediriger vers login
  if (profileError || !profile) {
    console.error("❌ Erreur récupération profil:", profileError?.message);
    redirect("/login");
  }

  // Si admin, rediriger vers admin dashboard
  if (profile.is_admin) {
    redirect("/admin/dashboard");
  }

  return (
    <div className="min-h-screen bg-white pt-20">
      {" "}
      {/* pt-20 pour compenser le header fixe */}
      <div className="flex flex-col md:flex-row">
        {/* Sidebar Navigation */}
        <AccountSidebar user={profile} />

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-12">{children}</main>
      </div>
    </div>
  );
}

