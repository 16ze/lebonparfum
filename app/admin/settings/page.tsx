import { createClient } from "@/utils/supabase/server";
import SettingsForm from "@/components/admin/SettingsForm";

/**
 * Page Admin - Paramètres du site
 *
 * Server Component qui récupère les paramètres actuels
 */
export default async function AdminSettingsPage() {
  const supabase = await createClient();

  // Récupérer tous les paramètres
  const { data: settings, error } = await supabase
    .from("site_settings")
    .select("*");

  if (error) {
    console.error("❌ Erreur récupération settings:", error.message);
  }

  // Convertir en objet key-value pour faciliter l'usage
  const settingsMap: Record<string, string> = {};
  settings?.forEach((setting) => {
    settingsMap[setting.setting_key] = setting.setting_value || "";
  });

  return <SettingsForm settings={settingsMap} />;
}
