"use client";

import { createContext, ReactNode, useContext, useState } from "react";

/**
 * MenuContext - Gestion de l'état global du menu overlay et de la recherche
 *
 * Fournit :
 * - isOpen : État d'ouverture/fermeture du menu
 * - toggleMenu : Fonction pour ouvrir/fermer le menu
 * - closeMenu : Fonction pour fermer explicitement le menu
 * - isSearchOpen : État d'ouverture/fermeture de la recherche
 * - openSearch : Fonction pour ouvrir la recherche
 * - closeSearch : Fonction pour fermer la recherche
 */
interface MenuContextType {
  isOpen: boolean;
  toggleMenu: () => void;
  closeMenu: () => void;
  isSearchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

/**
 * MenuProvider - Provider du contexte menu
 * Entoure l'application pour rendre le contexte disponible partout
 */
export function MenuProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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

  /**
   * openSearch - Ouvre la recherche
   */
  const openSearch = () => {
    setIsSearchOpen(true);
  };

  /**
   * closeSearch - Ferme la recherche
   */
  const closeSearch = () => {
    setIsSearchOpen(false);
  };

  return (
    <MenuContext.Provider
      value={{ isOpen, toggleMenu, closeMenu, isSearchOpen, openSearch, closeSearch }}
    >
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
