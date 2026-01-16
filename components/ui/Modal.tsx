"use client";

import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";

/**
 * Modal - Composant modal réutilisable avec scroll fonctionnel
 *
 * Design Byredo : Modal fullscreen avec overlay noir
 * Scroll fonctionnel avec trackpad/molette
 */

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
}

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "3xl",
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const focusTrapRef = useFocusTrap(isOpen);
  
  // Connecter la ref du modal au focus trap
  useEffect(() => {
    if (modalRef.current && focusTrapRef.current !== modalRef.current) {
      (focusTrapRef as any).current = modalRef.current;
    }
  }, [isOpen, focusTrapRef]);

  // Bloquer le scroll du body quand le modal est ouvert
  useEffect(() => {
    if (isOpen) {
      // Sauvegarder la position actuelle du scroll
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      // Restaurer la position du scroll
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  // Fermer au clic sur l'overlay
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center overflow-y-auto p-4"
      style={{ paddingTop: "2rem", paddingBottom: "2rem" }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`bg-white w-full ${maxWidthClasses[maxWidth]} min-h-[200px]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header fixe */}
        <div className="flex items-center justify-between border-b border-black/10 px-8 py-6 bg-white sticky top-0 z-10">
          <div>
            <h2 id="modal-title" className="text-2xl uppercase tracking-widest font-bold">
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
            className="p-2 hover:bg-black/5 transition-colors"
            type="button"
            aria-label="Fermer"
          >
            <X className="w-6 h-6" strokeWidth={1.5} />
          </button>
        </div>

        {/* Contenu */}
        <div>{children}</div>
      </div>
    </div>
  );
}
