"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";

/**
 * Page de confirmation de commande après paiement Stripe
 *
 * Design Byredo :
 * - Minimaliste, centré
 * - Gros titre "MERCI"
 * - Message de confirmation épuré
 * - Bouton retour à l'accueil
 *
 * Logique :
 * - Récupère le payment_intent depuis l'URL
 * - Appelle l'API confirm-order (qui lit les items depuis Stripe metadata)
 * - Vide le panier seulement après confirmation de l'API
 */
export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const [isConfirming, setIsConfirming] = useState(true);
  const [confirmationError, setConfirmationError] = useState<string | null>(null);

  /**
   * Confirmer la commande et décrémenter le stock
   * Les items sont lus depuis les metadata Stripe (source de vérité)
   */
  useEffect(() => {
    const confirmOrder = async () => {
      // Récupérer le payment_intent depuis l'URL (Stripe l'ajoute automatiquement)
      const paymentIntentId = searchParams.get("payment_intent");

      if (!paymentIntentId) {
        console.error("❌ payment_intent manquant dans l'URL");
        setConfirmationError("Identifiant de paiement manquant");
        setIsConfirming(false);
        return;
      }

      try {
        // Appeler l'API pour confirmer la commande et décrémenter le stock
        // L'API lit les items depuis les metadata Stripe
        const response = await fetch("/api/confirm-order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            payment_intent_id: paymentIntentId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erreur lors de la confirmation de commande");
        }

        const data = await response.json();
        console.log("✅ Commande confirmée:", data);

        // **IMPORTANT : Ne vider le panier qu'après confirmation de l'API**
        clearCart();
      } catch (error) {
        console.error("❌ Erreur lors de la confirmation de commande:", error);
        setConfirmationError(
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de la confirmation de votre commande"
        );
        // On ne vide PAS le panier en cas d'erreur, pour permettre une réessai
      } finally {
        setIsConfirming(false);
      }
    };

    confirmOrder();
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

        {/* Message de confirmation ou d'erreur */}
        {isConfirming ? (
          <p className="text-sm text-gray-500 mb-12 max-w-md mx-auto">
            Confirmation de votre commande en cours...
          </p>
        ) : confirmationError ? (
          <div className="mb-12 max-w-md mx-auto">
            <p className="text-sm text-red-600 mb-4">{confirmationError}</p>
            <p className="text-xs text-gray-500">
              Votre paiement a été validé, mais une erreur technique est survenue.
              Notre équipe a été notifiée.
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-500 mb-12 max-w-md mx-auto">
            Vous recevrez un email de confirmation sous peu.
          </p>
        )}

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
