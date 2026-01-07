"use client";

import Image from "next/image";
import Link from "next/link";

/**
 * HighlightSection - Campagne publicitaire Full Screen
 *
 * Design :
 * - Plein écran (100dvh - mobile safe)
 * - Image de fond statique
 * - Layout magazine : Titre haut + CTA bas
 * - Overlay sombre pour contraste
 * - Pas d'animation rideau
 */
export default function HighlightSection() {
  return (
    <section
      className="relative z-20 h-[100dvh] w-full overflow-hidden bg-white"
    >
      {/* Image de fond */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="https://images.unsplash.com/photo-1615634260167-c8cdede054de?q=80&w=2000&auto=format&fit=crop"
          alt="Parfum d'exception - Campagne artistique"
          fill
          className="object-cover object-center"
          quality={90}
        />
        {/* Overlay sombre pour contraste */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Contenu layout magazine (titre haut + CTA bas) */}
      <div className="absolute inset-0 flex flex-col justify-between items-center text-center px-6 py-12 md:py-16 z-10">
        {/* Haut : Titre */}
        <div className="flex-shrink-0">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold uppercase tracking-widest text-white">
            Blanche
          </h2>
        </div>

        {/* Bas : Description + CTA */}
        <div className="flex-shrink-0">
          {/* Description poétique */}
          <p className="text-xs md:text-sm text-gray-200 tracking-wide max-w-md leading-relaxed mb-8">
            Une composition florale d'une pureté absolue.
            <br />
            Aldéhydes, Néroli & Musc blanc.
          </p>

          {/* CTA souligné */}
          <Link
            href="/product/4-black-op"
            className="inline-block text-white text-xs md:text-sm uppercase tracking-widest font-medium border-b border-white pb-1 hover:opacity-70 transition-opacity duration-300"
          >
            Découvrir le Parfum
          </Link>
        </div>
      </div>
    </section>
  );
}
