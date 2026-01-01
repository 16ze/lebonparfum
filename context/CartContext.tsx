"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

/**
 * CartContext - Gestion globale du panier d'achat
 *
 * Fonctionnalités :
 * - Ajout/Suppression de produits
 * - Gestion des quantités
 * - Calcul du total
 * - Persistance dans localStorage
 */

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  slug: string;
}

interface CartContextType {
  cartItems: CartItem[];
  isOpen: boolean;
  cartCount: number;
  cartTotal: number;
  addToCart: (product: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  openCart: () => void;
  closeCart: () => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

/**
 * CartProvider - Provider du contexte panier
 * Entoure l'application pour rendre le contexte disponible partout
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  /**
   * Charger le panier depuis localStorage au montage
   */
  useEffect(() => {
    setIsMounted(true);
    try {
      const savedCart = localStorage.getItem("lebonparfum-cart");
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error("Erreur lors du chargement du panier:", error);
    }
  }, []);

  /**
   * Sauvegarder le panier dans localStorage à chaque changement
   */
  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem("lebonparfum-cart", JSON.stringify(cartItems));
      } catch (error) {
        console.error("Erreur lors de la sauvegarde du panier:", error);
      }
    }
  }, [cartItems, isMounted]);

  /**
   * addToCart - Ajoute un produit au panier ou incrémente la quantité
   */
  const addToCart = (product: Omit<CartItem, "quantity">) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);

      if (existingItem) {
        // Si le produit existe déjà, incrémenter la quantité
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Sinon, ajouter le produit avec quantité 1
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  };

  /**
   * removeFromCart - Retire complètement un produit du panier
   */
  const removeFromCart = (id: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  /**
   * updateQuantity - Met à jour la quantité d'un produit (+1 ou -1)
   */
  const updateQuantity = (id: string, delta: number) => {
    setCartItems((prevItems) => {
      return prevItems
        .map((item) => {
          if (item.id === id) {
            const newQuantity = item.quantity + delta;
            // Ne pas aller en dessous de 1 (supprimer au lieu de mettre à 0)
            if (newQuantity < 1) {
              return null;
            }
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  };

  /**
   * openCart - Ouvre le drawer du panier
   */
  const openCart = () => {
    setIsOpen(true);
  };

  /**
   * closeCart - Ferme le drawer du panier
   */
  const closeCart = () => {
    setIsOpen(false);
  };

  /**
   * clearCart - Vide complètement le panier
   */
  const clearCart = () => {
    setCartItems([]);
  };

  /**
   * Calcul du nombre total d'articles
   */
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  /**
   * Calcul du montant total
   */
  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isOpen,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        openCart,
        closeCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/**
 * useCart - Hook personnalisé pour accéder au contexte panier
 * @throws Error si utilisé en dehors d'un CartProvider
 */
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

