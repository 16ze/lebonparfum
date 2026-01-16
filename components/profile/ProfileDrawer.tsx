"use client";

import { useAuth } from "@/context/AuthContext";
import clsx from "clsx";
import gsap from "gsap";
import {
  Heart,
  LayoutDashboard,
  LogOut,
  Maximize2,
  Minimize2,
  Package,
  Settings,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { signout } from "@/app/login/actions";

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
    isAdmin,
    isProfileDrawerOpen,
    isProfileExpanded,
    currentProfileView,
    closeProfileDrawer,
    toggleExpand,
    setProfileView,
    refreshUser,
    openAuthDrawer,
    setIsLoggingOut,
    isLoggingOut,
  } = useAuth();
  const router = useRouter();
  const drawerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLIFrameElement>(null);

  // CRITIQUE : Rafraîchir le statut admin à chaque ouverture du drawer
  // Pour s'assurer que le menu affiche correctement les options admin/client
  // IMPORTANT : Ne JAMAIS rafraîchir pendant la déconnexion
  useEffect(() => {
    // Ne pas rafraîchir si :
    // 1. Le drawer n'est pas ouvert
    // 2. Pas d'utilisateur
    // 3. Déconnexion en cours (CRITIQUE : empêcher les conflits)
    if (!isProfileDrawerOpen || !user || isLoggingOut) {
      if (isLoggingOut) {
        console.log("🚫 Rafraîchissement bloqué - Déconnexion en cours");
      }
      return;
    }
    
      console.log("🔍 ProfileDrawer ouvert - Rafraîchissement du statut admin...");
      console.log("🔍 État actuel - isAdmin:", isAdmin, "user:", user.email);
      
      // FORCER le rafraîchissement à chaque ouverture pour garantir la cohérence
      refreshUser().then(() => {
        console.log("✅ Rafraîchissement terminé");
      }).catch((error) => {
        console.error("❌ Erreur lors du rafraîchissement:", error);
      });
  }, [isProfileDrawerOpen, user?.id, isLoggingOut]);

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

    const updateWidth = () => {
      if (!drawerRef.current) return;
      const isMobile = window.innerWidth < 768;
      const normalWidth = isMobile ? "95vw" : "480px";
      // Sur mobile, en mode expanded, on prend toute la largeur sauf un petit padding
      const expandedWidth = isMobile ? "100vw" : "98vw";

      gsap.to(drawerRef.current, {
        width: isProfileExpanded ? expandedWidth : normalWidth,
        // Sur mobile expanded, retirer les marges
        top: isProfileExpanded && isMobile ? 0 : undefined,
        right: isProfileExpanded && isMobile ? 0 : undefined,
        bottom: isProfileExpanded && isMobile ? 0 : undefined,
        borderRadius: isProfileExpanded && isMobile ? 0 : undefined,
        duration: 0.4,
        ease: "power2.inOut",
      });
    };

    updateWidth();

    // Re-calculer au resize
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [isProfileExpanded, isProfileDrawerOpen]);

  /**
   * CRITIQUE : Si l'utilisateur se déconnecte pendant que le drawer est ouvert,
   * fermer immédiatement le ProfileDrawer et ouvrir l'AuthDrawer
   * 
   * IMPORTANT : Ce useEffect doit être AVANT tous les early returns
   * pour respecter les règles des Hooks de React
   * 
   * IMPORTANT : Ne pas exécuter pendant la déconnexion manuelle (isLoggingOut)
   * car handleLogout gère déjà la fermeture et l'ouverture de l'AuthDrawer
   */
  useEffect(() => {
    // Ne pas exécuter si :
    // 1. Le drawer n'est pas ouvert
    // 2. L'utilisateur existe encore
    // 3. Déconnexion en cours (handleLogout gère déjà)
    if (!isProfileDrawerOpen || user || isLoggingOut) {
      return;
    }
    
    console.log("⚠️ ProfileDrawer ouvert mais user est null - Fermeture automatique + Ouverture AuthDrawer");
    closeProfileDrawer();
    // Ouvrir l'AuthDrawer après un court délai pour permettre la fermeture du ProfileDrawer
    setTimeout(() => {
      openAuthDrawer();
    }, 100);
  }, [isProfileDrawerOpen, user, isLoggingOut, closeProfileDrawer, openAuthDrawer]);

  /**
   * Déconnexion - Utilise une Server Action pour garantir la destruction du cookie HttpOnly
   */
  const handleLogout = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    // Empêcher les clics multiples
    if (isLoggingOut) {
      console.log("⚠️ Déconnexion déjà en cours...");
      return;
    }
    
    try {
      console.log("🔓 ========== DÉBUT DÉCONNEXION ==========");
      console.log("🔍 État actuel - user:", user?.email, "isOpen:", isProfileDrawerOpen);
      
      // 1. Fermer le drawer visuellement tout de suite (UX)
      console.log("🔍 Fermeture du ProfileDrawer...");
      closeProfileDrawer();
      
      // 2. Activer le flag de déconnexion pour empêcher toute réouverture
      console.log("🔒 Activation du flag isLoggingOut...");
      setIsLoggingOut(true);
      
      // 3. Appeler la Server Action (C'est elle qui détruit le cookie HttpOnly et redirige)
      console.log("🔍 Appel de la Server Action signout()...");
      await signout();
      
      // Note: signout() redirige, donc le code suivant ne sera jamais exécuté
      // Mais on le laisse pour le cas où il y aurait une erreur
      console.log("✅ Déconnexion réussie");
      
    } catch (error: any) {
      // Si c'est la redirection Next.js, on ne fait rien (c'est le comportement attendu)
      // Next.js implémente redirect() en lançant une erreur spéciale "NEXT_REDIRECT"
      if (error?.message === 'NEXT_REDIRECT' || error?.message?.includes('NEXT_REDIRECT') || error?.digest?.includes('NEXT_REDIRECT')) {
        console.log("✅ Redirection Next.js détectée - Comportement normal");
        return;
      }

      // Pour toute autre erreur, on la log et on affiche une alerte
      console.error("❌ Erreur lors de la déconnexion:", error);
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      alert(`Erreur lors de la déconnexion: ${errorMessage}`);
      setIsLoggingOut(false);
    }
  };

  /**
   * Navigation vers une vue
   */
  const handleNavigate = (view: "profile" | "orders" | "wishlist" | "dashboard" | "products" | "settings") => {
    setProfileView(view);

    // Si en mode normal, naviguer vers la page
    if (!isProfileExpanded) {
      const clientRoutes = {
        profile: "/account/profile",
        orders: "/account/orders",
        wishlist: "/account/wishlist",
      };

      const adminRoutes = {
        dashboard: "/admin/dashboard",
        products: "/admin/products",
        orders: "/admin/orders",
        settings: "/admin/settings",
      };

      const routes = isAdmin ? adminRoutes : clientRoutes;
      const route = routes[view as keyof typeof routes];

      if (route) {
        router.push(route);
        closeProfileDrawer();
      }
    }
  };

  // Early returns : APRÈS tous les Hooks (règle des Hooks de React)
  // Ne pas afficher si le drawer est fermé
  if (!isProfileDrawerOpen) return null;
  
  // Si l'utilisateur n'est pas connecté, ne pas afficher le drawer
  if (!user) return null;

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
        className={clsx(
          "fixed bg-white shadow-2xl z-[9999] flex flex-col overflow-hidden invisible",
          // Mode normal
          !isProfileExpanded && "top-4 right-4 bottom-4 w-[95vw] md:w-[480px] rounded-3xl",
          // Mode expanded sur mobile : plein écran
          isProfileExpanded && "top-0 right-0 bottom-0 left-0 w-full h-full rounded-none md:top-4 md:right-4 md:bottom-4 md:left-auto md:w-[98vw] md:rounded-3xl"
        )}
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
              {isAdmin ? (
                // Menu Admin
                <>
                  <button
                    onClick={() => handleNavigate("dashboard")}
                    className="w-full flex items-center gap-4 p-4 hover:bg-black/5 transition-colors rounded-sm text-left group"
                  >
                    <LayoutDashboard
                      className="w-5 h-5 text-black/60 group-hover:text-black transition-colors"
                      strokeWidth={1.5}
                    />
                    <span className="text-sm uppercase tracking-widest font-medium">
                      Dashboard
                    </span>
                  </button>

                  <button
                    onClick={() => handleNavigate("products")}
                    className="w-full flex items-center gap-4 p-4 hover:bg-black/5 transition-colors rounded-sm text-left group"
                  >
                    <Package
                      className="w-5 h-5 text-black/60 group-hover:text-black transition-colors"
                      strokeWidth={1.5}
                    />
                    <span className="text-sm uppercase tracking-widest font-medium">
                      Produits
                    </span>
                  </button>

                  <button
                    onClick={() => handleNavigate("orders")}
                    className="w-full flex items-center gap-4 p-4 hover:bg-black/5 transition-colors rounded-sm text-left group"
                  >
                    <ShoppingBag
                      className="w-5 h-5 text-black/60 group-hover:text-black transition-colors"
                      strokeWidth={1.5}
                    />
                    <span className="text-sm uppercase tracking-widest font-medium">
                      Commandes
                    </span>
                  </button>

                  <button
                    onClick={() => handleNavigate("settings")}
                    className="w-full flex items-center gap-4 p-4 hover:bg-black/5 transition-colors rounded-sm text-left group"
                  >
                    <Settings
                      className="w-5 h-5 text-black/60 group-hover:text-black transition-colors"
                      strokeWidth={1.5}
                    />
                    <span className="text-sm uppercase tracking-widest font-medium">
                      Paramètres
                    </span>
                  </button>
                </>
              ) : (
                // Menu Client
                <>
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
                </>
              )}
            </div>
          )}

          {/* Mode expanded : Contenu complet (iframe) */}
          {isProfileExpanded && (
            <div className="w-full h-full">
              <iframe
                ref={contentRef}
                src={
                  isAdmin
                    ? `/admin/${currentProfileView === "profile" ? "dashboard" : currentProfileView}?embed=true`
                    : `/account/${currentProfileView}?embed=true`
                }
                className="w-full h-full border-0"
                title={`${isAdmin ? "Admin" : "Account"} ${currentProfileView}`}
                style={{
                  // Forcer le zoom sur mobile pour éviter le problème de viewport
                  transform: typeof window !== "undefined" && window.innerWidth < 768 ? "scale(1)" : "scale(1)",
                  transformOrigin: "top left",
                }}
              />
            </div>
          )}
        </div>

        {/* Footer : Déconnexion (uniquement en mode normal) */}
        {!isProfileExpanded && (
          <div className="p-6 border-t border-gray-100">
            <button
              type="button"
              onClick={(e) => {
                console.log("🖱️ Bouton déconnexion cliqué");
                handleLogout(e);
              }}
              disabled={isLoggingOut}
              className={`w-full flex items-center justify-center gap-3 py-3 border border-red-200 text-red-600 hover:bg-red-50 transition-colors rounded-sm group ${
                isLoggingOut ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <LogOut className={`w-4 h-4 ${isLoggingOut ? "animate-pulse" : ""}`} strokeWidth={1.5} />
              <span className="text-xs uppercase tracking-widest font-bold">
                {isLoggingOut ? "Déconnexion..." : "Déconnexion"}
              </span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
