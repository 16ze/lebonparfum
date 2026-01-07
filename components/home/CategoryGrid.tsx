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
  // Collections phares - 4 marques réelles
  const categories: Category[] = [
    {
      id: "1",
      name: "CASABLANCA",
      image: "https://placehold.co/600x800/F5F5F5/000000?text=CASABLANCA",
      link: "/collections/casablanca",
    },
    {
      id: "2",
      name: "CP KING ÉDITION",
      image: "https://placehold.co/600x800/F5F5F5/000000?text=CP+KING+%C3%89DITION",
      link: "/collections/cp-king",
    },
    {
      id: "3",
      name: "CP PARIS",
      image: "https://placehold.co/600x800/F5F5F5/000000?text=CP+PARIS",
      link: "/collections/cp-paris",
    },
    {
      id: "4",
      name: "NOTE 33",
      image: "https://placehold.co/600x800/F5F5F5/000000?text=NOTE+33",
      link: "/collections/note-33",
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
