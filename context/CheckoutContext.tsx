"use client";

import { createContext, useContext, useState, ReactNode } from "react";

/**
 * CheckoutContext - Gestion des données de checkout
 *
 * Fonctionnalités :
 * - Stockage de l'adresse de livraison
 * - Validation des champs
 * - Accessibilité entre CheckoutForm et PaymentForm
 */

export interface ShippingAddress {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
}

interface CheckoutContextType {
  shippingAddress: ShippingAddress;
  setShippingAddress: (address: ShippingAddress) => void;
  updateField: (field: keyof ShippingAddress, value: string) => void;
  isAddressComplete: () => boolean;
  resetCheckout: () => void;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(
  undefined
);

/**
 * Adresse par défaut (vide)
 */
const defaultAddress: ShippingAddress = {
  email: "",
  firstName: "",
  lastName: "",
  address: "",
  city: "",
  postalCode: "",
  country: "France", // Valeur par défaut
  phone: "",
};

/**
 * CheckoutProvider - Provider du contexte checkout
 */
export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [shippingAddress, setShippingAddress] =
    useState<ShippingAddress>(defaultAddress);

  /**
   * updateField - Met à jour un champ spécifique de l'adresse
   */
  const updateField = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * isAddressComplete - Vérifie que tous les champs obligatoires sont remplis
   */
  const isAddressComplete = (): boolean => {
    const { email, firstName, lastName, address, city, postalCode } =
      shippingAddress;

    // Tous les champs obligatoires doivent être remplis
    return (
      email.trim() !== "" &&
      firstName.trim() !== "" &&
      lastName.trim() !== "" &&
      address.trim() !== "" &&
      city.trim() !== "" &&
      postalCode.trim() !== ""
    );
  };

  /**
   * resetCheckout - Réinitialise l'adresse (après commande réussie)
   */
  const resetCheckout = () => {
    setShippingAddress(defaultAddress);
  };

  return (
    <CheckoutContext.Provider
      value={{
        shippingAddress,
        setShippingAddress,
        updateField,
        isAddressComplete,
        resetCheckout,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

/**
 * useCheckout - Hook personnalisé pour accéder au contexte checkout
 * @throws Error si utilisé en dehors d'un CheckoutProvider
 */
export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error("useCheckout must be used within a CheckoutProvider");
  }
  return context;
}

