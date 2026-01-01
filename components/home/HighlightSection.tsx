"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * HighlightSection - Campagne publicitaire Full Screen
 *
 * Design :
 * - Plein écran (100dvh - mobile safe)
 * - Image de fond avec parallaxe (y: 0% → -20%)
 * - Layout magazine : Titre haut + CTA bas
 * - Overlay sombre pour contraste
 */
export default function HighlightSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Parallaxe : Image remonte pendant le scroll
      gsap.to(imageWrapperRef.current, {
        y: "-20%",
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-[100dvh] w-full overflow-hidden"
    >
      {/* Image de fond avec parallaxe (wrapper 125% height) */}
      <div
        ref={imageWrapperRef}
        className="absolute inset-0 w-full h-[125%] -top-[10%]"
      >
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
            href="/products/blanche"
            className="inline-block text-white text-xs md:text-sm uppercase tracking-widest font-medium border-b border-white pb-1 hover:opacity-70 transition-opacity duration-300"
          >
            Découvrir le Parfum
          </Link>
        </div>
      </div>
    </section>
  );
}
