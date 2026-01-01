import CategoryCard from "./CategoryCard";
import type { Category } from "@/types/category";

/**
 * CategoryGrid - Grille de collections style Louis Vuitton
 *
 * Responsive :
 * - Mobile : 2 colonnes (2x2 grid visible immédiatement)
 * - Desktop : 4 colonnes (tout sur une ligne)
 *
 * Spacing :
 * - gap-x-3 (horizontal serré sur mobile)
 * - gap-y-10 (vertical large pour séparer les lignes)
 * - md:gap-6 (uniforme sur desktop)
 */
export default function CategoryGrid() {
  // Mock Data - 4 Catégories principales
  const categories: Category[] = [
    {
      id: "1",
      name: "Parfums",
      image: "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=2000&auto=format&fit=crop",
      link: "/collections/parfums",
    },
    {
      id: "2",
      name: "Soins Corps",
      image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=2000&auto=format&fit=crop",
      link: "/collections/soins-corps",
    },
    {
      id: "3",
      name: "Maison",
      image: "https://images.unsplash.com/photo-1602874801006-94c0a7c13b6f?q=80&w=2000&auto=format&fit=crop",
      link: "/collections/maison",
    },
    {
      id: "4",
      name: "Accessoires",
      image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=2000&auto=format&fit=crop",
      link: "/collections/accessoires",
    },
  ];

  return (
    <section className="w-full py-16 md:py-20 px-4 md:px-8 bg-white">
      {/* Titre de section discret */}
      <div className="max-w-[1600px] mx-auto mb-10 md:mb-12">
        <h2 className="text-xs md:text-sm uppercase tracking-[0.2em] text-black/60 text-center">
          Découvrir
        </h2>
      </div>

      {/* Grille 2 colonnes mobile → 4 colonnes desktop */}
      <div className="max-w-[1600px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-10 md:gap-6">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </section>
  );
}
