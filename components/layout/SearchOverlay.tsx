"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useMenu } from "@/context/MenuContext";
import { X, Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";

/**
 * SearchOverlay - Overlay de recherche style Louis Vuitton
 *
 * Design :
 * - Animation slide down (haut vers bas)
 * - Logo centré en haut
 * - Input style Louis Vuitton (rounded-full)
 * - Produits groupés par collection
 * - Grille par collection
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

/**
 * Grouper les produits par collection
 */
function groupProductsByCollection(products: Product[]) {
  const grouped: Record<string, Product[]> = {};

  products.forEach((product) => {
    const collection = product.collection || "Autres";
    if (!grouped[collection]) {
      grouped[collection] = [];
    }
    grouped[collection].push(product);
  });

  return grouped;
}

export default function SearchOverlay({ products }: SearchOverlayProps) {
  const { isSearchOpen, closeSearch } = useMenu();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  /**
   * Filtrer les produits selon la requête
   */
  const filteredProducts = useMemo(() => {
    if (!query.trim()) {
      return products;
    }

    const searchQuery = query.toLowerCase();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchQuery) ||
        product.collection.toLowerCase().includes(searchQuery)
    );
  }, [products, query]);

  /**
   * Grouper les produits filtrés par collection
   */
  const groupedProducts = useMemo(() => {
    return groupProductsByCollection(filteredProducts);
  }, [filteredProducts]);

  /**
   * Auto-focus sur l'input à l'ouverture
   */
  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      // Petit délai pour que l'animation soit fluide
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    } else {
      // Réinitialiser la recherche à la fermeture
      setQuery("");
    }
  }, [isSearchOpen]);

  /**
   * Animation GSAP : Slide Down (Haut vers Bas)
   */
  useEffect(() => {
    if (!overlayRef.current) return;

    const ctx = gsap.context(() => {
      if (isSearchOpen) {
        // Entrée : Slide down depuis le haut
        gsap.fromTo(
          overlayRef.current,
          {
            yPercent: -100,
            visibility: "visible",
          },
          {
            yPercent: 0,
            duration: 0.6,
            ease: "power3.out",
          }
        );
      } else {
        // Sortie : Slide up vers le haut
        gsap.to(overlayRef.current, {
          yPercent: -100,
          duration: 0.4,
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

  // Trier les collections par ordre alphabétique
  const sortedCollections = Object.keys(groupedProducts).sort();

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-white z-[70] flex flex-col"
      style={{ visibility: "hidden" }}
    >
      {/* Header : Logo + Input + Bouton Fermer */}
      <div className="pt-12 pb-8 border-b border-black/10 flex-shrink-0">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          {/* Logo centré */}
          <h1 className="text-3xl font-bold uppercase tracking-widest text-center mb-8">
            LE BON PARFUM
          </h1>

          {/* Input de recherche style Louis Vuitton */}
          <div className="relative max-w-2xl mx-auto">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="RECHERCHER UN PARFUM..."
              className="w-full border border-gray-300 rounded-full px-6 py-3 pl-12 text-sm uppercase tracking-wide focus:border-black transition-colors outline-none bg-white"
            />
            {/* Icône Loupe à gauche */}
            <Search
              size={18}
              strokeWidth={1.5}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>

        {/* Bouton Fermer en haut à droite */}
        <button
          onClick={closeSearch}
          className="absolute top-6 right-6 p-2 hover:opacity-50 transition-opacity"
          aria-label="Fermer la recherche"
        >
          <X size={24} strokeWidth={1.5} />
        </button>
      </div>

      {/* Contenu scrollable : Grille par Collections */}
      <div className="flex-1 overflow-y-auto py-8" data-lenis-prevent>
        {sortedCollections.length === 0 ? (
          <div className="max-w-6xl mx-auto px-6 md:px-12 text-center py-20">
            <p className="text-sm text-gray-400 uppercase tracking-widest">
              {query.trim()
                ? `Aucun résultat pour "${query}"`
                : "Commencez à taper pour rechercher..."}
            </p>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            {sortedCollections.map((collection) => {
              const collectionProducts = groupedProducts[collection];
              if (collectionProducts.length === 0) return null;

              return (
                <div key={collection} className="mb-16">
                  {/* Titre Collection */}
                  <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6 mt-12 px-6 md:px-12">
                    {collection}
                  </h2>

                  {/* Grille Produits */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10 px-6 md:px-12">
                    {collectionProducts.map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.slug}`}
                        onClick={handleProductClick}
                        className="group block"
                      >
                        {/* Image - Aspect 3/4 */}
                        <div className="relative w-full aspect-[3/4] overflow-hidden bg-gray-50 mb-3">
                          {product.image_url ? (
                            <Image
                              src={product.image_url}
                              alt={product.name}
                              fill
                              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                              sizes="(max-width: 768px) 50vw, 25vw"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                              Image
                            </div>
                          )}
                        </div>

                        {/* Infos Produit */}
                        <div className="space-y-1">
                          <h3 className="text-sm font-bold uppercase tracking-wide text-black group-hover:underline underline-offset-4 transition-all">
                            {product.name}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {formatPrice(product.price / 100)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
