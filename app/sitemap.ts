import { MetadataRoute } from "next";
import { createBuildClient } from "@/utils/supabase/build";
import { SITE_CONFIG } from "@/lib/metadata";

/**
 * Génère le sitemap.xml dynamique pour le SEO
 *
 * Next.js génère automatiquement /sitemap.xml à partir de ce fichier
 * Le sitemap est regénéré à chaque build (ISR possible avec revalidate)
 *
 * Structure:
 * - Pages statiques (home, about, contact)
 * - Pages produits dynamiques (depuis DB)
 * - Pages catégories dynamiques (depuis DB)
 * - Pages tags dynamiques (depuis DB)
 */

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createBuildClient();
  const baseUrl = SITE_CONFIG.url;

  // Pages statiques
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/collections/perfume-oils`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/collections/discovery-sets`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/collections/gift-sets`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/collections/travel-size`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // Récupérer tous les produits publiés uniquement
  const { data: products } = await supabase
    .from("products")
    .select("slug, updated_at")
    .eq("status", "published")
    .order("updated_at", { ascending: false });

  const productPages: MetadataRoute.Sitemap =
    products?.map((product) => ({
      url: `${baseUrl}/product/${product.slug}`,
      lastModified: new Date(product.updated_at || Date.now()),
      changeFrequency: "weekly",
      priority: 0.7,
    })) || [];

  // Récupérer toutes les catégories
  const { data: categories } = await supabase
    .from("categories")
    .select("slug, updated_at")
    .order("name");

  const categoryPages: MetadataRoute.Sitemap =
    categories?.map((category) => ({
      url: `${baseUrl}/category/${category.slug}`,
      lastModified: new Date(category.updated_at || Date.now()),
      changeFrequency: "weekly",
      priority: 0.8,
    })) || [];

  // Récupérer tous les tags
  const { data: tags } = await supabase
    .from("tags")
    .select("slug, updated_at")
    .order("name");

  const tagPages: MetadataRoute.Sitemap =
    tags?.map((tag) => ({
      url: `${baseUrl}/tag/${tag.slug}`,
      lastModified: new Date(tag.updated_at || Date.now()),
      changeFrequency: "weekly",
      priority: 0.6,
    })) || [];

  // Combiner toutes les pages
  return [...staticPages, ...productPages, ...categoryPages, ...tagPages];
}

/**
 * Configuration ISR (Incremental Static Regeneration)
 * Regenere le sitemap toutes les 24 heures
 */
export const revalidate = 86400; // 24 heures en secondes
