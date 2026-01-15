import { Metadata } from "next";

/**
 * Configuration des metadata SEO pour l'application
 *
 * Utilisé pour générer:
 * - Meta tags HTML classiques
 * - Open Graph (Facebook, LinkedIn)
 * - Twitter Cards
 * - Metadata Next.js
 */

// Configuration du site
export const SITE_CONFIG = {
  name: "Le Bon Parfum",
  title: "Le Bon Parfum - Parfums de Niche & Collections Exclusives",
  description:
    "Découvrez notre sélection exclusive de parfums de niche. Collections rares, créateurs indépendants et fragrances d'exception. Livraison offerte dès 100€.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://lebonparfum.com",
  locale: "fr_FR",
  type: "website",

  // Réseaux sociaux
  social: {
    twitter: "@lebonparfum",
    instagram: "@lebonparfum",
  },

  // Contact
  contact: {
    email: "contact@lebonparfum.com",
    phone: "+33 1 23 45 67 89",
  },

  // Entreprise
  company: {
    name: "Le Bon Parfum SARL",
    legalName: "Le Bon Parfum",
    address: {
      streetAddress: "123 Rue de la Paix",
      addressLocality: "Paris",
      postalCode: "75002",
      addressCountry: "FR",
    },
  },
};

/**
 * Metadata par défaut pour toutes les pages
 */
export const DEFAULT_METADATA: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: SITE_CONFIG.title,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  keywords: [
    "parfum de niche",
    "parfumerie",
    "fragrance",
    "parfum exclusif",
    "parfum rare",
    "eau de parfum",
    "parfum artisanal",
    "créateurs parfumeurs",
  ],
  authors: [{ name: SITE_CONFIG.name }],
  creator: SITE_CONFIG.name,
  publisher: SITE_CONFIG.name,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: SITE_CONFIG.locale,
    url: SITE_CONFIG.url,
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: SITE_CONFIG.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    site: SITE_CONFIG.social.twitter,
    creator: SITE_CONFIG.social.twitter,
    images: ["/twitter-image.jpg"],
  },
  alternates: {
    canonical: SITE_CONFIG.url,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

/**
 * Génère les metadata pour une page produit
 */
export function generateProductMetadata({
  name,
  brand,
  description,
  price,
  image,
  slug,
  inStock,
}: {
  name: string;
  brand: string;
  description?: string | null;
  price: number;
  image?: string | null;
  slug: string;
  inStock: boolean;
}): Metadata {
  const url = `${SITE_CONFIG.url}/product/${slug}`;
  const title = `${name} - ${brand}`;
  const formattedPrice = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(price / 100);

  const metaDescription =
    description
      ?.replace(/<[^>]*>/g, "") // Strip HTML
      .slice(0, 155) || `${name} par ${brand}. ${formattedPrice}. ${inStock ? "En stock" : "Rupture de stock"}.`;

  return {
    title,
    description: metaDescription,
    openGraph: {
      type: "product",
      url,
      title,
      description: metaDescription,
      images: image
        ? [
            {
              url: image,
              width: 800,
              height: 800,
              alt: name,
            },
          ]
        : [],
      siteName: SITE_CONFIG.name,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: metaDescription,
      images: image ? [image] : [],
    },
    alternates: {
      canonical: url,
    },
  };
}

/**
 * Génère les metadata pour une page catégorie
 */
export function generateCategoryMetadata({
  name,
  description,
  slug,
  image,
  productCount,
}: {
  name: string;
  description?: string | null;
  slug: string;
  image?: string | null;
  productCount?: number;
}): Metadata {
  const url = `${SITE_CONFIG.url}/category/${slug}`;
  const title = `${name} - Collection`;
  const metaDescription =
    description?.replace(/<[^>]*>/g, "").slice(0, 155) ||
    `Découvrez notre collection ${name}${productCount ? ` (${productCount} produits)` : ""}.`;

  return {
    title,
    description: metaDescription,
    openGraph: {
      type: "website",
      url,
      title,
      description: metaDescription,
      images: image
        ? [
            {
              url: image,
              width: 1200,
              height: 630,
              alt: name,
            },
          ]
        : [],
    },
    alternates: {
      canonical: url,
    },
  };
}

/**
 * Génère le JSON-LD Schema.org pour un produit
 */
export function generateProductSchema({
  name,
  brand,
  description,
  price,
  image,
  slug,
  inStock,
  sku,
}: {
  name: string;
  brand: string;
  description?: string | null;
  price: number;
  image?: string | null;
  slug: string;
  inStock: boolean;
  sku?: string;
}) {
  const url = `${SITE_CONFIG.url}/product/${slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    brand: {
      "@type": "Brand",
      name: brand,
    },
    description: description?.replace(/<[^>]*>/g, "") || name,
    image: image || undefined,
    url,
    sku: sku || slug,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "EUR",
      price: (price / 100).toFixed(2),
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: SITE_CONFIG.company.name,
      },
    },
  };
}

/**
 * Génère le JSON-LD Schema.org pour l'organisation
 */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_CONFIG.company.name,
    legalName: SITE_CONFIG.company.legalName,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/logo.png`,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: SITE_CONFIG.contact.phone,
      email: SITE_CONFIG.contact.email,
      contactType: "customer service",
      availableLanguage: ["French"],
    },
    address: {
      "@type": "PostalAddress",
      ...SITE_CONFIG.company.address,
    },
    sameAs: [
      `https://twitter.com/${SITE_CONFIG.social.twitter.replace("@", "")}`,
      `https://instagram.com/${SITE_CONFIG.social.instagram.replace("@", "")}`,
    ],
  };
}

/**
 * Génère le JSON-LD Schema.org pour la recherche sur site
 */
export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_CONFIG.url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Génère le JSON-LD Schema.org pour une collection de produits
 */
export function generateCollectionSchema({
  name,
  description,
  slug,
  productCount,
}: {
  name: string;
  description?: string | null;
  slug: string;
  productCount?: number;
}) {
  const url = `${SITE_CONFIG.url}/collections/${slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description: description?.replace(/<[^>]*>/g, "") || `Collection ${name}`,
    url,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: productCount || 0,
      itemListElement: {
        "@type": "ListItem",
        position: 1,
        name: `Produits de la collection ${name}`,
      },
    },
  };
}

/**
 * Génère le JSON-LD Schema.org pour une catégorie
 */
export function generateCategorySchema({
  name,
  description,
  slug,
  productCount,
}: {
  name: string;
  description?: string | null;
  slug: string;
  productCount?: number;
}) {
  const url = `${SITE_CONFIG.url}/category/${slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description: description?.replace(/<[^>]*>/g, "") || `Catégorie ${name}`,
    url,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: productCount || 0,
      itemListElement: {
        "@type": "ListItem",
        position: 1,
        name: `Produits de la catégorie ${name}`,
      },
    },
  };
}
