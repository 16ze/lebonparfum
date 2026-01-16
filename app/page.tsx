import Hero from "@/components/home/Hero";
import CategoryGrid from "@/components/home/CategoryGrid";
import HighlightSection from "@/components/home/HighlightSection";
import Showcase from "@/components/home/Showcase";
import CampaignVideo from "@/components/home/CampaignVideo";
import Services from "@/components/home/Services";
import type { Metadata } from "next";
import { SITE_CONFIG, generateOrganizationSchema, generateWebSiteSchema } from "@/lib/metadata";

/**
 * Metadata pour la page d'accueil
 */
export const metadata: Metadata = {
  title: SITE_CONFIG.title,
  description: SITE_CONFIG.description,
  openGraph: {
    type: "website",
    locale: SITE_CONFIG.locale,
    url: SITE_CONFIG.url,
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    siteName: SITE_CONFIG.name,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
  },
};

export default function Home() {
  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebSiteSchema();

  return (
    <>
      {/* Schema.org JSON-LD pour le SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    <main>
      <Hero />
      <CategoryGrid />
      <CampaignVideo />
      <Showcase />
      <HighlightSection />
      
      <Services />
    </main>
    </>
  );
}
