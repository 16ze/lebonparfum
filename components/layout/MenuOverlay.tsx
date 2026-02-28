"use client";

import { useMenu } from "@/context/MenuContext";
import gsap from "gsap";
import { X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { PRODUCT_PLACEHOLDER_BLUR } from "@/lib/image-placeholders";

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
  // Infos de session utilisateur
  user?: {
    id: string;
    email?: string;
    isAdmin: boolean;
  } | null;
}

export default function MenuOverlay({
  collections = [],
  products = [],
  user = null,
}: MenuOverlayProps) {
  const { isOpen, closeMenu } = useMenu();
  const menuRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const mobileContentRef = useRef<HTMLDivElement>(null);
  const [activeBrand, setActiveBrand] = useState<string | null>(null);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Détection du mobile au montage et au resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile(); // Initial check
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Animation de transition entre Collections et Produits (mobile)
  useEffect(() => {
    if (!isMobile || !mobileContentRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        mobileContentRef.current,
        { opacity: 0, x: activeBrand ? 20 : -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.4,
          ease: "power2.out",
        }
      );
    });

    return () => ctx.revert();
  }, [activeBrand, isMobile]);

  // DEBUG: Log des données reçues
  console.log("🔍 MenuOverlay - Props reçues:", {
    collections,
    productsCount: products.length,
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      count: p.products.length,
    })),
  });

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

  // DEBUG: Log de la collection active
  console.log("🔍 MenuOverlay - État actuel:", {
    activeBrand,
    activeCollectionData: activeCollectionData
      ? {
          id: activeCollectionData.id,
          name: activeCollectionData.name,
          productsCount: activeCollectionData.products.length,
        }
      : null,
  });

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

      {/* Menu Overlay - Structure bullet-proof pour le scroll */}
      {/* height = 100dvh (viewport VISIBLE) - top 90px - bottom gap 1rem */}
      {/* Pas de bottom: "1rem" qui causerait un cut-off mobile (ancré sur layout viewport) */}
      <div
        ref={menuRef}
        className="fixed z-[60] bg-white shadow-2xl rounded-3xl left-4"
        style={{
          top: "90px",
          height: "calc(100dvh - 90px - 1rem)",
          width: activeBrand || isMobile ? "calc(100vw - 2rem)" : "350px",
          visibility: "hidden",
          transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          // CRITIQUE: overflow hidden pour contraindre les enfants
          overflow: "hidden",
          // CRITIQUE: display flex en colonne
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header du Menu - hauteur fixe, ne se comprime jamais */}
        <div
          className="flex items-center justify-between px-6 py-6 border-b border-black/10"
          style={{ flexShrink: 0 }}
        >
          <h2 className="text-xs uppercase tracking-widest font-bold">Menu</h2>
          <button
            onClick={closeMenu}
            className="p-2 hover:opacity-50 transition-opacity"
            aria-label="Fermer le menu"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Contenu : Grille Cascading - prend tout l'espace restant */}
        <div
          style={{
            flex: 1,
            minHeight: 0, // CRITIQUE: permet au conteneur de shrink
            display: "flex",
            overflow: "hidden",
          }}
        >
          {/* MODE MOBILE : Navigation simplifiée (Marques OU Produits) */}
          {isMobile ? (
            <div
              ref={mobileContentRef}
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
              }}
            >
              {!activeBrand ? (
                // Vue Marques
                <>
                  <div
                    className="px-6 py-6"
                    style={{
                      flex: 1,
                      minHeight: 0,
                      overflowY: "auto",
                      overscrollBehavior: "contain",
                    }}
                    data-lenis-prevent
                  >
                    <h3 className="text-[10px] uppercase tracking-widest font-bold mb-6 text-gray-500">
                      Collections
                    </h3>
                    <ul className="space-y-1">
                      {collections.map((collection) => {
                        const collectionId = collection
                          .toLowerCase()
                          .replace(/\s+/g, "-");
                        return (
                          <li key={collection}>
                            <button
                              onClick={() => setActiveBrand(collectionId)}
                              className="w-full text-left px-4 py-4 text-sm uppercase tracking-wide font-medium text-black hover:underline transition-colors underline-offset-4"
                            >
                              {collection}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Liens fixes (mobile) */}
                  <div
                    className="px-6 py-6 border-t border-black/10 space-y-3"
                    style={{ flexShrink: 0 }}
                  >
                    {user ? (
                      <Link
                        href="/account"
                        onClick={closeMenu}
                        className="block text-[10px] text-gray-500 uppercase tracking-widest hover:text-black hover:underline transition-colors underline-offset-4"
                      >
                        Mon compte
                      </Link>
                    ) : (
                      <Link
                        href="/login"
                        onClick={closeMenu}
                        className="block text-[10px] text-gray-500 uppercase tracking-widest hover:text-black hover:underline transition-colors underline-offset-4"
                      >
                        Connexion
                      </Link>
                    )}

                    <Link
                      href={user ? "/account/orders" : "/login"}
                      onClick={closeMenu}
                      className="block text-[10px] text-gray-500 uppercase tracking-widest hover:text-black hover:underline transition-colors underline-offset-4"
                    >
                      Mes commandes
                    </Link>

                    {user?.isAdmin && (
                      <Link
                        href="/admin/dashboard"
                        onClick={closeMenu}
                        className="block text-[10px] text-red-600 font-bold uppercase tracking-widest hover:text-red-700 hover:underline transition-colors underline-offset-4"
                      >
                        Dashboard Admin
                      </Link>
                    )}

                    <Link
                      href="/contact"
                      onClick={closeMenu}
                      className="block text-[10px] text-gray-500 uppercase tracking-widest hover:text-black hover:underline transition-colors underline-offset-4"
                    >
                      Contact
                    </Link>
                  </div>
                </>
              ) : (
                // Vue Produits (après avoir cliqué sur une marque)
                <>
                  <div
                    className="px-6 py-6"
                    style={{
                      flex: 1,
                      minHeight: 0,
                      overflowY: "auto",
                      overscrollBehavior: "contain",
                    }}
                    data-lenis-prevent
                  >
                    {/* Bouton Retour */}
                    <button
                      onClick={() => setActiveBrand(null)}
                      className="flex items-center gap-2 mb-6 text-xs uppercase tracking-widest font-bold text-gray-500 hover:text-black transition-colors"
                    >
                      <span>←</span> Retour aux collections
                    </button>

                    <h3 className="text-[10px] uppercase tracking-widest font-bold mb-6 text-gray-500">
                      Produits ({activeCollectionData?.products.length || 0})
                    </h3>

                    {activeCollectionData && (
                      <ul className="space-y-1">
                        {activeCollectionData.products.map((product) => (
                          <li key={product.id}>
                            <Link
                              href={`/product/${product.slug}`}
                              onClick={closeMenu}
                              className="block px-4 py-4 text-sm uppercase tracking-wide font-medium text-black hover:underline transition-colors underline-offset-4"
                            >
                              {product.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </>
              )}
            </div>
          ) : (
            // MODE DESKTOP : Grille à 3 colonnes (existant)
            <>
              {/* COLONNE 1 : Liste des Marques */}
              <div
                className="border-r border-black/10"
                style={{
                  width: "350px",
                  flexShrink: 0,
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 0,
                }}
              >
                {/* Zone scrollable des collections */}
                <div
                  className="px-6 py-6"
                  style={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: "auto",
                    overscrollBehavior: "contain",
                  }}
                  data-lenis-prevent
                >
                  <h3 className="text-[10px] uppercase tracking-widest font-bold mb-6 text-gray-500">
                    Collections
                  </h3>
                  <ul className="space-y-1">
                    {collections.map((collection) => {
                      const collectionId = collection
                        .toLowerCase()
                        .replace(/\s+/g, "-");
                      const isActive =
                        activeBrand === collectionId ||
                        activeBrand === collection;
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

                {/* Bas de Col 1 : Liens fixes */}
                <div
                  className="px-6 py-6 border-t border-black/10 space-y-3"
                  style={{ flexShrink: 0 }}
                >
                  {user ? (
                    <Link
                      href="/account"
                      onClick={closeMenu}
                      className="block text-[10px] text-gray-500 uppercase tracking-widest hover:text-black hover:underline transition-colors underline-offset-4"
                    >
                      Mon compte
                    </Link>
                  ) : (
                    <Link
                      href="/login"
                      onClick={closeMenu}
                      className="block text-[10px] text-gray-500 uppercase tracking-widest hover:text-black hover:underline transition-colors underline-offset-4"
                    >
                      Connexion
                    </Link>
                  )}

                  <Link
                    href={user ? "/account/orders" : "/login"}
                    onClick={closeMenu}
                    className="block text-[10px] text-gray-500 uppercase tracking-widest hover:text-black hover:underline transition-colors underline-offset-4"
                  >
                    Mes commandes
                  </Link>

                  {user?.isAdmin && (
                    <Link
                      href="/admin/dashboard"
                      onClick={closeMenu}
                      className="block text-[10px] text-red-600 font-bold uppercase tracking-widest hover:text-red-700 hover:underline transition-colors underline-offset-4"
                    >
                      Dashboard Admin
                    </Link>
                  )}

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
                <div
                  className="border-r border-black/10"
                  style={{
                    flex: 1,
                    minHeight: 0,
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* Header de colonne - fixe */}
                  <div className="px-6 pt-6 pb-4" style={{ flexShrink: 0 }}>
                    <h3 className="text-[10px] uppercase tracking-widest font-bold text-gray-500">
                      Produits ({activeCollectionData.products.length})
                    </h3>
                  </div>

                  {/* Zone de scroll des produits */}
                  <div
                    className="px-6 pb-24"
                    style={{
                      flex: 1,
                      minHeight: 0,
                      overflowY: "auto",
                      overscrollBehavior: "contain",
                    }}
                    data-lenis-prevent
                  >
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
                </div>
              )}

              {/* COLONNE 3 : Photo du produit au survol */}
              {activeCollectionData && hoveredProduct && (
                <div className="w-[400px] relative overflow-hidden bg-gray-50">
                  {activeCollectionData.products.find(
                    (p) => p.id === hoveredProduct
                  )?.image ? (
                    <Image
                      src={
                        activeCollectionData.products.find(
                          (p) => p.id === hoveredProduct
                        )?.image || ""
                      }
                      alt={
                        activeCollectionData.products.find(
                          (p) => p.id === hoveredProduct
                        )?.name || "Product"
                      }
                      fill
                      className="object-cover"
                      sizes="400px"
                      placeholder="blur"
                      blurDataURL={PRODUCT_PLACEHOLDER_BLUR}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400 uppercase tracking-widest">
                      Image à venir
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
