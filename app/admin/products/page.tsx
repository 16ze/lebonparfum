import { createClient } from "@/utils/supabase/server";
import ProductsTable from "@/components/admin/ProductsTable";

/**
 * Page Admin - Gestion des produits
 *
 * Server Component qui récupère les données et les passe au composant client
 */
export default async function AdminProductsPage() {
  const supabase = await createClient();

  // Récupérer tous les produits
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Erreur récupération produits:", error.message);
  }

  return <ProductsTable products={products || []} />;
}
