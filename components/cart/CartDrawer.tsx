"use client";

import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import gsap from "gsap";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * CartDrawer - Volet latéral droit pour le panier (style carte flottante)
 *
 * Design Byredo (identique au MenuOverlay) :
 * - Carte flottante arrondie (rounded-3xl)
 * - Position : fixed right-4, avec marges
 * - Fond blanc, shadow-2xl
 * - Animation slide-in depuis la droite (GSAP)
 * - Backdrop blur comme le menu
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
  const { user, openAuthDrawer } = useAuth();
  const router = useRouter();
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
            x: "105%",
            visibility: "visible",
          },
          {
            x: 0,
            duration: 0.6,
            ease: "power3.out",
          }
        );

        // Overlay backdrop avec blur
        if (overlayRef.current) {
          gsap.fromTo(
            overlayRef.current,
            {
              opacity: 0,
              backdropFilter: "blur(0px)",
              visibility: "visible",
            },
            {
              opacity: 0.8, // Gère l'opacité du backdrop
              backdropFilter: "blur(250px)", // Gère le blur du backdrop
              duration: 0.5,
              ease: "power2.out",
            }
          );
        }
      } else {
        // Sortie : Slide vers la droite
        const cleanup = () => {
          if (drawerRef.current) {
            gsap.set(drawerRef.current, { visibility: "hidden" });
          }
          if (overlayRef.current) {
            gsap.set(overlayRef.current, { visibility: "hidden" });
          }
        };

        gsap.to(drawerRef.current, {
          x: "105%",
          duration: 0.5,
          ease: "power2.in",
        });

        // Fade out overlay
        if (overlayRef.current) {
          gsap.to(overlayRef.current, {
            opacity: 0,
            backdropFilter: "blur(0px)",
            duration: 0.4,
            ease: "power2.in",
            onComplete: cleanup,
          });
        } else {
          setTimeout(cleanup, 500);
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
      {/* Overlay Backdrop - même style que MenuOverlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/80 z-[55]"
        style={{
          visibility: "hidden",
          backdropFilter: "blur(0px)",
        }}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Cart Drawer - Style carte flottante comme MenuOverlay */}
      {/* height: 100dvh = hauteur du viewport VISIBLE sur mobile (exclut la chrome du navigateur) */}
      <div
        ref={drawerRef}
        className="fixed top-4 right-4 w-[95vw] md:w-[400px] bg-white shadow-2xl rounded-3xl z-[60] overflow-hidden invisible flex flex-col"
        style={{ height: "calc(100dvh - 2rem)" }}
      >
        {/* Header - fixe */}
        <div
          className="flex items-center justify-between px-6 py-6 border-b border-black/10"
          style={{ flexShrink: 0 }}
        >
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

        {/* Footer sticky - fixe en bas */}
        {cartItems.length > 0 && (
          <div
            className="border-t border-black/10 px-6 py-6 space-y-4"
            style={{ flexShrink: 0 }}
          >
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
                // Vérifier si l'utilisateur est connecté
                if (!user) {
                  console.log("⚠️ Tentative de checkout sans authentification");
                  // Fermer le panier et ouvrir l'AuthDrawer
                  closeCart();
                  setTimeout(() => {
                    openAuthDrawer();
                  }, 300); // Délai pour permettre l'animation de fermeture du panier
                } else {
                  // Utilisateur connecté → Rediriger vers checkout
                  closeCart();
                  router.push("/checkout");
                }
              }}
              className="w-full bg-black text-white py-4 uppercase tracking-widest text-xs font-bold hover:bg-gray-800 transition-colors"
            >
              {user ? "Passer commande" : "🔒 Se connecter pour commander"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
