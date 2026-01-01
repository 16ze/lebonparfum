"use client";

import { useMenu } from "@/context/MenuContext";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Menu, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

/**
 * Header - Byredo-style immersive navigation
 *
 * Layout :
 * [ ☰ MENU ]     HÉRITAGE     [ PANIER (0) 🛍️ ]
 *
 * États :
 * - Top (0px) : Transparent + Texte/Icons blanc
 * - Scrolled (>100px) : Fond blanc/80 + Blur + Texte/Icons noir
 *
 * Comportement :
 * - Disparaît au scroll down (yPercent: -100)
 * - Réapparaît au scroll up (yPercent: 0)
 */
export default function Header() {
  const headerRef = useRef<HTMLElement>(null);
  const elementsRef = useRef<(HTMLElement | null)[]>([]);
  const { toggleMenu, isOpen } = useMenu();

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Animation Hide/Show basée sur la direction du scroll
      ScrollTrigger.create({
        start: "top top",
        end: "max",
        onUpdate: (self) => {
          const direction = self.direction; // 1 = down, -1 = up

          gsap.to(headerRef.current, {
            yPercent: direction === 1 ? -100 : 0,
            duration: 0.5,
            ease: "power3.out",
          });
        },
      });

      // 2. Animation Transparent → White basée sur la position du scroll
      ScrollTrigger.create({
        start: "top top",
        end: "100px top",
        scrub: 0.3,
        onUpdate: (self) => {
          const progress = self.progress; // 0 (top) → 1 (scrolled)

          // Header background & blur
          gsap.to(headerRef.current, {
            backgroundColor: `rgba(255, 255, 255, ${progress * 0.8})`,
            backdropFilter: `blur(${progress * 12}px)`,
            borderBottom: `1px solid rgba(0, 0, 0, ${progress * 0.1})`,
            duration: 0.3,
          });

          // Texte & Icons : blanc → noir
          elementsRef.current.forEach((el) => {
            if (el) {
              gsap.to(el, {
                color: progress > 0.5 ? "#000000" : "#FFFFFF",
                duration: 0.3,
              });

              // Animer aussi les SVG (stroke)
              const svgs = el.querySelectorAll("svg");
              svgs.forEach((svg) => {
                gsap.to(svg, {
                  stroke: progress > 0.5 ? "#000000" : "#FFFFFF",
                  duration: 0.3,
                });
              });
            }
          });
        },
      });
    }, headerRef);

    return () => ctx.revert();
  }, []);

  // Animation Header : Assombrissement et blur quand le menu est ouvert
  useEffect(() => {
    if (!headerRef.current) return;

    const ctx = gsap.context(() => {
      if (isOpen) {
        // Menu ouvert : Assombrir et flouter le header
        gsap.to(headerRef.current, {
          filter: "brightness(0.6) blur(150px)", // Assombrir à 30% + blur 12px
          duration: 0.5,
          ease: "power2.out",
        });
      } else {
        // Menu fermé : Restaurer la luminosité et enlever le blur
        gsap.to(headerRef.current, {
          filter: "brightness(1) blur(0px)",
          duration: 0.4,
          ease: "power2.in",
        });
      }
    }, headerRef);

    return () => ctx.revert();
  }, [isOpen]);

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 w-full z-50"
      style={{
        backgroundColor: "transparent",
        borderBottom: "1px solid transparent",
      }}
    >
      <nav className="flex items-center justify-between px-4 md:px-6 py-6">
        {/* Gauche : Menu Burger */}
        <button
          ref={(el) => {
            elementsRef.current[0] = el;
          }}
          onClick={toggleMenu}
          className="flex items-center gap-x-2 text-[10px] md:text-xs uppercase tracking-widest font-medium hover:opacity-50 transition-all duration-300"
          style={{ color: "#FFFFFF" }}
          aria-label="Ouvrir le menu"
        >
          <Menu size={18} strokeWidth={1.5} />
          <span>Menu</span>
        </button>

        {/* Centre : Logo HÉRITAGE */}
        <Link
          href="/"
          ref={(el) => {
            elementsRef.current[1] = el;
          }}
        >
          <h1
            className="text-base md:text-lg font-bold uppercase tracking-widest"
            style={{ color: "#FFFFFF" }}
          >
            HÉRITAGE
          </h1>
        </Link>

        {/* Droite : Panier */}
        <button
          ref={(el) => {
            elementsRef.current[2] = el;
          }}
          className="flex items-center gap-x-2 text-[10px] md:text-xs uppercase tracking-widest font-medium hover:opacity-50 transition-opacity duration-300"
          style={{ color: "#FFFFFF" }}
          aria-label="Ouvrir le panier"
        >
          <span>Panier (0)</span>
          <ShoppingBag size={18} strokeWidth={1.5} />
        </button>
      </nav>
    </header>
  );
}
