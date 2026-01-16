"use client";

import { useFocusTrap } from "@/hooks/useFocusTrap";
import gsap from "gsap";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/**
 * Drawer - Panneau latéral fullscreen style Byredo
 *
 * Design inspiré du MenuOverlay :
 * - Slide depuis la droite
 * - Fond blanc pur
 * - Layout en colonne (pas de grille)
 * - Animation GSAP fluide
 * - Scroll optimisé avec hauteur dynamique
 */

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
}: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(80);
  const focusTrapRef = useFocusTrap(isOpen);

  // Connecter la ref du drawer au focus trap
  useEffect(() => {
    if (drawerRef.current && focusTrapRef.current !== drawerRef.current) {
      (focusTrapRef as any).current = drawerRef.current;
    }
  }, [isOpen, focusTrapRef]);

  // Calculer dynamiquement la hauteur du header
  useEffect(() => {
    const calculateHeaderHeight = () => {
      const header = document.querySelector("header");
      if (header) {
        const height = header.offsetHeight;
        setHeaderHeight(height);
      } else {
        // Fallback si le header n'est pas trouvé
        setHeaderHeight(80);
      }
    };

    calculateHeaderHeight();
    window.addEventListener("resize", calculateHeaderHeight);
    return () => window.removeEventListener("resize", calculateHeaderHeight);
  }, []);

  // Animation GSAP : Slide depuis la droite
  useEffect(() => {
    if (!drawerRef.current || !overlayRef.current) return;

    const ctx = gsap.context(() => {
      if (isOpen) {
        // S'assurer que la hauteur est définie avant l'animation
        if (drawerRef.current) {
          drawerRef.current.style.height = `calc(100vh - ${headerHeight}px)`;
          drawerRef.current.style.maxHeight = `calc(100vh - ${headerHeight}px)`;
        }

        // Entrée : Slide depuis la droite + Fade overlay
        gsap.fromTo(
          drawerRef.current,
          { x: "100%", visibility: "hidden" },
          {
            x: "0%",
            visibility: "visible",
            duration: 0.6,
            ease: "power3.out",
          }
        );
        gsap.fromTo(
          overlayRef.current,
          { opacity: 0, visibility: "hidden" },
          {
            opacity: 1,
            visibility: "visible",
            duration: 0.4,
            ease: "power2.out",
          }
        );
      } else {
        // Sortie : Slide vers la droite + Fade overlay
        gsap.to(drawerRef.current, {
          x: "100%",
          duration: 0.5,
          ease: "power3.in",
          onComplete: () => {
            if (drawerRef.current) {
              drawerRef.current.style.visibility = "hidden";
            }
          },
        });
        gsap.to(overlayRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: "power2.in",
          onComplete: () => {
            if (overlayRef.current) {
              overlayRef.current.style.visibility = "hidden";
            }
          },
        });
      }
    });

    return () => ctx.revert();
  }, [isOpen, headerHeight]);

  // Bloquer le scroll du body
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      window.scrollTo(0, parseInt(scrollY || "0") * -1);
    }

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
        style={{ opacity: 0 }}
      />

      {/* Drawer - sous le header avec bordures arrondies */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className="fixed right-0 w-full md:w-[700px] lg:w-[900px] xl:w-[1100px] bg-white z-50 shadow-2xl flex flex-col rounded-tl-3xl rounded-bl-3xl"
        style={{
          transform: "translateX(100%)",
          top: `${headerHeight}px`,
          height: `calc(100vh - ${headerHeight}px)`,
          maxHeight: `calc(100vh - ${headerHeight}px)`,
          visibility: "hidden",
        }}
      >
        {/* Header fixe - style Byredo */}
        <div className="flex items-center justify-between border-b border-black/10 px-4 md:px-6 lg:px-8 py-4 md:py-6 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <h2
              id="drawer-title"
              className="text-lg md:text-xl uppercase tracking-widest font-bold truncate"
            >
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs uppercase tracking-widest text-gray-400 mt-1 truncate">
                {subtitle}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-black/5 transition-colors ml-4 flex-shrink-0 rounded-sm"
            type="button"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Contenu scrollable - Layout en colonne avec scrollbar personnalisée */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto overflow-x-hidden drawer-scrollbar"
          style={{
            minHeight: 0,
            height: 0, // Force flexbox à calculer la hauteur disponible
            maxHeight: "100%", // S'assure que le conteneur ne dépasse pas le parent
            scrollBehavior: "smooth",
            WebkitOverflowScrolling: "touch", // Scroll fluide sur macOS/iOS
            overscrollBehavior: "contain", // Empêche le scroll en chaîne
            touchAction: "pan-y", // Optimise les gestes de scroll vertical
            position: "relative", // Nécessaire pour certains navigateurs
            isolation: "isolate", // Crée un nouveau contexte d'empilement
          }}
          onWheel={(e) => {
            // Permet le scroll même si le contenu a flex-1
            e.stopPropagation();
          }}
        >
          <div className="flex flex-col min-h-full">{children}</div>
        </div>
      </div>
    </>
  );
}
