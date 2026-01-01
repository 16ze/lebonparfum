"use client";

import { createContext, useContext, useState, ReactNode } from "react";

/**
 * MenuContext - Gestion de l'état global du menu overlay
 *
 * Fournit :
 * - isOpen : État d'ouverture/fermeture du menu
 * - toggleMenu : Fonction pour ouvrir/fermer le menu
 * - closeMenu : Fonction pour fermer explicitement le menu
 */
interface MenuContextType {
  isOpen: boolean;
  toggleMenu: () => void;
  closeMenu: () => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

/**
 * MenuProvider - Provider du contexte menu
 * Entoure l'application pour rendre le contexte disponible partout
 */
export function MenuProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  /**
   * toggleMenu - Bascule l'état d'ouverture du menu
   */
  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  /**
   * closeMenu - Ferme explicitement le menu
   */
  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <MenuContext.Provider value={{ isOpen, toggleMenu, closeMenu }}>
      {children}
    </MenuContext.Provider>
  );
}

/**
 * useMenu - Hook personnalisé pour accéder au contexte menu
 * @throws Error si utilisé en dehors d'un MenuProvider
 */
export function useMenu() {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error("useMenu must be used within a MenuProvider");
  }
  return context;
}

