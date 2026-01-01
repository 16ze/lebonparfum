"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

/**
 * Services - Section Services Exclusifs (Style Louis Vuitton)
 *
 * Design :
 * - Desktop : Grille 3 colonnes
 * - Mobile : Swiper (Carousel)
 * - Classe : relative z-10 bg-white (pour l'effet rideau)
 */

interface ServiceItem {
  id: string;
  title: string;
  image: string;
  links: { label: string; href: string }[];
}

const SERVICES: ServiceItem[] = [
  {
    id: "1",
    title: "Conseils Personnalisés",
    image:
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?q=80&w=800&auto=format&fit=crop",
    links: [
      { label: "Pour Elle", href: "/services/conseils-femme" },
      { label: "Pour Lui", href: "/services/conseils-homme" },
    ],
  },
  {
    id: "2",
    title: "Gravure Exclusive",
    image:
      "https://images.unsplash.com/photo-1587017539504-67cfbddac569?q=80&w=800&auto=format&fit=crop",
    links: [
      { label: "Personnalisation", href: "/services/gravure" },
      { label: "Coffrets Cadeaux", href: "/services/coffrets" },
    ],
  },
  {
    id: "3",
    title: "Livraison Premium",
    image:
      "https://images.unsplash.com/photo-1590736969955-71cc94901144?q=80&w=800&auto=format&fit=crop",
    links: [
      { label: "Express 24h", href: "/services/livraison-express" },
      { label: "Packaging Luxe", href: "/services/packaging" },
    ],
  },
];

function ServiceCard({ service }: { service: ServiceItem }) {
  return (
    <div className="group">
      {/* Image carrée */}
      <div className="relative aspect-square overflow-hidden bg-gray-100 mb-4">
        <Image
          src={service.image}
          alt={service.title}
          fill
          className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>

      {/* Titre */}
      <h3 className="text-lg font-bold uppercase tracking-widest mb-3">
        {service.title}
      </h3>

      {/* Liens */}
      <div className="flex flex-col gap-2">
        {service.links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-xs uppercase tracking-wide text-gray-600 hover:text-black border-b border-gray-300 hover:border-black pb-1 transition-all duration-300 inline-block w-fit"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function Services() {
  return (
    <section className="relative z-10 w-full bg-white py-16 md:py-24">
      <div className="max-w-[1800px] mx-auto px-4 md:px-6">
        {/* Titre */}
        <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-widest text-center mb-12 md:mb-16">
          Les Services Exclusifs
        </h2>

        {/* Desktop : Grid 3 colonnes */}
        <div className="hidden md:grid md:grid-cols-3 gap-8 lg:gap-12">
          {SERVICES.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>

        {/* Mobile : Swiper Carousel */}
        <div className="md:hidden">
          <Swiper
            modules={[Pagination]}
            slidesPerView={1.2}
            spaceBetween={20}
            centeredSlides={true}
            pagination={{ clickable: true }}
            className="services-swiper"
          >
            {SERVICES.map((service) => (
              <SwiperSlide key={service.id}>
                <ServiceCard service={service} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
