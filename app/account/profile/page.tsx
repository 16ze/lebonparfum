import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ProfileForm from "@/components/account/ProfileForm";

/**
 * Page Profile - Informations personnelles
 *
 * Features :
 * - Affichage des infos utilisateur
 * - Modification nom complet
 * - Modification email (avec reconfirmation)
 * - Modification mot de passe
 */
export default async function ProfilePage() {
  const supabase = await createClient();

  // Récupérer l'utilisateur
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (!user || authError) {
    redirect("/login");
  }

  // Récupérer le profil
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, full_name, created_at")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    console.error("❌ Erreur récupération profil:", profileError?.message);
    redirect("/login");
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-2xl md:text-3xl uppercase tracking-widest font-bold mb-2">
          Mon Profil
        </h1>
        <p className="text-sm text-gray-500">
          Gérez vos informations personnelles et vos paramètres de compte
        </p>
      </div>

      {/* Formulaire de profil */}
      <ProfileForm profile={profile} />
    </div>
  );
}

