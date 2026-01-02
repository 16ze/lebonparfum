"use client";

import { useState, FormEvent } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

/**
 * PaymentForm - Formulaire de paiement Stripe Elements
 *
 * Design Byredo :
 * - PaymentElement intégré (champ CB sécurisé)
 * - Bouton noir, large, uppercase
 * - Gestion des erreurs et du loading
 */
export default function PaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * handleSubmit - Gère la soumission du formulaire de paiement
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Confirmer le paiement avec Stripe
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // Redirection après paiement réussi
          return_url: `${window.location.origin}/checkout/success`,
        },
      });

      // Si erreur, l'afficher
      if (error) {
        setErrorMessage(
          error.message || "Une erreur est survenue lors du paiement"
        );
        setIsLoading(false);
      }
      // Si succès, l'utilisateur sera redirigé vers /checkout/success
    } catch (err) {
      console.error("Erreur lors du paiement:", err);
      setErrorMessage("Une erreur inattendue est survenue");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* PaymentElement - Champ CB sécurisé de Stripe */}
      <div className="mb-6">
        <PaymentElement />
      </div>

      {/* Message d'erreur */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-sm p-4">
          <p className="text-sm text-red-600">{errorMessage}</p>
        </div>
      )}

      {/* Bouton de paiement */}
      <button
        type="submit"
        disabled={!stripe || !elements || isLoading}
        className={`w-full py-4 uppercase tracking-widest text-xs font-bold transition-colors ${
          isLoading || !stripe || !elements
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-black text-white hover:bg-gray-800"
        }`}
      >
        {isLoading ? "Traitement en cours..." : "Payer maintenant"}
      </button>
    </form>
  );
}

