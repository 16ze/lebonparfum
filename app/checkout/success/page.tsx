"use client";

import { useCart } from "@/context/CartContext";
import { CheckCircle, Loader2, Package } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Page de Confirmation de Commande - Style Byredo
 *
 * Affichée après un paiement réussi via Stripe
 * URL: /checkout/success?payment_intent=pi_xxx
 *
 * Logique :
 * - Stripe redirige automatiquement vers cette page après paiement
 * - Le webhook Stripe a déjà créé la commande et décrémenté le stock
 * - On vide simplement le panier côté client
 *
 * Design :
 * - Centré, minimaliste, élégant
 * - Icône de succès
 * - Message de remerciement
 * - Numéro de commande (Payment Intent ID)
 */
export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasCleared = useRef(false); // Utiliser une ref pour éviter les appels multiples

  useEffect(() => {
    const pi = searchParams.get("payment_intent");
    const redirectStatus = searchParams.get("redirect_status");

    console.log("🔍 PAGE SUCCESS - Paramètres URL:", {
      payment_intent: pi,
      redirect_status: redirectStatus,
    });

    if (!pi) {
      // Si pas de payment_intent, quelque chose ne va pas
      console.error("❌ payment_intent manquant dans l'URL");
      setIsLoading(false);
      return;
    }

    setPaymentIntentId(pi);

    // ✅ CONDITION CRITIQUE : Vider le panier UNIQUEMENT si le paiement a réussi
    if (redirectStatus === "succeeded" && !hasCleared.current) {
      console.log("✅ Paiement réussi - Vidage du panier autorisé");
      console.log(
        "📦 État du panier AVANT vidage:",
        localStorage.getItem("lebonparfum-cart")
      );

      clearCart();
      hasCleared.current = true;

      // Vérification immédiate après le vidage
      setTimeout(() => {
        const cartAfter = localStorage.getItem("lebonparfum-cart");
        console.log("📦 État du panier APRÈS vidage:", cartAfter);
        if (cartAfter && cartAfter !== "[]") {
          console.error("⚠️ Le panier n'a pas été vidé correctement !");
        } else {
          console.log("✅ Vidage du panier confirmé !");
        }
      }, 100);
    } else if (redirectStatus !== "succeeded") {
      console.warn(
        "⚠️ Paiement non réussi (redirect_status:",
        redirectStatus,
        ") - Le panier est conservé"
      );
    }

    setIsLoading(false);
  }, [searchParams, clearCart]);

  // Affichage en cours de chargement
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center">
          <Loader2
            className="animate-spin mx-auto mb-4 text-black"
            size={40}
            strokeWidth={1.5}
          />
          <p className="text-sm uppercase tracking-widest text-gray-500">
            Chargement...
          </p>
        </div>
      </div>
    );
  }

  // Si pas de payment_intent, afficher un message d'erreur
  if (!paymentIntentId) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center max-w-lg">
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-widest mb-4">
            Erreur
          </h1>
          <p className="text-sm text-gray-600 mb-8">
            Impossible de confirmer votre commande. Veuillez contacter notre
            support.
          </p>
          <Link
            href="/"
            className="inline-block bg-black text-white px-8 py-4 text-xs uppercase tracking-widest font-bold hover:bg-gray-800 transition-colors"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-lg w-full text-center">
        {/* Icône de succès */}
        <div className="mb-8 flex justify-center">
          <div className="w-20 h-20 bg-black flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-white" strokeWidth={1.5} />
          </div>
        </div>

        {/* Titre */}
        <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-widest mb-4">
          Commande Confirmée
        </h1>

        {/* Message de remerciement */}
        <p className="text-sm md:text-base text-gray-600 mb-8 leading-relaxed">
          Merci pour votre achat. Votre commande a été enregistrée avec succès
          et un email de confirmation vous a été envoyé.
        </p>

        {/* Numéro de commande */}
        <div className="border border-black/10 p-6 mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Package className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
            <span className="text-xs uppercase tracking-widest text-gray-400 font-medium">
              Numéro de commande
            </span>
          </div>
          <p className="text-sm font-mono text-black break-all">
            {paymentIntentId}
          </p>
        </div>

        {/* Informations de livraison */}
        <div className="bg-gray-50 border border-black/5 p-6 mb-8">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">
            Prochaines étapes
          </p>
          <ul className="text-sm text-gray-600 space-y-2 text-left">
            <li className="flex items-start gap-2">
              <span className="text-black">•</span>
              <span>
                Vous recevrez un email de confirmation sous quelques minutes
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-black">•</span>
              <span>Votre commande sera expédiée sous 24-48h ouvrées</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-black">•</span>
              <span>Un numéro de suivi vous sera communiqué par email</span>
            </li>
          </ul>
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/"
            className="flex-1 bg-black text-white px-6 py-4 text-xs uppercase tracking-widest font-bold hover:bg-gray-800 transition-colors text-center"
          >
            Retour à la boutique
          </Link>

          <Link
            href="/account"
            className="flex-1 border border-black/20 text-black px-6 py-4 text-xs uppercase tracking-widest font-medium hover:bg-black/5 transition-colors text-center"
          >
            Mon compte
          </Link>
        </div>

        {/* Message de support */}
        <p className="mt-8 text-xs text-gray-400 uppercase tracking-wider">
          Besoin d'aide ?{" "}
          <a
            href="mailto:contact@lebonparfum.com"
            className="text-black hover:underline"
          >
            Contactez-nous
          </a>
        </p>
      </div>
    </div>
  );
}
