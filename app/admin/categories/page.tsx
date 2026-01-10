import { createClient } from "@/utils/supabase/server";
import CategoriesTable from "@/components/admin/CategoriesTable";

/**
 * Page Admin - Gestion des catégories
 *
 * Server Component qui récupère les données et les passe au composant client
 */
export default async function AdminCategoriesPage() {
  const supabase = await createClient();

  // Récupérer toutes les catégories
  const { data: categories, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("❌ Erreur récupération catégories:", error.message);
  }

  return <CategoriesTable categories={categories || []} />;
}
