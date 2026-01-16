"use client";

import Image from "next/image";
import Link from "next/link";
import WishlistButton from "@/components/ui/WishlistButton";
import { PRODUCT_PLACEHOLDER_BLUR } from "@/lib/image-placeholders";

/**
 * ProductCard - Carte produit minimaliste style Byredo
 *
 * Design :
 * - Image carrée avec fond gris clair
 * - Zoom subtil au hover
 * - Informations : Nom, Collection (discret), Prix
 * - Badge stock si rupture
 * - Bouton wishlist (cœur) en position absolue
 */
interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  collection: string;
  price: number;
  imageUrl?: string | null;
  stock?: number;
  isWishlisted?: boolean; // Si le produit est dans la wishlist
}

export default function ProductCard({
  id,
  name,
  slug,
  collection,
  price,
  imageUrl,
  stock = 0,
  isWishlisted = false,
}: ProductCardProps) {
  // Image placeholder si pas d'URL fournie
  const imageSrc =
    imageUrl ||
    "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800&auto=format&fit=crop";

  // Formatage du prix (centimes -> euros)
  const formattedPrice = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(price / 100);

  // Rupture de stock ?
  const isOutOfStock = stock === 0;

  return (
    <article
      className="group block"
      aria-label={`${name} - ${formattedPrice}${isOutOfStock ? " - Rupture de stock" : ""}`}
    >
      <Link
        href={`/product/${slug}`}
        className="block"
        aria-label={`Voir le produit ${name}`}
      >
        {/* Container Image */}
        <div className="relative w-full aspect-square overflow-hidden bg-[#f5f5f5]">
          <Image
            src={imageSrc}
            alt={`Photo du parfum ${name} de la collection ${collection}`}
            fill
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
            placeholder="blur"
            blurDataURL={PRODUCT_PLACEHOLDER_BLUR}
          />

          {/* Badge Rupture */}
          {isOutOfStock && (
            <div
              className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 z-10"
              role="status"
              aria-live="polite"
            >
              <span className="text-[10px] uppercase tracking-widest font-medium text-gray-600">
                Bientôt disponible
              </span>
            </div>
          )}

          {/* Bouton Wishlist */}
          <WishlistButton
            productId={id}
            initialIsActive={isWishlisted}
            variant="icon"
            productName={name}
          />
        </div>
      </Link>

      {/* Informations */}
      <Link href={`/product/${slug}`} tabIndex={-1} aria-hidden="true">
        <div className="mt-4 space-y-1">
          {/* Collection (discret) */}
          <p className="text-[10px] uppercase tracking-widest text-gray-500">
            {collection}
          </p>

          {/* Nom du produit */}
          <h3 className="text-sm font-medium uppercase tracking-wide text-black group-hover:underline underline-offset-4 transition-all">
            {name}
          </h3>

          {/* Prix */}
          <p className="text-sm text-black" aria-label={`Prix : ${formattedPrice}`}>
            {formattedPrice}
          </p>
        </div>
      </Link>
    </article>
  );
}


