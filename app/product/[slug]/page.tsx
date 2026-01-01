import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { createBuildClient } from "@/utils/supabase/build";
import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";

/**
 * Page Produit Dynamique - Style Byredo/Aesop
 *
 * Layout :
 * - Desktop : Split Screen (60% galerie gauche, 40% infos droite sticky)
 * - Mobile : Stack vertical (galerie slider en haut, infos en bas)
 */

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

  return products?.map((product) => ({
    slug: product.slug,
  })) || [];
}

/**
 * Page Produit - Server Component async
 * 
 * Récupère les données du produit depuis Supabase
 */
export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Next.js 15 : params est une Promise, on doit l'attendre
  const { slug } = await params;
  const supabase = createClient();

  // Récupérer le produit depuis Supabase
  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();

  // Gestion d'erreur : produit non trouvé
  if (error || !product) {
    console.error("Erreur lors de la récupération du produit:", error);
    notFound();
  }

  // Formater le prix (ex: 15.00 -> "15,00 €")
  const formattedPrice = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(Number(product.price));

  // Préparer les images (pour l'instant, on utilise une image placeholder si image_url est null)
  const images = product.image_url
    ? [product.image_url]
    : [
        "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1615634260167-c8cdede054de?q=80&w=800&auto=format&fit=crop",
      ];

  // Variantes par défaut (à adapter selon vos besoins)
  const variants = [
    { id: "50ml", label: "50ML", value: "50ml" },
    { id: "100ml", label: "100ML", value: "100ml" },
  ];

  return (
    <main className="min-h-screen bg-white pt-[120px] pb-20 px-6 md:px-12">
      <div className="max-w-[1800px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-12">
        {/* ZONE 1 : Galerie (Col 1 -> 7 sur Desktop) */}
        <div className="md:col-span-7">
          <ProductGallery images={images} productName={product.name} />
        </div>

        {/* ZONE 2 : Infos Produit (Col 8 -> 12 sur Desktop, Sticky) */}
        <div className="md:col-span-5">
          <ProductInfo
            productId={product.id || product.slug} // ID unique (UUID ou slug en fallback)
            slug={product.slug}
            collection={product.collection}
            title={product.name}
            price={formattedPrice}
            priceNumeric={Number(product.price)}
            description={product.description || ""}
            variants={variants}
            image={product.image_url || images[0]} // Première image du produit
            notes={product.notes || undefined}
            ingredients={undefined}
            shipping="Livraison gratuite à partir de 100€ d'achat. Retours acceptés sous 14 jours. Emballage premium inclus."
          />
        </div>
      </div>
    </main>
  );
}
