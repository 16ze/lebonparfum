import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import AccountNav from "@/components/account/AccountNav";

/**
 * Layout Espace Client
 *
 * Protégé par authentification
 * Sidebar navigation + Zone de contenu
 *
 * Design Byredo : Layout minimal avec navigation latérale
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
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  // Récupérer les infos du profil
  const { data: profile } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-white">
      {/* Container principal */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <AccountNav
              userName={profile?.full_name || profile?.email || "Mon compte"}
            />
          </div>

          {/* Contenu principal */}
          <div className="lg:col-span-3">{children}</div>
        </div>
      </div>
    </div>
  );
}

