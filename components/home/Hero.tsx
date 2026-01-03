"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Hero Section - Quiet Luxury / Editorial Style
 *
 * Design :
 * - Image domine (95% de l'espace)
 * - Texte minimal, discret, en bas
 * - Layout asymétrique : Titre (gauche) | CTA (droite)
 * - Typographie éditoriale (petit, espacé)
 */
export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animation d'intro (très subtile)
      gsap.fromTo(
        contentRef.current,
        {
          y: 20,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          delay: 0.4,
          ease: "power2.out",
        }
      );

      // Parallaxe conditionnel (Desktop uniquement)
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        gsap.to(imageRef.current, {
          yPercent: 20,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      });

      return () => mm.revert();
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-[100dvh] w-full overflow-hidden"
    >
      {/* Vidéo de fond (dominante) */}
      <div ref={imageRef} className="absolute inset-0 w-full h-full md:scale-110">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover object-center"
        >
          <source src="/campaign-video.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Dégradé de lisibilité (bottom fade) */}
      <div className="absolute bottom-0 w-full h-40 bg-gradient-to-t from-black/60 to-transparent z-0" />

      {/* Contenu bottom (layout asymétrique) */}
      <div
        ref={contentRef}
        className="absolute bottom-0 w-full z-10 p-6 md:p-10"
      >
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-y-6">
          {/* Gauche : Titre + Sous-titre */}
          <div>
            <h1 className="text-white text-sm md:text-base font-medium uppercase tracking-[0.2em] leading-relaxed mb-2">
              L'Essence du Vide
            </h1>
            <p className="text-gray-300 text-[10px] md:text-xs uppercase tracking-widest">
              Collection 2025
            </p>
          </div>

          {/* Droite : CTA (lien underline) */}
          <Link
            href="/shop"
            className="text-white text-xs md:text-sm uppercase tracking-widest font-medium underline underline-offset-8 decoration-1 hover:opacity-70 transition-opacity duration-300"
          >
            Shop the Collection
          </Link>
        </div>
      </div>
    </section>
  );
}
