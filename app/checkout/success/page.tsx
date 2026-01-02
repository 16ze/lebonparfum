"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";

/**
 * Page de succès après paiement Stripe
 *
 * Design Byredo :
 * - Message de confirmation minimaliste
 * - Bouton retour à la boutique
 */
export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

  useEffect(() => {
    // Récupérer le payment_intent depuis l'URL (Stripe redirige avec ce paramètre)
    const intentId = searchParams.get("payment_intent");
    if (intentId) {
      setPaymentIntentId(intentId);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        {/* Icône de succès */}
        <div className="mb-6 flex justify-center">
          <CheckCircle size={64} className="text-green-600" strokeWidth={1.5} />
        </div>

        {/* Titre */}
        <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wide mb-4">
          Paiement réussi
        </h1>

        {/* Message */}
        <p className="text-sm text-gray-600 mb-8">
          Merci pour votre commande. Vous recevrez un email de confirmation sous peu.
        </p>

        {/* ID de transaction (optionnel, pour debug) */}
        {paymentIntentId && (
          <p className="text-xs text-gray-400 mb-8 font-mono">
            ID: {paymentIntentId}
          </p>
        )}

        {/* Bouton retour */}
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

