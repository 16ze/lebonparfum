import Hero from "@/components/home/Hero";
import CategoryGrid from "@/components/home/CategoryGrid";
import HighlightSection from "@/components/home/HighlightSection";
import Showcase from "@/components/home/Showcase";
import CampaignVideo from "@/components/home/CampaignVideo";
import Services from "@/components/home/Services";

export default function Home() {
  return (
    <main>
      <Hero />
      <CategoryGrid />
      <CampaignVideo />
      <Showcase />
      <HighlightSection />
      
      <Services />
    </main>
  );
}
