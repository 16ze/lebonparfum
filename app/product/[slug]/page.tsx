import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { createBuildClient } from "@/utils/supabase/build";
import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
import ProductCard from "@/components/product/ProductCard";
import { getWishlistIds } from "@/app/wishlist/actions";
import {
  generateProductMetadata,
  generateProductSchema,
  generateOrganizationSchema,
} from "@/lib/metadata";

/**
 * Page Produit Dynamique - Style Byredo/Aesop
 *
 * Layout :
 * - Desktop : Split Screen (60% galerie gauche, 40% infos droite sticky)
 * - Mobile : Stack vertical (galerie slider en haut, infos en bas)
 * - Section Cross-selling : "Vous aimerez aussi" avec produits de la même collection
 */

// Types pour les données produit
interface Product {
  id: string;
  name: string;
  slug: string;
  collection: string;
  price: number;
  description: string | null;
  notes: string | null;
  inspiration: string | null;
  image_url: string | null;
  stock: number;
  category: string | null;
  variants?: Array<{
    label: string;
    price: number; // En centimes
    stock: number;
  }> | null;
  product_categories?: Array<{
    categories: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
  product_tags?: Array<{
    tags: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
}

/**
 * generateStaticParams - Génère les slugs statiques pour le SEO
 *
 * Récupère tous les slugs depuis Supabase pour pré-générer les pages au build
 *
 * IMPORTANT : Utilise createBuildClient() car generateStaticParams s'exécute
 * au build time (pas de contexte de requête, donc pas de cookies)
 */
export async function generateStaticParams() {
  const supabase = createBuildClient();

  const { data: products, error } = await supabase
    .from("products")
    .select("slug");

  if (error) {
    console.error("Erreur lors de la récupération des slugs:", error);
    return [];
  }

  return (
    products?.map((product) => ({
      slug: product.slug,
    })) || []
  );
}

/**
 * generateMetadata - Génère les métadonnées SEO dynamiques
 *
 * Utilise generateProductMetadata() depuis lib/metadata.ts
 * pour générer des métadonnées complètes (OpenGraph, Twitter Cards, etc.)
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createBuildClient();

  const { data: product } = await supabase
    .from("products")
    .select("name, brand, description, price, image_url, stock, slug, meta_title, meta_description, status")
    .eq("slug", slug)
    .single();

  // Si produit inexistant ou non publié, retourner metadata par défaut
  if (!product || product.status !== "published") {
    return {
      title: "Produit non trouvé",
    };
  }

  // Générer les métadonnées avec notre helper
  // Utilise les champs SEO personnalisés si disponibles, sinon fallback sur auto-génération
  // Note: generateProductMetadata attend le prix en centimes (pas de division par 100)
  return generateProductMetadata({
    name: product.name,
    brand: product.brand,
    description: product.description,
    price: Number(product.price), // Prix déjà en centimes dans la DB
    image: product.image_url,
    slug: product.slug,
    inStock: product.stock > 0,
    meta_title: product.meta_title,
    meta_description: product.meta_description,
  });
}

/**
 * Page Produit - Server Component async
 *
 * Récupère les données du produit et les produits similaires depuis Supabase
 */
export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Next.js 15 : params est une Promise, on doit l'attendre
  const { slug } = await params;
  const supabase = await createClient();

  // Récupérer le produit depuis Supabase avec ses catégories et tags
  const { data: product, error } = await supabase
    .from("products")
    .select(`
      *,
      product_categories (
        categories ( id, name, slug )
      ),
      product_tags (
        tags ( id, name, slug )
      )
    `)
    .eq("slug", slug)
    .single();

  // Gestion d'erreur : produit non trouvé OU non publié
  if (error || !product) {
    console.error("❌ [SERVER] Erreur ProductPage:", {
      slug,
      error: error?.message || "Produit non trouvé",
      code: error?.code,
    });
    notFound();
  }

  // CRITIQUE: Bloquer l'accès aux produits non publiés
  // Les clients ne doivent voir que les produits "published"
  if (product.status !== "published") {
    console.warn(`Tentative d'accès à un produit ${product.status}:`, slug);
    notFound();
  }

  // Cast le produit pour TypeScript
  const typedProduct = product as Product;

  // Récupérer les produits similaires publiés (même collection, excluant le produit actuel)
  const { data: relatedProducts } = await supabase
    .from("products")
    .select("id, name, slug, collection, price, image_url, stock")
    .eq("collection", typedProduct.collection)
    .eq("status", "published")
    .neq("slug", slug)
    .limit(4);

  // Formater le prix (ex: 3000 centimes -> "30,00 €")
  const formattedPrice = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(Number(typedProduct.price) / 100);

  // Préparer les images (pour l'instant, on utilise une image placeholder si image_url est null)
  const images = typedProduct.image_url
    ? [typedProduct.image_url]
    : [
        "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1615634260167-c8cdede054de?q=80&w=800&auto=format&fit=crop",
      ];

  // Récupérer les variantes depuis la base de données
  // Si le produit a des variantes, les utiliser, sinon créer des variantes par défaut
  const productVariants = typedProduct.variants && Array.isArray(typedProduct.variants) && typedProduct.variants.length > 0
    ? typedProduct.variants.map((v: any, index: number) => ({
        id: `variant-${index}`,
        label: v.label || "50ml",
        value: v.label || "50ml",
        price: Number(v.price) || typedProduct.price, // Prix en centimes
        stock: Number(v.stock) || 0,
      }))
    : [
        { 
          id: "default", 
          label: "50ML", 
          value: "50ml",
          price: Number(typedProduct.price),
          stock: typedProduct.stock,
        },
      ];

  // Récupérer les IDs de la wishlist pour afficher l'état des cœurs
  const wishlistIds = await getWishlistIds();
  const isWishlisted = wishlistIds.includes(typedProduct.id);

  // Générer le Schema.org JSON-LD pour le SEO
  const productSchema = generateProductSchema({
    name: typedProduct.name,
    brand: typedProduct.collection,
    description: typedProduct.description || `Découvrez ${typedProduct.name}, un parfum de niche d'exception.`,
    price: Number(typedProduct.price) / 100,
    image: typedProduct.image_url,
    slug: typedProduct.slug,
    inStock: typedProduct.stock > 0,
    sku: typedProduct.id,
  });

  const organizationSchema = generateOrganizationSchema();

  return (
    <main className="min-h-screen bg-white pt-[120px] pb-20">
      {/* Schema.org JSON-LD pour le SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      {/* Section Principale : Galerie + Infos */}
      <div className="px-6 md:px-12 max-w-[1800px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-12">
        {/* ZONE 1 : Galerie (Col 1 -> 7 sur Desktop) */}
        <div className="md:col-span-7">
          <ProductGallery images={images} productName={typedProduct.name} />
        </div>

        {/* ZONE 2 : Infos Produit (Col 8 -> 12 sur Desktop, Sticky) */}
        <div className="md:col-span-5">
          <ProductInfo
            productId={typedProduct.id || typedProduct.slug}
            slug={typedProduct.slug}
            collection={typedProduct.collection}
            title={typedProduct.name}
            price={formattedPrice}
            priceNumeric={Number(typedProduct.price) / 100}
            description={typedProduct.description || ""}
            variants={productVariants}
            image={typedProduct.image_url || images[0]}
            stock={typedProduct.stock}
            notes={typedProduct.notes || undefined}
            ingredients={undefined}
            shipping="Livraison gratuite à partir de 100€ d'achat. Retours acceptés sous 14 jours. Emballage premium inclus."
            isWishlisted={isWishlisted}
            categories={typedProduct.product_categories?.map(pc => pc.categories)}
            tags={typedProduct.product_tags?.map(pt => pt.tags)}
          />
        </div>
      </div>

      {/* Section Cross-Selling : "Vous aimerez aussi" */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="mt-24 px-6 md:px-12">
          <div className="max-w-[1800px] mx-auto">
            {/* Titre de section */}
            <div className="mb-12 text-center">
              <h2 className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-2">
                Vous aimerez aussi
              </h2>
              <p className="text-2xl md:text-3xl font-bold uppercase tracking-wide">
                De la même collection
              </p>
            </div>

            {/* Grille de produits */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {relatedProducts.slice(0, 4).map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  id={relatedProduct.id}
                  name={relatedProduct.name}
                  slug={relatedProduct.slug}
                  collection={relatedProduct.collection}
                  price={relatedProduct.price}
                  imageUrl={relatedProduct.image_url}
                  stock={relatedProduct.stock}
                  isWishlisted={wishlistIds.includes(relatedProduct.id)}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
