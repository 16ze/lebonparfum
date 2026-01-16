"use client";

import { useEffect, useRef } from "react";

/**
 * Hook pour implémenter un focus trap dans les modals/drawers
 * 
 * Empêche le focus de sortir du conteneur et le fait boucler
 * 
 * Usage:
 * const focusTrapRef = useFocusTrap(isOpen);
 * // Connecter la ref: (focusTrapRef as any).current = yourElementRef.current
 */
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLElement | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) {
      // Nettoyer si désactivé
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      return;
    }

    const container = containerRef.current;
    
    // Attendre un tick pour que le DOM soit prêt
    const timeoutId = setTimeout(() => {
      if (!container) return;

      const focusableElements = container.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (!firstElement || !lastElement) return;

      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key !== "Tab") return;

        if (e.shiftKey) {
          // Shift + Tab : aller à l'élément précédent
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab : aller à l'élément suivant
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      };

      // Focus sur le premier élément au montage
      firstElement.focus();

      container.addEventListener("keydown", handleTabKey);

      // Stocker la fonction de cleanup
      cleanupRef.current = () => {
        container.removeEventListener("keydown", handleTabKey);
      };
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [isActive]);

  return containerRef;
}
