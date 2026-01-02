"use client";

import { useEffect, useRef, useState } from "react";
import { useMenu } from "@/context/MenuContext";
import { X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";

/**
 * SearchOverlay - Overlay de recherche minimaliste style Byredo
 *
 * Design :
 * - Fixed, couvre tout l'écran
 * - Fond blanc avec backdrop-blur
 * - Input gigantesque, border-bottom only
 * - Grille de résultats en dessous
 */
interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  image_url: string | null;
  collection: string;
}

interface SearchOverlayProps {
  products: Product[];
}

export default function SearchOverlay({ products }: SearchOverlayProps) {
  const { isSearchOpen, closeSearch } = useMenu();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  /**
   * Filtrer les produits selon la requête
   */
  const filteredProducts = products.filter((product) => {
    const searchQuery = query.toLowerCase();
    return (
      product.name.toLowerCase().includes(searchQuery) ||
      product.collection.toLowerCase().includes(searchQuery)
    );
  });

  /**
   * Auto-focus sur l'input à l'ouverture
   */
  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      // Petit délai pour que l'animation soit fluide
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      // Réinitialiser la recherche à la fermeture
      setQuery("");
    }
  }, [isSearchOpen]);

  /**
   * Animation GSAP : Fade in/out
   */
  useEffect(() => {
    if (!overlayRef.current) return;

    const ctx = gsap.context(() => {
      if (isSearchOpen) {
        // Entrée : Fade in
        gsap.fromTo(
          overlayRef.current,
          {
            opacity: 0,
            visibility: "visible",
          },
          {
            opacity: 1,
            duration: 0.3,
            ease: "power2.out",
          }
        );
      } else {
        // Sortie : Fade out
        gsap.to(overlayRef.current, {
          opacity: 0,
          duration: 0.2,
          ease: "power2.in",
          onComplete: () => {
            if (overlayRef.current) {
              gsap.set(overlayRef.current, { visibility: "hidden" });
            }
          },
        });
      }
    }, overlayRef);

    return () => ctx.revert();
  }, [isSearchOpen]);

  /**
   * Scroll lock quand la recherche est ouverte
   */
  useEffect(() => {
    if (isSearchOpen) {
      const scrollY = window.scrollY;
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
    } else {
      const scrollY = document.body.style.top;
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
    };
  }, [isSearchOpen]);

  /**
   * Formater le prix
   */
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    }).format(price);
  };

  /**
   * Gérer la fermeture au clic sur un produit
   */
  const handleProductClick = () => {
    closeSearch();
  };

  if (!isSearchOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-white/95 backdrop-blur-md z-[70]"
      style={{ visibility: "hidden" }}
    >
      <div className="h-full flex flex-col">
        {/* Header : Input + Bouton Fermer */}
        <div className="px-6 md:px-12 py-8 border-b border-black/10">
          <div className="max-w-4xl mx-auto flex items-center gap-6">
            {/* Input de recherche */}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="RECHERCHER UN PARFUM..."
              className="flex-1 text-3xl md:text-5xl font-bold uppercase tracking-wider bg-transparent border-0 border-b-2 border-black/20 focus:outline-none focus:border-black transition-colors pb-4"
            />

            {/* Bouton Fermer */}
            <button
              onClick={closeSearch}
              className="p-2 hover:opacity-50 transition-opacity"
              aria-label="Fermer la recherche"
            >
              <X size={24} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Résultats */}
        <div className="flex-1 overflow-y-auto px-6 md:px-12 py-8">
          {query.length === 0 ? (
            <div className="max-w-4xl mx-auto text-center py-20">
              <p className="text-sm text-gray-400 uppercase tracking-widest">
                Commencez à taper pour rechercher...
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="max-w-4xl mx-auto text-center py-20">
              <p className="text-sm text-gray-400 uppercase tracking-widest">
                Aucun résultat pour "{query}"
              </p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-6">
                {filteredProducts.length} résultat{filteredProducts.length > 1 ? "s" : ""}
              </p>

              {/* Grille de résultats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    onClick={handleProductClick}
                    className="group block"
                  >
                    {/* Image */}
                    <div className="relative w-full aspect-square overflow-hidden bg-gray-100 mb-4">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                          Image
                        </div>
                      )}
                    </div>

                    {/* Infos */}
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-widest text-gray-400">
                        {product.collection}
                      </p>
                      <h3 className="text-sm font-medium uppercase tracking-wide text-black group-hover:underline underline-offset-4 transition-all">
                        {product.name}
                      </h3>
                      <p className="text-sm text-black">{formatPrice(product.price)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

