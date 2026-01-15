import { createClient } from "@/utils/supabase/server";
import { createBuildClient } from "@/utils/supabase/build";
import { slugToCollectionName } from "@/lib/collections";
import ProductCard from "@/components/product/ProductCard";
import { getWishlistIds } from "@/app/wishlist/actions";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SITE_CONFIG, generateCollectionSchema } from "@/lib/metadata";

/**
 * Metadata dynamique pour la page collection avec Open Graph et Twitter Cards
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const collectionName = slugToCollectionName(slug);

  if (!collectionName) {
    return {
      title: "Collection introuvable",
    };
  }

  // Compter les produits de cette collection pour la description
  const supabase = createBuildClient();
  const { count } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("collection", collectionName)
    .eq("status", "published");

  const title = collectionName;
  const description = `Découvrez la collection ${collectionName} - Parfums de niche et dupes de luxe${count ? ` (${count} produit${count > 1 ? "s" : ""})` : ""}.`;
  const url = `${SITE_CONFIG.url}/collections/${slug}`;

  return {
    title,
    description,
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: SITE_CONFIG.name,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: url,
    },
  };
}

/**
 * Page Collection Dynamique - Server Component
 *
 * Affiche tous les produits d'une collection spécifique
 */
export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Next.js 15 : params est une Promise, on doit l'attendre
  const { slug } = await params;
  const supabase = await createClient();

  // Convertir le slug en nom de collection pour la requête DB
  const collectionName = slugToCollectionName(slug);

  // Si le slug n'existe pas dans le mapping, retourner 404
  if (!collectionName) {
    notFound();
  }

  // Récupérer tous les produits de la collection
  // Utilisation de eq pour une correspondance exacte (case-sensitive)
  // Le mapping garantit que collectionName correspond exactement au nom en DB
  // Filtre uniquement les produits publiés
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, slug, collection, price, image_url, stock")
    .eq("collection", collectionName)
    .eq("status", "published")
    .order("name", { ascending: true });

  // Gestion d'erreur
  if (error) {
    console.error("❌ Erreur lors de la récupération des produits:", error);
    notFound();
  }

  // Préparer les produits pour ProductCard
  const typedProducts = products || [];

  // Récupérer les IDs de la wishlist pour afficher l'état des cœurs
  const wishlistIds = await getWishlistIds();

  // Générer le Schema.org JSON-LD pour le SEO
  const collectionSchema = generateCollectionSchema({
    name: collectionName,
    description: null,
    slug: slug,
    productCount: typedProducts.length,
  });

  return (
    <main className="min-h-screen bg-white pt-[120px] pb-20">
      {/* Schema.org JSON-LD pour le SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <div className="max-w-[1800px] mx-auto px-4 md:px-8">
        {/* Header : Titre de la collection */}
        <div className="mb-16 md:mb-20 text-center">
          <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-widest text-black mb-4">
            {collectionName}
          </h1>
          <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-gray-400">
            {typedProducts.length} {typedProducts.length > 1 ? "parfums" : "parfum"}
          </p>
        </div>

        {/* Grille de produits */}
        {typedProducts.length === 0 ? (
          // Empty State : Collection vide
          <div className="text-center py-20">
            <p className="text-sm uppercase tracking-widest text-gray-400 mb-2">
              Collection vide
            </p>
            <p className="text-xs text-gray-500">
              Aucun produit disponible dans cette collection pour le moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {typedProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                slug={product.slug}
                collection={product.collection}
                price={Number(product.price)}
                imageUrl={product.image_url}
                stock={product.stock || 0}
                isWishlisted={wishlistIds.includes(product.id)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

