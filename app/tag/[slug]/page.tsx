import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { createBuildClient } from "@/utils/supabase/build";
import ProductCard from "@/components/product/ProductCard";
import { getWishlistIds } from "@/app/wishlist/actions";

/**
 * Page Tag Dynamique - Liste des produits par tag
 *
 * Layout :
 * - Header avec #nom-du-tag
 * - Grille de produits filtrés par tag
 */

// Types
interface Tag {
  id: string;
  name: string;
  slug: string;
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
 * generateStaticParams - Génère les slugs de tags pour le SEO
 */
export async function generateStaticParams() {
  const supabase = createBuildClient();

  const { data: tags } = await supabase
    .from("tags")
    .select("slug");

  return (
    tags?.map((tag) => ({
      slug: tag.slug,
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

  const { data: tag } = await supabase
    .from("tags")
    .select("name")
    .eq("slug", slug)
    .single();

  if (!tag) {
    return {
      title: "Tag non trouvé | THE PARFUMERIEE",
    };
  }

  return {
    title: `#${tag.name.toUpperCase()} | THE PARFUMERIEE`,
    description: `Découvrez notre sélection de parfums ${tag.name}.`,
  };
}

/**
 * Page Tag - Server Component
 */
export default async function TagPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  // Récupérer le tag
  const { data: tag, error: tagError } = await supabase
    .from("tags")
    .select("*")
    .eq("slug", slug)
    .single();

  if (tagError || !tag) {
    console.error("Erreur récupération tag:", tagError);
    notFound();
  }

  const typedTag = tag as Tag;

  // Récupérer les produits avec ce tag via la table de liaison
  const { data: productRelations } = await supabase
    .from("product_tags")
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
    .eq("tag_id", typedTag.id);

  // Extraire les produits depuis les relations
  const products = productRelations
    ?.map((rel: any) => rel.products)
    .filter(Boolean) as Product[] || [];

  // Récupérer les IDs de la wishlist
  const wishlistIds = await getWishlistIds();

  return (
    <main className="min-h-screen bg-white pt-[120px] pb-20">
      {/* Header Tag */}
      <div className="px-6 md:px-12 max-w-[1800px] mx-auto mb-12">
        <div className="text-center max-w-3xl mx-auto">
          {/* Titre avec hashtag */}
          <div className="mb-4">
            <span className="text-xs uppercase tracking-widest text-gray-400 block mb-2">
              Tag
            </span>
            <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-wide">
              #{typedTag.name}
            </h1>
          </div>

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
              Aucun parfum avec ce tag pour le moment.
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
