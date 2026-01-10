import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { createBuildClient } from "@/utils/supabase/build";
import ProductCard from "@/components/product/ProductCard";
import { getWishlistIds } from "@/app/wishlist/actions";

/**
 * Page Catégorie Dynamique - Liste des produits par catégorie
 *
 * Layout :
 * - Header avec nom de la catégorie + description
 * - Grille de produits filtrés par catégorie
 */

// Types
interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  collection: string;
  price: number;
  image_url: string | null;
  stock: number;
}

/**
 * generateStaticParams - Génère les slugs de catégories pour le SEO
 */
export async function generateStaticParams() {
  const supabase = createBuildClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("slug");

  return (
    categories?.map((category) => ({
      slug: category.slug,
    })) || []
  );
}

/**
 * generateMetadata - Métadonnées SEO dynamiques
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createBuildClient();

  const { data: category } = await supabase
    .from("categories")
    .select("name, description")
    .eq("slug", slug)
    .single();

  if (!category) {
    return {
      title: "Catégorie non trouvée | THE PARFUMERIEE",
    };
  }

  return {
    title: `${category.name} | THE PARFUMERIEE`,
    description: category.description || `Découvrez notre sélection de parfums ${category.name}.`,
  };
}

/**
 * Page Catégorie - Server Component
 */
export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  // Récupérer la catégorie
  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (categoryError || !category) {
    console.error("Erreur récupération catégorie:", categoryError);
    notFound();
  }

  const typedCategory = category as Category;

  // Récupérer les produits de cette catégorie via la table de liaison
  const { data: productRelations } = await supabase
    .from("product_categories")
    .select(`
      product_id,
      products (
        id,
        name,
        slug,
        collection,
        price,
        image_url,
        stock
      )
    `)
    .eq("category_id", typedCategory.id);

  // Extraire les produits depuis les relations
  const products = productRelations
    ?.map((rel: any) => rel.products)
    .filter(Boolean) as Product[] || [];

  // Récupérer les IDs de la wishlist
  const wishlistIds = await getWishlistIds();

  return (
    <main className="min-h-screen bg-white pt-[120px] pb-20">
      {/* Header Catégorie */}
      <div className="px-6 md:px-12 max-w-[1800px] mx-auto mb-12">
        {/* Image de catégorie (si disponible) */}
        {typedCategory.image_url && (
          <div className="relative w-full h-[300px] md:h-[400px] mb-8 overflow-hidden">
            <img
              src={typedCategory.image_url}
              alt={typedCategory.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Titre + Description */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-wide mb-4">
            {typedCategory.name}
          </h1>
          {typedCategory.description && (
            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
              {typedCategory.description}
            </p>
          )}
          <div className="mt-6 text-xs uppercase tracking-widest text-gray-400">
            {products.length} produit{products.length > 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Grille de Produits */}
      <div className="px-6 md:px-12 max-w-[1800px] mx-auto">
        {products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-sm text-gray-400 uppercase tracking-wider">
              Aucun parfum dans cette catégorie pour le moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                slug={product.slug}
                collection={product.collection}
                price={product.price}
                imageUrl={product.image_url}
                stock={product.stock}
                isWishlisted={wishlistIds.includes(product.id)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
