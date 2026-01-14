"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { PRODUCT_PLACEHOLDER_BLUR } from "@/lib/image-placeholders";

/**
 * ProductGallery - Galerie d'images produit
 *
 * Design :
 * - Mobile : Swiper carousel
 * - Desktop : Grille asymétrique (1 grande + 2 moyennes)
 * - Fond gris clair #F9F9F9
 */
interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductGallery({
  images,
  productName,
}: ProductGalleryProps) {
  return (
    <>
      {/* Mobile : Swiper */}
      <div className="md:hidden">
        <Swiper
          modules={[Pagination]}
          slidesPerView={1}
          spaceBetween={0}
          pagination={{ clickable: true }}
          className="product-gallery-swiper"
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <div className="relative w-full aspect-square bg-[#F9F9F9]">
                <Image
                  src={image}
                  alt={`${productName} - Image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  quality={90}
                  placeholder="blur"
                  blurDataURL={PRODUCT_PLACEHOLDER_BLUR}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Desktop : Grille asymétrique */}
      <div className="hidden md:block space-y-4">
        {/* Image principale (grande) */}
        <div className="relative w-full aspect-[4/5] bg-[#F9F9F9]">
          <Image
            src={images[0]}
            alt={`${productName} - Image principale`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 60vw"
            quality={90}
            placeholder="blur"
            blurDataURL={PRODUCT_PLACEHOLDER_BLUR}
          />
        </div>

        {/* Images secondaires (2 moyennes) */}
        {images.length > 1 && (
          <div className="grid grid-cols-2 gap-4">
            {images.slice(1, 3).map((image, index) => (
              <div
                key={index + 1}
                className="relative w-full aspect-square bg-[#F9F9F9]"
              >
                <Image
                  src={image}
                  alt={`${productName} - Image ${index + 2}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 30vw"
                  quality={90}
                  placeholder="blur"
                  blurDataURL={PRODUCT_PLACEHOLDER_BLUR}
                />
              </div>
            ))}
          </div>
        )}

        {/* Images supplémentaires (si plus de 3) */}
        {images.length > 3 && (
          <div className="grid grid-cols-2 gap-4">
            {images.slice(3).map((image, index) => (
              <div
                key={index + 3}
                className="relative w-full aspect-square bg-[#F9F9F9]"
              >
                <Image
                  src={image}
                  alt={`${productName} - Image ${index + 4}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 30vw"
                  quality={90}
                  placeholder="blur"
                  blurDataURL={PRODUCT_PLACEHOLDER_BLUR}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}


