"use client";

import { SITE_CONFIG } from "@/lib/site.config";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useMenu } from "@/context/MenuContext";
import clsx from "clsx";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Menu, Search, ShoppingBag, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

gsap.registerPlugin(ScrollTrigger);

/**
 * Header - Byredo-style immersive navigation
 *
 * Layout :
 * [ ☰ MENU ]     THE PARFUMERIEE     [ PANIER (0) 🛍️ ]
 *
 * Logique conditionnelle :
 * - Page d'accueil (/) : Transparent au top → Blanc au scroll
 * - Autres pages (/product/...) : Toujours blanc avec texte noir
 *
 * Comportement (Home uniquement) :
 * - Disparaît au scroll down (yPercent: -100)
 * - Réapparaît au scroll up (yPercent: 0)
 */
export default function Header() {
  const headerRef = useRef<HTMLElement>(null);
  const elementsRef = useRef<(HTMLElement | null)[]>([]);
  const logoRef = useRef<HTMLHeadingElement>(null);
  const { toggleMenu, isOpen, openSearch } = useMenu();
  const { cartCount, openCart } = useCart();
  const { user, openProfileDrawer, openAuthDrawer } = useAuth();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [isScrolled, setIsScrolled] = useState(!isHome); // Sur les autres pages, on considère qu'on est "scrollé"

  // Animations GSAP uniquement sur la page d'accueil
  useEffect(() => {
    const ctx = gsap.context(() => {
    if (!isHome) {
        // Sur les autres pages : s'assurer que le logo est normal
        if (logoRef.current) {
          gsap.set(logoRef.current, {
            y: 0,
            scale: 1,
            color: "#000000",
            clearProps: "transform,color",
          });
        }
      return;
    }

      // Utiliser matchMedia pour des valeurs responsives
      const mm = gsap.matchMedia();

      // Configuration initiale du logo sur Home (géant, descendu, blanc)
      // Valeurs différentes selon la taille d'écran
      if (logoRef.current) {
        // Mobile : valeurs réduites
        mm.add("(max-width: 767px)", () => {
          gsap.set(logoRef.current, {
            y: 60, // Moins de descente sur mobile (60px au lieu de 120px)
            scale: 2, // Scale réduit sur mobile (2x au lieu de 3x)
            transformOrigin: "center top",
            color: "#FFFFFF",
          });
        });

        // Desktop : valeurs complètes
        mm.add("(min-width: 768px)", () => {
          gsap.set(logoRef.current, {
            y: 120, // Descente complète sur desktop
            scale: 3, // Agrandissement complet
            transformOrigin: "center top",
            color: "#FFFFFF",
          });
      });
      }

      // 1. Animation Transparent → White basée sur la position du scroll
      ScrollTrigger.create({
        start: "top top",
        end: "50px top", // Réduit à 50px pour un changement plus rapide
        scrub: 0.3,
        onUpdate: (self) => {
          const progress = self.progress; // 0 (top) → 1 (scrolled 50px)
          setIsScrolled(progress > 0.5); // Update state pour les classes CSS

          // Header background & blur
          gsap.to(headerRef.current, {
            backgroundColor: `rgba(255, 255, 255, ${progress * 0.9})`,
            backdropFilter: `blur(${progress * 12}px)`,
            borderBottom: `1px solid rgba(0, 0, 0, ${progress * 0.1})`,
            duration: 0.3,
          });

          // Texte & Icons : blanc → noir
          elementsRef.current.forEach((el) => {
            if (el && el !== logoRef.current) {
              // Ne pas animer le logo ici (géré séparément)
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

      // 3. Animation Logo : remonte, rétrécit et change de couleur (responsive)
      if (logoRef.current) {
        // Mobile : animation plus courte
        mm.add("(max-width: 767px)", () => {
          gsap.to(logoRef.current, {
            y: 0,
            scale: 1,
            color: "#000000",
            ease: "none",
            scrollTrigger: {
              trigger: document.body,
              start: "top top",
              end: "80px top", // Animation plus courte sur mobile (80px au lieu de 150px)
              scrub: true,
            },
          });
        });

        // Desktop : animation complète
        mm.add("(min-width: 768px)", () => {
          gsap.to(logoRef.current, {
            y: 0,
            scale: 1,
            color: "#000000",
            ease: "none",
            scrollTrigger: {
              trigger: document.body,
              start: "top top",
              end: "150px top", // Animation complète sur desktop
              scrub: true,
            },
          });
        });
      }

      return () => mm.revert();
    }, headerRef);

    return () => ctx.revert();
  }, [isHome]);

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

  // Déterminer la couleur du texte et des icônes selon la page et le scroll
  const textColor = isHome && !isScrolled ? "#FFFFFF" : "#000000";

  // Classes conditionnelles pour le header
  // Note : Sur la home, GSAP gère les animations de background via styles inline
  // Sur les autres pages, on utilise les classes CSS pour un header blanc fixe
  const headerClasses = clsx("fixed top-0 left-0 w-full z-50", {
    // Autres pages : toujours blanc avec bordure (pas d'animation GSAP)
    "bg-white shadow-sm border-b border-gray-100 transition-colors duration-300":
      !isHome,
  });

  // Styles inline pour la home (seront animés par GSAP)
  // Pour les autres pages, undefined (les classes CSS gèrent le style)
  const headerStyle = isHome
    ? {
        backgroundColor: "transparent",
        borderBottom: "1px solid transparent",
      }
    : undefined;

  return (
    <header ref={headerRef} className={headerClasses} style={headerStyle}>
      <nav role="navigation" aria-label="Navigation principale" className="flex items-center justify-between px-4 md:px-6 py-6">
        {/* Gauche : Menu Burger + Recherche */}
        <div className="flex items-center gap-4">
          <button
            ref={(el) => {
              elementsRef.current[0] = el;
            }}
            onClick={toggleMenu}
            className="flex items-center gap-x-2 p-2.5 md:p-2 hover:opacity-50 transition-opacity duration-300 min-h-[44px] min-w-[44px]"
            style={{ color: textColor }}
            aria-label="Ouvrir le menu"
            aria-expanded={isOpen}
          >
            <Menu size={20} strokeWidth={1.5} style={{ stroke: textColor }} />
            <span className="hidden md:inline text-[10px] md:text-xs uppercase tracking-widest font-medium">
              Menu
            </span>
          </button>

          {/* Recherche */}
          <button
            ref={(el) => {
              elementsRef.current[1] = el;
            }}
            onClick={openSearch}
            className="p-2.5 md:p-2 hover:opacity-50 transition-opacity duration-300 min-h-[44px] min-w-[44px] flex items-center justify-center"
            style={{ color: textColor }}
            aria-label="Ouvrir la recherche"
          >
            <Search size={20} strokeWidth={1.5} style={{ stroke: textColor }} />
          </button>
        </div>

        {/* Centre : Logo THE PARFUMERIEE */}
        <Link href="/">
          <h1
            ref={logoRef}
            className="text-xs md:text-lg font-bold uppercase tracking-widest whitespace-nowrap"
            style={{ color: isHome && !isScrolled ? "#FFFFFF" : textColor }}
          >
            {SITE_CONFIG.name}
          </h1>
        </Link>

        {/* Droite : Profil + Panier */}
        <div className="flex items-center gap-4">
          {/* Profil (toujours visible) */}
          <button
            ref={(el) => {
              elementsRef.current[3] = el;
            }}
            onClick={() => {
              // Si connecté → ProfileDrawer, sinon → AuthDrawer
              if (user) {
                openProfileDrawer();
              } else {
                openAuthDrawer();
              }
            }}
            className="p-2.5 md:p-2 hover:opacity-50 transition-opacity duration-300 min-h-[44px] min-w-[44px] flex items-center justify-center"
            style={{ color: textColor }}
            aria-label={user ? "Ouvrir le profil" : "Se connecter"}
          >
            <User size={20} strokeWidth={1.5} style={{ stroke: textColor }} />
          </button>

          {/* Panier */}
          <button
            ref={(el) => {
              elementsRef.current[4] = el;
            }}
            onClick={openCart}
            className="relative flex items-center gap-x-2 p-2.5 md:p-2 hover:opacity-50 transition-opacity duration-300 min-h-[44px] min-w-[44px]"
            style={{ color: textColor }}
            aria-label={`Ouvrir le panier (${cartCount} article${cartCount > 1 ? "s" : ""})`}
          >
            {/* Texte uniquement sur desktop */}
            <span className="hidden md:inline text-[10px] md:text-xs uppercase tracking-widest font-medium">
              Panier {cartCount > 0 && `(${cartCount})`}
            </span>
            {/* Icône uniquement sur mobile */}
            <div className="relative md:hidden">
            <ShoppingBag
                size={20}
              strokeWidth={1.5}
              style={{ stroke: textColor }}
            />
              {/* Badge uniquement sur mobile */}
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </div>
          </button>
        </div>
      </nav>
    </header>
  );
}
