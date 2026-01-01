"use client";

import { useMenu } from "@/context/MenuContext";
import gsap from "gsap";
import { X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/**
 * MenuOverlay - Menu latéral gauche style "Carte Flottante" avec logique Cascading
 *
 * Design :
 * - Carte flottante (fixed, z-40, bg-white, shadow-2xl, rounded-3xl)
 * - Position : top-4 bottom-4 left-4
 * - Hauteur : h-[calc(100dvh-2rem)]
 * - Largeur : w-[350px] (initial) -> w-[calc(100vw-2rem)] (étendu)
 *
 * Logique Cascading (Tiroirs) :
 * - Col 1 : Liste des marques (CP King, CP Paris...). Clic -> Active la catégorie.
 * - Col 2 & 3 : Apparaissent uniquement si une marque est active. Affiche les produits + Photo au survol.
 * - Bas de Col 1 : Liens "CONNEXION", "COMMANDES", "CONTACT" (mt-auto, petits, gris).
 *
 * Animations :
 * - Entrée : Slide depuis la GAUCHE (x: -105% -> x: 0)
 * - Sortie : Slide vers la GAUCHE (x: -105%)
 * - État Fermé : invisible et hors de l'écran
 *
 * Scroll Lock :
 * - Bloque TOTALEMENT le scroll du site quand le menu est ouvert
 */

// Interface pour les données passées depuis le Server Component
interface MenuOverlayProps {
  collections: string[];
  products: {
    id: string;
    name: string;
    products: {
      id: string;
      name: string;
      slug: string;
      image?: string;
    }[];
  }[];
}

export default function MenuOverlay({
  collections = [],
  products = [],
}: MenuOverlayProps) {
  const { isOpen, closeMenu } = useMenu();
  const menuRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [activeBrand, setActiveBrand] = useState<string | null>(null);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  // Animation GSAP : Slide depuis la gauche
  useEffect(() => {
    if (!menuRef.current) return;

    const ctx = gsap.context(() => {
      if (isOpen) {
        // Entrée : Slide depuis la gauche
        gsap.fromTo(
          menuRef.current,
          {
            x: "-105%",
            visibility: "visible",
          },
          {
            x: 0,
            duration: 0.6,
            ease: "power3.out",
          }
        );

        // Overlay backdrop : Animation opacité + blur pour focus sur le menu
        if (overlayRef.current) {
          gsap.fromTo(
            overlayRef.current,
            {
              opacity: 0,
              backdropFilter: "blur(250px)",
              visibility: "visible",
            },
            {
              opacity: 0.8, // 80% d'opacité pour un focus maximal
              backdropFilter: "blur(250px)", // Blur maximum pour un effet complètement flouté
              duration: 0.5,
              ease: "power2.out", // Smooth animation
            }
          );
        }
      } else {
        // Sortie : Slide vers la gauche + Fade out du backdrop
        const cleanup = () => {
          // Une fois l'animation terminée, rendre invisible pour éviter les débordements
          if (menuRef.current) {
            gsap.set(menuRef.current, { visibility: "hidden" });
          }
          if (overlayRef.current) {
            gsap.set(overlayRef.current, { visibility: "hidden" });
          }
        };

        gsap.to(menuRef.current, {
          x: "-105%",
          duration: 0.5,
          ease: "power2.in",
        });

        // Animation de sortie du backdrop
        if (overlayRef.current) {
          gsap.to(overlayRef.current, {
            opacity: 0,
            backdropFilter: "blur(0px)",
            duration: 0.4,
            ease: "power2.in",
            onComplete: cleanup,
          });
        } else {
          // Si pas de backdrop, cleanup après l'animation du menu
          setTimeout(cleanup, 500);
        }
      }
    }, menuRef);

    return () => ctx.revert();
  }, [isOpen]);

  // Scroll Lock : Bloque le scroll quand le menu est ouvert
  useEffect(() => {
    if (isOpen) {
      // Sauvegarder la position actuelle du scroll
      const scrollY = window.scrollY;

      // Bloquer le scroll avec overflow hidden
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";

      // Si Lenis est disponible, le stopper aussi
      // (On peut aussi utiliser useLenis hook si disponible)
    } else {
      // Restaurer le scroll
      const scrollY = document.body.style.top;
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";

      // Restaurer la position du scroll
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    }

    return () => {
      // Cleanup au démontage
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
    };
  }, [isOpen]);

  // Réinitialiser la marque active quand le menu se ferme
  useEffect(() => {
    if (!isOpen) {
      setActiveBrand(null);
      setHoveredProduct(null);
    }
  }, [isOpen]);

  // Trouver la collection active
  const activeCollectionData = products.find(
    (p) => p.id === activeBrand || p.name === activeBrand
  );

  return (
    <>
      {/* Overlay Backdrop (assombrit et floute le fond pour focus sur le menu) */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/80 z-[55]"
        style={{
          visibility: "hidden",
          backdropFilter: "blur(0px)", // Sera animé par GSAP
        }}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* Menu Overlay */}
      <div
        ref={menuRef}
        className="fixed z-[60] bg-white shadow-2xl rounded-3xl left-4 overflow-hidden flex flex-col"
        style={{
          top: "90px", // Positionné sous le header
          bottom: "1rem",
          height: "calc(100dvh - 90px - 1rem)", // Hauteur ajustée pour être sous le header
          width: activeBrand ? "calc(100vw - 2rem)" : "350px",
          visibility: "hidden",
          transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Header du Menu */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-black/10">
          <h2 className="text-xs uppercase tracking-widest font-bold">Menu</h2>
          <button
            onClick={closeMenu}
            className="p-2 hover:opacity-50 transition-opacity"
            aria-label="Fermer le menu"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Contenu : Grille Cascading */}
        <div className="flex-1 flex overflow-hidden">
          {/* COLONNE 1 : Liste des Marques */}
          <div className="w-[350px] border-r border-black/10 flex flex-col overflow-y-auto">
            <div className="flex-1 px-6 py-6">
              <h3 className="text-[10px] uppercase tracking-widest font-bold mb-6 text-gray-500">
                Collections
              </h3>
              <ul className="space-y-1">
                {collections.map((collection) => {
                  const collectionId = collection
                    .toLowerCase()
                    .replace(/\s+/g, "-");
                  const isActive =
                    activeBrand === collectionId || activeBrand === collection;
                  return (
                    <li key={collection}>
                      <button
                        onClick={() =>
                          setActiveBrand(isActive ? null : collectionId)
                        }
                        className={`w-full text-left px-4 py-3 text-sm uppercase tracking-wide font-medium transition-colors underline-offset-4 ${
                          isActive
                            ? "text-black underline"
                            : "text-black hover:underline"
                        }`}
                      >
                        {collection}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Bas de Col 1 : Liens (CONNEXION, COMMANDES, CONTACT) */}
            <div className="mt-auto px-6 py-6 border-t border-black/10 space-y-3">
              <Link
                href="/connexion"
                onClick={closeMenu}
                className="block text-[10px] text-gray-500 uppercase tracking-widest hover:text-black hover:underline transition-colors underline-offset-4"
              >
                Connexion
              </Link>
              <Link
                href="/commandes"
                onClick={closeMenu}
                className="block text-[10px] text-gray-500 uppercase tracking-widest hover:text-black hover:underline transition-colors underline-offset-4"
              >
                Commandes
              </Link>
              <Link
                href="/contact"
                onClick={closeMenu}
                className="block text-[10px] text-gray-500 uppercase tracking-widest hover:text-black hover:underline transition-colors underline-offset-4"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* COLONNE 2 : Produits de la collection active */}
          {activeCollectionData && (
            <div className="flex-1 border-r border-black/10 overflow-y-auto px-6 py-6">
              <h3 className="text-[10px] uppercase tracking-widest font-bold mb-6 text-gray-500">
                Produits
              </h3>
              <ul className="space-y-2">
                {activeCollectionData.products.map((product) => (
                  <li key={product.id}>
                    <Link
                      href={`/product/${product.slug}`}
                      onClick={closeMenu}
                      onMouseEnter={() => setHoveredProduct(product.id)}
                      onMouseLeave={() => setHoveredProduct(null)}
                      className="block px-4 py-3 text-sm uppercase tracking-wide font-medium hover:underline transition-colors underline-offset-4"
                    >
                      {product.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* COLONNE 3 : Photo du produit au survol */}
          {activeCollectionData && hoveredProduct && (
            <div className="w-[400px] overflow-hidden bg-gray-50 flex items-center justify-center">
              {activeCollectionData.products.find(
                (p) => p.id === hoveredProduct
              )?.image ? (
                <img
                  src={
                    activeCollectionData.products.find(
                      (p) => p.id === hoveredProduct
                    )?.image
                  }
                  alt={
                    activeCollectionData.products.find(
                      (p) => p.id === hoveredProduct
                    )?.name
                  }
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-xs text-gray-400 uppercase tracking-widest">
                  Image à venir
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
