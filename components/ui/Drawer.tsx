"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import gsap from "gsap";

/**
 * Drawer - Panneau latéral fullscreen style Byredo
 *
 * Design inspiré du MenuOverlay :
 * - Slide depuis la droite
 * - Fond blanc pur
 * - Layout en colonne (pas de grille)
 * - Animation GSAP fluide
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

  // Animation GSAP : Slide depuis la droite
  useEffect(() => {
    if (!drawerRef.current || !overlayRef.current) return;

    const ctx = gsap.context(() => {
      if (isOpen) {
        // Entrée : Slide depuis la droite + Fade overlay
        gsap.fromTo(
          drawerRef.current,
          { x: "100%" },
          {
            x: "0%",
            duration: 0.6,
            ease: "power3.out",
          }
        );
        gsap.fromTo(
          overlayRef.current,
          { opacity: 0 },
          {
            opacity: 1,
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
        });
        gsap.to(overlayRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: "power2.in",
        });
      }
    });

    return () => ctx.revert();
  }, [isOpen]);

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
        className="fixed right-0 bottom-0 w-full md:w-[700px] lg:w-[900px] xl:w-[1100px] bg-white z-50 shadow-2xl flex flex-col rounded-tl-3xl rounded-bl-3xl"
        style={{
          transform: "translateX(100%)",
          top: "80px" // Hauteur approximative du header
        }}
      >
        {/* Header fixe - style Byredo */}
        <div className="flex items-center justify-between border-b border-black/10 px-8 py-6 flex-shrink-0">
          <div className="flex-1">
            <h2 className="text-xl uppercase tracking-widest font-bold">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs uppercase tracking-widest text-gray-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-black/5 transition-colors ml-4 flex-shrink-0"
            type="button"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Contenu scrollable - Layout en colonne */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
