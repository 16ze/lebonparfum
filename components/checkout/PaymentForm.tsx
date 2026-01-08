"use client";

import { useState, FormEvent, useEffect } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useCheckout } from "@/context/CheckoutContext";
import { useAuth } from "@/context/AuthContext";
import { AlertCircle, Lock } from "lucide-react";

/**
 * PaymentForm - Formulaire de paiement Stripe Elements
 *
 * Design Byredo :
 * - PaymentElement intégré (champ CB sécurisé)
 * - Bouton noir, large, uppercase
 * - Gestion des erreurs et du loading
 * - Validation de l'adresse avant paiement
 * - Validation de l'authentification avant paiement
 * - Envoi de l'adresse dans les metadata Stripe
 */
export default function PaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  const { shippingAddress, isAddressComplete } = useCheckout();
  const { user, isLoading: isAuthLoading, openAuthDrawer } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Debug: Log l'état de Stripe et Elements
  useEffect(() => {
    console.log("🔍 PaymentForm - État Stripe/Elements:", {
      stripe: !!stripe,
      elements: !!elements,
      user: !!user,
      isAuthLoading,
      isAddressComplete: isAddressComplete(),
    });
  }, [stripe, elements, user, isAuthLoading, isAddressComplete]);

  /**
   * handleSubmit - Gère la soumission du formulaire de paiement
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    // VALIDATION 1 : Vérifier que l'utilisateur est connecté
    if (!user) {
      console.warn("⚠️ Tentative de paiement sans authentification");
      openAuthDrawer();
      setErrorMessage("Vous devez être connecté pour passer commande.");
      return;
    }

    // VALIDATION 2 : Vérifier que l'adresse est complète
    if (!isAddressComplete()) {
      setErrorMessage(
        "Veuillez remplir tous les champs d'adresse obligatoires avant de payer."
      );
      // Scroll vers le haut pour que l'utilisateur voit les champs manquants
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      console.log("🚀 Début confirmation paiement Stripe...");
      console.log("📦 Adresse de livraison à envoyer:", shippingAddress);
      console.log("👤 Utilisateur connecté:", user.email);
      console.log("🔑 Stripe initialisé:", !!stripe);
      console.log("🔑 Elements initialisé:", !!elements);

      // Confirmer le paiement avec Stripe
      console.log("📤 Appel stripe.confirmPayment...");
      
      // IMPORTANT : Vérifier que nous avons bien un clientSecret
      const paymentElement = elements.getElement("payment");
      if (!paymentElement) {
        console.error("❌ PaymentElement non trouvé dans elements");
        setErrorMessage("Erreur: Le formulaire de paiement n'est pas chargé. Veuillez recharger la page.");
        setIsLoading(false);
        return;
      }

      console.log("✅ PaymentElement trouvé, confirmation du paiement...");
      
      const confirmParams = {
        // Redirection après paiement réussi
        return_url: `${window.location.origin}/checkout/success`,
        // Envoyer l'adresse de livraison dans les metadata
        shipping: {
          name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
          address: {
            line1: shippingAddress.address,
            city: shippingAddress.city,
            postal_code: shippingAddress.postalCode,
            country: shippingAddress.country === "France" ? "FR" : "FR",
          },
          phone: shippingAddress.phone || undefined,
        },
        receipt_email: shippingAddress.email,
      };

      console.log("📋 Paramètres de confirmation:", {
        return_url: confirmParams.return_url,
        has_shipping: !!confirmParams.shipping,
      });
      
      console.log("⏳ Appel stripe.confirmPayment en cours...");
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams,
        // IMPORTANT : Ne rediriger que si action requise (ex: 3D Secure)
        redirect: "if_required",
      });

      console.log("📥 Réponse stripe.confirmPayment reçue:", {
        hasError: !!error,
        errorType: error?.type,
        errorMessage: error?.message,
        paymentIntentId: paymentIntent?.id,
        paymentIntentStatus: paymentIntent?.status,
      });

      // Si erreur, l'afficher
      if (error) {
        console.error("❌ Erreur Stripe lors de la confirmation:", {
          type: error.type,
          code: error.code,
          message: error.message,
          decline_code: error.decline_code,
        });
        setErrorMessage(
          error.message || "Une erreur est survenue lors du paiement"
        );
        setIsLoading(false);
      } else {
        console.log("✅ Paiement confirmé avec succès:", {
          paymentIntentId: paymentIntent?.id,
          status: paymentIntent?.status,
        });
        
        // Si le statut est "succeeded", rediriger manuellement
        if (paymentIntent?.status === "succeeded") {
          console.log("💰 Paiement réussi ! Redirection vers /checkout/success...");
          window.location.href = "/checkout/success";
        } else if (paymentIntent?.status === "requires_action") {
          console.log("⏳ Action supplémentaire requise (ex: 3D Secure)...");
          // Stripe redirigera automatiquement si nécessaire
        } else {
          console.log("⚠️ Statut inattendu:", paymentIntent?.status);
          // Rediriger quand même vers success si confirmé
          window.location.href = "/checkout/success";
        }
      }
    } catch (err) {
      console.error("❌ Erreur lors du paiement:", err);
      setErrorMessage("Une erreur inattendue est survenue");
      setIsLoading(false);
    }
  };

  /**
   * handleAuthRequired - Ouvre l'AuthDrawer si non connecté
   */
  const handleAuthRequired = () => {
    openAuthDrawer();
  };

  // Vérifier si le bouton doit être désactivé
  // STRICTEMENT : seulement Stripe, Elements et isLoading
  // Les validations (user, address) sont gérées dans handleSubmit, pas ici
  const isButtonDisabled = !stripe || !elements || isLoading;

  // Message d'erreur si Stripe ou Elements ne sont pas chargés
  const stripeError =
    !stripe || !elements
      ? "Le module de paiement est en cours de chargement..."
      : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Alerte si l'utilisateur n'est pas connecté */}
      {!isAuthLoading && !user && (
        <div className="bg-red-50 border border-red-200 rounded-sm p-4 flex items-start gap-3">
          <Lock className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-800 font-medium mb-2">
              Authentification requise
            </p>
            <p className="text-xs text-red-700 mb-3">
              Vous devez être connecté pour passer commande et suivre votre
              livraison.
            </p>
            <button
              type="button"
              onClick={handleAuthRequired}
              className="text-xs uppercase tracking-widest font-bold underline hover:no-underline transition-all text-red-800"
            >
              Se connecter / Créer un compte
            </button>
          </div>
        </div>
      )}

      {/* Alerte si l'adresse est incomplète */}
      {!isAddressComplete() && user && (
        <div className="bg-amber-50 border border-amber-200 rounded-sm p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-amber-800 font-medium mb-1">
              Adresse de livraison requise
            </p>
            <p className="text-xs text-amber-700">
              Veuillez remplir tous les champs obligatoires ci-dessus pour
              continuer.
            </p>
          </div>
        </div>
      )}

      {/* PaymentElement - Champ CB sécurisé de Stripe */}
      <div className={`mb-6 ${!user ? "opacity-50 pointer-events-none" : ""}`}>
        <PaymentElement />
      </div>

      {/* Message d'erreur Stripe/Elements */}
      {stripeError && (
        <div className="bg-amber-50 border border-amber-200 rounded-sm p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-amber-800 font-medium mb-1">
              Chargement du module de paiement
            </p>
            <p className="text-xs text-amber-700">{stripeError}</p>
            {!stripe && (
              <p className="text-xs text-amber-700 mt-2">
                Vérifiez que NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY est configurée dans .env.local
              </p>
            )}
          </div>
        </div>
      )}

      {/* Message d'erreur */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-sm p-4">
          <p className="text-sm text-red-600">{errorMessage}</p>
        </div>
      )}

      {/* Bouton de paiement */}
      <button
        type="submit"
        disabled={isButtonDisabled}
        className={`w-full py-4 uppercase tracking-widest text-xs font-bold transition-colors ${
          isButtonDisabled
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-black text-white hover:bg-gray-800"
        }`}
      >
        {isLoading ? "TRAITEMENT..." : "PAYER MAINTENANT"}
      </button>

      {/* Indication de sécurité */}
      <p className="text-xs text-gray-400 text-center uppercase tracking-wider">
        Paiement sécurisé par Stripe
      </p>
    </form>
  );
}
