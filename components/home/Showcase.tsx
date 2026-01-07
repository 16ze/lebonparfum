"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

// Import Swiper styles
import "swiper/css";

/**
 * Showcase - Section synchronisée style Dior
 *
 * Architecture :
 * - Gauche (5 cols) : Image lifestyle (parallaxe + fade)
 * - Centre (3 cols) : Titre + Description (glissement)
 * - Droite (4 cols) : Carrousel produit (Swiper horizontal)
 *
 * Interaction :
 * - Le carrousel pilote l'activeIndex
 * - activeIndex met à jour lifestyle image + texte (fade/slide)
 */

interface ShowcaseItem {
  id: string;
  title: string;
  description: string;
  lifestyleImg: string;
  productImg: string;
  link: string;
}

const SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    id: "1",
    title: "Rouge Velours",
    description: "L'intensité d'une rose nocturne.",
    lifestyleImg:
      "https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=2000&auto=format&fit=crop",
    productImg:
      "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800&auto=format&fit=crop",
    link: "/product/4-black-op",
  },
  {
    id: "2",
    title: "Blanc Pur",
    description: "La fraîcheur du linge séché au soleil.",
    lifestyleImg:
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=2000&auto=format&fit=crop",
    productImg:
      "https://images.unsplash.com/photo-1615634260167-c8cdede054de?q=80&w=800&auto=format&fit=crop",
    link: "/product/4-black-op",
  },
  {
    id: "3",
    title: "Bois Sacré",
    description: "Une note fumée et mystique.",
    lifestyleImg:
      "https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=2000&auto=format&fit=crop",
    productImg:
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800&auto=format&fit=crop",
    link: "/product/4-black-op",
  },
];

export default function Showcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);


  // Safety check: Garantir un activeItem valide même si Swiper.realIndex est undefined
  const activeItem = SHOWCASE_ITEMS[activeIndex] || SHOWCASE_ITEMS[0];

  // Handler de changement de slide
  const handleSlideChange = (swiper: SwiperType) => {
    setActiveIndex(swiper.realIndex);
  };

  return (
    <section
      ref={sectionRef}
      className="sticky top-0 z-0 w-full bg-white py-12 lg:py-0 h-[100dvh]"
    >
      {/* Layout Desktop : Grid 3 colonnes */}
      <div className="hidden lg:grid lg:grid-cols-12 h-full max-w-[1800px] mx-auto">
        {/* COL 1 : Image Lifestyle (Gauche - 5 cols) */}
        <div className="col-span-5 relative h-full w-full overflow-hidden bg-gray-100">
          <div className="absolute inset-0 w-full h-full">
            <Image
              src={activeItem.lifestyleImg}
              alt={activeItem.title}
              fill
              className="object-cover object-center"
              quality={90}
            />
          </div>
        </div>

        {/* COL 2 : Texte Centre (3 cols) */}
        <div className="col-span-3 flex flex-col justify-center items-center px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-widest text-black mb-4">
            {activeItem.title}
          </h2>
          <p className="text-sm text-gray-600 tracking-wide mb-8 leading-relaxed">
            {activeItem.description}
          </p>
          <Link
            href={activeItem.link}
            className="inline-block text-black text-xs uppercase tracking-widest font-medium border-b border-black pb-1 hover:opacity-70 transition-opacity duration-300"
          >
            Découvrir
          </Link>
        </div>

        {/* COL 3 : Carrousel Produit (Droite - 4 cols) */}
        <div className="col-span-4 flex items-center justify-center bg-[#f9f9f9] p-8 relative z-20">
          <Swiper
            modules={[Mousewheel]}
            direction="horizontal"
            slidesPerView={1.5}
            centeredSlides={true}
            spaceBetween={20}
            mousewheel={true}
            grabCursor={true}
            loop={true}
            onSlideChange={handleSlideChange}
            className="w-full h-[500px]"
          >
            {SHOWCASE_ITEMS.map((item) => (
              <SwiperSlide key={item.id}>
                <div className="relative w-full h-full bg-white rounded-sm overflow-hidden shadow-sm">
                  <Image
                    src={item.productImg}
                    alt={item.title}
                    fill
                    className="object-contain p-4"
                    quality={90}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      {/* Layout Mobile : Stack vertical */}
      <div className="lg:hidden space-y-8 px-4">
        {/* Image Lifestyle */}
        <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100">
          <Image
            src={activeItem.lifestyleImg}
            alt={activeItem.title}
            fill
            className="object-cover object-center"
            quality={90}
          />
        </div>

        {/* Texte */}
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold uppercase tracking-widest text-black mb-3">
            {activeItem.title}
          </h2>
          <p className="text-sm text-gray-600 tracking-wide mb-6">
            {activeItem.description}
          </p>
          <Link
            href={activeItem.link}
            className="inline-block text-black text-xs uppercase tracking-widest font-medium border-b border-black pb-1"
          >
            Découvrir
          </Link>
        </div>

        {/* Carrousel Produit */}
        <div className="bg-[#f9f9f9] p-6">
          <Swiper
            modules={[Mousewheel]}
            slidesPerView={1.2}
            centeredSlides={true}
            spaceBetween={16}
            mousewheel={true}
            grabCursor={true}
            loop={true}
            onSlideChange={handleSlideChange}
            className="w-full h-[300px]"
          >
            {SHOWCASE_ITEMS.map((item) => (
              <SwiperSlide key={item.id}>
                <div className="relative w-full h-full bg-white rounded-sm overflow-hidden shadow-sm">
                  <Image
                    src={item.productImg}
                    alt={item.title}
                    fill
                    className="object-contain p-3"
                    quality={90}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
