"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import CheckoutSummary from "@/components/checkout/CheckoutSummary";
import { ChevronRight } from "lucide-react";

/**
 * Page Checkout - Paiement sécurisé
 *
 * Design Byredo :
 * - Layout split-screen (Formulaire gauche, Résumé droite)
 * - Pas de Header/Footer (distraction-free)
 * - Style minimaliste et épuré
 * - Beaucoup d'espace blanc
 */
export default function CheckoutPage() {
  const { cartItems } = useCart();

  // Si le panier est vide, afficher un message
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wide mb-4">
            Votre panier est vide
          </h1>
          <p className="text-sm text-gray-600 mb-8">
            Ajoutez des produits à votre panier avant de procéder au paiement.
          </p>
          <Link
            href="/"
            className="inline-block bg-black text-white px-8 py-4 text-xs uppercase tracking-widest font-bold hover:bg-gray-800 transition-colors"
          >
            Retour à la boutique
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Layout Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* COLONNE GAUCHE : Formulaire */}
        <div className="bg-white p-8 lg:p-12">
          {/* En-tête */}
          <div className="mb-12">
            {/* Logo cliquable */}
            <Link
              href="/"
              className="inline-block text-base font-bold uppercase tracking-widest text-black hover:opacity-50 transition-opacity mb-6"
            >
              LE BON PARFUM
            </Link>

            {/* Fil d'Ariane */}
            <nav className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-400">
              <Link href="/" className="hover:text-black transition-colors">
                Panier
              </Link>
              <ChevronRight size={14} strokeWidth={1.5} />
              <span className="text-black font-medium">Paiement</span>
            </nav>
          </div>

          {/* Formulaire */}
          <CheckoutForm />
        </div>

        {/* COLONNE DROITE : Résumé Panier */}
        <div className="bg-gray-50 p-8 lg:p-12">
          <CheckoutSummary />
        </div>
      </div>
    </div>
  );
}

