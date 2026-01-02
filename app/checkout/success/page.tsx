"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

/**
 * Page de confirmation de commande après paiement Stripe
 *
 * Design Byredo :
 * - Minimaliste, centré
 * - Gros titre "MERCI"
 * - Message de confirmation épuré
 * - Bouton retour à l'accueil
 */
export default function CheckoutSuccessPage() {
  const { clearCart } = useCart();

  /**
   * Vider le panier au chargement de la page
   * La commande est payée, donc on nettoie le panier
   * Dépendance vide [] pour que ça ne se lance qu'une fois au montage
   */
  useEffect(() => {
    clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="text-center max-w-2xl">
        {/* Titre principal : MERCI */}
        <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-wider mb-6">
          MERCI
        </h1>

        {/* Sous-titre */}
        <h2 className="text-lg md:text-xl font-medium uppercase tracking-widest text-gray-600 mb-8">
          Votre commande a été validée.
        </h2>

        {/* Message de confirmation */}
        <p className="text-sm text-gray-500 mb-12 max-w-md mx-auto">
          Vous recevrez un email de confirmation sous peu.
        </p>

        {/* Bouton retour à l'accueil */}
        <Link
          href="/"
          className="inline-block bg-black text-white px-12 py-4 text-xs uppercase tracking-widest font-bold hover:bg-gray-800 transition-colors"
        >
          Retourner à l'accueil
        </Link>
      </div>
    </div>
  );
}
