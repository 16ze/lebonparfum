"use client";

import { logoutAction } from "@/app/login/actions";
import { useAuth } from "@/context/AuthContext";
import gsap from "gsap";
import {
  Heart,
  LogOut,
  Maximize2,
  Minimize2,
  Package,
  User,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * ProfileDrawer - Overlay de profil (style Byredo)
 *
 * Design :
 * - Slide depuis la droite
 * - Mode normal (480px) : Menu de navigation
 * - Mode expanded (full width) : Contenu complet
 * - Animation GSAP
 * - Backdrop blur
 */
export default function ProfileDrawer() {
  const {
    user,
    isProfileDrawerOpen,
    isProfileExpanded,
    currentProfileView,
    closeProfileDrawer,
    toggleExpand,
    setProfileView,
  } = useAuth();
  const router = useRouter();
  const drawerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLIFrameElement>(null);

  /**
   * Animation GSAP : Slide-in depuis la droite
   */
  useEffect(() => {
    if (!drawerRef.current || !overlayRef.current) return;

    const ctx = gsap.context(() => {
      if (isProfileDrawerOpen) {
        // Entrée
        gsap.fromTo(
          drawerRef.current,
          { x: "105%", visibility: "visible" },
          { x: 0, duration: 0.5, ease: "power3.out" }
        );
        gsap.to(overlayRef.current, {
          opacity: 1,
          duration: 0.3,
          ease: "power2.out",
        });
      } else {
        // Sortie
        gsap.to(drawerRef.current, {
          x: "105%",
          duration: 0.4,
          ease: "power2.in",
          onComplete: () => {
            if (drawerRef.current) {
              drawerRef.current.style.visibility = "hidden";
            }
          },
        });
        gsap.to(overlayRef.current, {
          opacity: 0,
          duration: 0.2,
          ease: "power2.in",
        });
      }
    });

    return () => ctx.revert();
  }, [isProfileDrawerOpen]);

  /**
   * Animation de resize entre normal et expanded
   */
  useEffect(() => {
    if (!drawerRef.current || !isProfileDrawerOpen) return;

    gsap.to(drawerRef.current, {
      width: isProfileExpanded ? "100vw" : "480px",
      duration: 0.4,
      ease: "power2.inOut",
    });
  }, [isProfileExpanded, isProfileDrawerOpen]);

  /**
   * Déconnexion
   */
  const handleLogout = async () => {
    closeProfileDrawer();
    await logoutAction();
  };

  /**
   * Navigation vers une vue
   */
  const handleNavigate = (view: "profile" | "orders" | "wishlist") => {
    setProfileView(view);

    // Si en mode normal, ouvrir la page dans un nouvel onglet ou naviguer
    if (!isProfileExpanded) {
      const routes = {
        profile: "/account/profile",
        orders: "/account/orders",
        wishlist: "/account/wishlist",
      };
      router.push(routes[view]);
      closeProfileDrawer();
    }
  };

  if (!isProfileDrawerOpen || !user) return null;

  return (
    <>
      {/* Backdrop flou */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998] opacity-0"
        onClick={closeProfileDrawer}
        style={{ visibility: isProfileDrawerOpen ? "visible" : "hidden" }}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="fixed top-4 right-4 bottom-4 bg-white rounded-3xl shadow-2xl z-[9999] flex flex-col overflow-hidden invisible"
        style={{ width: "480px" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-sm uppercase tracking-[0.3em] font-bold">
            Mon Compte
          </h2>
          <div className="flex items-center gap-2">
            {/* Bouton Expand/Collapse */}
            <button
              onClick={toggleExpand}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
              aria-label={isProfileExpanded ? "Réduire" : "Agrandir"}
            >
              {isProfileExpanded ? (
                <Minimize2 className="w-5 h-5" />
              ) : (
                <Maximize2 className="w-5 h-5" />
              )}
            </button>
            {/* Bouton Fermer */}
            <button
              onClick={closeProfileDrawer}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Mode normal : Menu de navigation */}
          {!isProfileExpanded && (
            <div className="p-6 space-y-2">
              {/* Info utilisateur */}
              <div className="mb-8 p-4 bg-black/5 rounded-lg">
                <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">
                  Connecté en tant que
                </p>
                <p className="text-sm font-medium">{user.email}</p>
              </div>

              {/* Menu de navigation */}
              <button
                onClick={() => handleNavigate("profile")}
                className="w-full flex items-center gap-4 p-4 hover:bg-black/5 transition-colors rounded-sm text-left group"
              >
                <User
                  className="w-5 h-5 text-black/60 group-hover:text-black transition-colors"
                  strokeWidth={1.5}
                />
                <span className="text-sm uppercase tracking-widest font-medium">
                  Mon Profil
                </span>
              </button>

              <button
                onClick={() => handleNavigate("orders")}
                className="w-full flex items-center gap-4 p-4 hover:bg-black/5 transition-colors rounded-sm text-left group"
              >
                <Package
                  className="w-5 h-5 text-black/60 group-hover:text-black transition-colors"
                  strokeWidth={1.5}
                />
                <span className="text-sm uppercase tracking-widest font-medium">
                  Mes Commandes
                </span>
              </button>

              <button
                onClick={() => handleNavigate("wishlist")}
                className="w-full flex items-center gap-4 p-4 hover:bg-black/5 transition-colors rounded-sm text-left group"
              >
                <Heart
                  className="w-5 h-5 text-black/60 group-hover:text-black transition-colors"
                  strokeWidth={1.5}
                />
                <span className="text-sm uppercase tracking-widest font-medium">
                  Mes Favoris
                </span>
              </button>
            </div>
          )}

          {/* Mode expanded : Contenu complet (iframe) */}
          {isProfileExpanded && (
            <div className="w-full h-full">
              <iframe
                ref={contentRef}
                src={`/account/${currentProfileView}?embed=true`}
                className="w-full h-full border-0"
                title={`Account ${currentProfileView}`}
              />
            </div>
          )}
        </div>

        {/* Footer : Déconnexion (uniquement en mode normal) */}
        {!isProfileExpanded && (
          <div className="p-6 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 py-3 border border-red-200 text-red-600 hover:bg-red-50 transition-colors rounded-sm group"
            >
              <LogOut className="w-4 h-4" strokeWidth={1.5} />
              <span className="text-xs uppercase tracking-widest font-bold">
                Déconnexion
              </span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
