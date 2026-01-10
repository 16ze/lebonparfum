import { createClient } from "@/utils/supabase/server";
import TagsTable from "@/components/admin/TagsTable";

/**
 * Page Admin - Gestion des tags
 *
 * Server Component qui récupère les données et les passe au composant client
 */
export default async function AdminTagsPage() {
  const supabase = await createClient();

  // Récupérer tous les tags
  const { data: tags, error } = await supabase
    .from("tags")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("❌ Erreur récupération tags:", error.message);
  }

  return <TagsTable tags={tags || []} />;
}
