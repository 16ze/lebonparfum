import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/types/category";

interface CategoryCardProps {
  category: Category;
}

/**
 * CategoryCard - Carte de collection style Louis Vuitton
 *
 * Design :
 * - Image portrait (aspect-[4/5])
 * - Fond loading subtil (#f9f9f9)
 * - Zoom au hover (scale-105, 700ms)
 * - Texte centré sous l'image
 * - Typographie : text-xs (mobile) → text-sm (desktop)
 */
export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={category.link} className="group block">
      {/* Image Container */}
      <div className="relative w-full aspect-[4/5] overflow-hidden bg-[#f9f9f9]">
        <Image
          src={category.image}
          alt={category.name}
          fill
          className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          sizes="(max-width: 1024px) 50vw, 25vw"
        />
      </div>

      {/* Texte sous l'image */}
      <div className="mt-3 text-center">
        <h3 className="text-xs md:text-sm font-medium uppercase tracking-widest text-black">
          {category.name}
        </h3>
      </div>
    </Link>
  );
}
