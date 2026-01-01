"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Plus, Minus, ShoppingBag } from "lucide-react";
import gsap from "gsap";
import { useCart } from "@/context/CartContext";

/**
 * CartDrawer - Volet latéral droit pour le panier
 *
 * Design Byredo :
 * - Sidebar droite fixe (fixed right-0)
 * - Fond blanc, z-index élevé
 * - Animation slide-in depuis la droite (GSAP)
 * - Liste scrollable avec produits
 * - Footer sticky avec total et bouton paiement
 */
export default function CartDrawer() {
  const {
    cartItems,
    isOpen,
    cartTotal,
    closeCart,
    removeFromCart,
    updateQuantity,
  } = useCart();
  const drawerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  /**
   * Animation GSAP : Slide-in depuis la droite
   */
  useEffect(() => {
    if (!drawerRef.current) return;

    const ctx = gsap.context(() => {
      if (isOpen) {
        // Entrée : Slide depuis la droite
        gsap.fromTo(
          drawerRef.current,
          {
            x: "100%",
            visibility: "visible",
          },
          {
            x: 0,
            duration: 0.5,
            ease: "power3.out",
          }
        );

        // Overlay backdrop
        if (overlayRef.current) {
          gsap.fromTo(
            overlayRef.current,
            {
              opacity: 0,
              visibility: "visible",
            },
            {
              opacity: 1,
              duration: 0.3,
            }
          );
        }
      } else {
        // Sortie : Slide vers la droite
        gsap.to(drawerRef.current, {
          x: "100%",
          duration: 0.4,
          ease: "power2.in",
          onComplete: () => {
            if (drawerRef.current) {
              gsap.set(drawerRef.current, { visibility: "hidden" });
            }
            if (overlayRef.current) {
              gsap.set(overlayRef.current, { visibility: "hidden" });
            }
          },
        });

        // Fade out overlay
        if (overlayRef.current) {
          gsap.to(overlayRef.current, {
            opacity: 0,
            duration: 0.3,
          });
        }
      }
    }, drawerRef);

    return () => ctx.revert();
  }, [isOpen]);

  /**
   * Scroll lock quand le drawer est ouvert
   */
  useEffect(() => {
    if (isOpen) {
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
  }, [isOpen]);

  /**
   * Formater le prix en euros
   */
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    }).format(price);
  };

  return (
    <>
      {/* Overlay Backdrop */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/40 z-[60]"
        style={{ visibility: "hidden" }}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Cart Drawer */}
      <div
        ref={drawerRef}
        className="fixed right-0 top-0 h-[100dvh] w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col"
        style={{ visibility: "hidden", transform: "translateX(100%)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-black/10">
          <h2 className="text-xs uppercase tracking-widest font-bold">Panier</h2>
          <button
            onClick={closeCart}
            className="p-2 hover:opacity-50 transition-opacity"
            aria-label="Fermer le panier"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {cartItems.length === 0 ? (
            // Panier vide
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag size={48} strokeWidth={1} className="mb-4 text-gray-300" />
              <p className="text-sm text-gray-600 mb-4">Votre panier est vide.</p>
              <Link
                href="/"
                onClick={closeCart}
                className="text-xs uppercase tracking-widest font-medium border-b border-black pb-1 hover:opacity-50 transition-opacity"
              >
                Commencer le shopping
              </Link>
            </div>
          ) : (
            // Liste des produits
            <div className="space-y-6">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 pb-6 border-b border-black/10 last:border-b-0"
                >
                  {/* Image produit */}
                  <div className="relative w-20 h-20 bg-gray-100 flex-shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                        Image
                      </div>
                    )}
                  </div>

                  {/* Infos produit */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/product/${item.slug}`}
                      onClick={closeCart}
                      className="block"
                    >
                      <h3 className="text-sm font-medium uppercase tracking-wide mb-1 hover:opacity-50 transition-opacity">
                        {item.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-gray-600 mb-3">
                      {formatPrice(item.price)}
                    </p>

                    {/* Contrôles quantité */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1 hover:opacity-50 transition-opacity"
                        aria-label="Diminuer la quantité"
                      >
                        <Minus size={16} strokeWidth={1.5} />
                      </button>
                      <span className="text-sm font-medium w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1 hover:opacity-50 transition-opacity"
                        aria-label="Augmenter la quantité"
                      >
                        <Plus size={16} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>

                  {/* Prix total et supprimer */}
                  <div className="flex flex-col items-end justify-between">
                    <p className="text-sm font-medium">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="mt-auto p-1 hover:opacity-50 transition-opacity"
                      aria-label="Supprimer le produit"
                    >
                      <X size={16} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer sticky */}
        {cartItems.length > 0 && (
          <div className="border-t border-black/10 px-6 py-6 space-y-4">
            {/* Sous-total */}
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest font-bold">
                Sous-total
              </span>
              <span className="text-lg font-medium">{formatPrice(cartTotal)}</span>
            </div>

            {/* Bouton Paiement */}
            <button
              onClick={() => {
                // TODO: Implémenter la redirection vers la page de paiement
                console.log("Redirection vers le paiement");
              }}
              className="w-full bg-black text-white py-4 uppercase tracking-widest text-xs font-bold hover:bg-gray-800 transition-colors"
            >
              Paiement
            </button>
          </div>
        )}
      </div>
    </>
  );
}

