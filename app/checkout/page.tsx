"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Elements } from "@stripe/react-stripe-js";
import { useCart } from "@/context/CartContext";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import CheckoutSummary from "@/components/checkout/CheckoutSummary";
import PaymentForm from "@/components/checkout/PaymentForm";
import { getStripe } from "@/utils/stripe";
import { ChevronRight, Loader2 } from "lucide-react";
import type { PaymentCartItem } from "@/types/payment";

/**
 * Page Checkout - Paiement sécurisé avec Stripe
 *
 * Design Byredo :
 * - Layout split-screen (Formulaire gauche, Résumé droite)
 * - Pas de Header/Footer (distraction-free)
 * - Style minimaliste et épuré
 * - Intégration Stripe Elements pour le paiement
 */
export default function CheckoutPage() {
  const { cartItems } = useCart();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Debug: Log le clientSecret quand il est disponible
   */
  useEffect(() => {
    if (clientSecret) {
      console.log("🎨 clientSecret disponible pour Stripe Elements:", {
        preview: `${clientSecret.substring(0, 20)}...`,
        length: clientSecret.length,
      });
    }
  }, [clientSecret]);

  /**
   * Créer le Payment Intent au montage du composant
   */
  useEffect(() => {
    const createPaymentIntent = async () => {
      if (cartItems.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Préparer les items pour l'API (id et quantity uniquement)
        const items: PaymentCartItem[] = cartItems.map((item) => ({
          id: item.slug || item.id, // Utiliser slug comme identifiant principal
          quantity: item.quantity,
        }));

        // Appeler l'API pour créer le Payment Intent
        console.log("📤 Création du Payment Intent avec items:", items);
        
        let response: Response;
        try {
          response = await fetch("/api/create-payment-intent", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ items }),
          });
        } catch (fetchError) {
          console.error("❌ Erreur réseau lors du fetch:", fetchError);
          const errorMessage =
            fetchError instanceof Error
              ? fetchError.message
              : "Erreur réseau inconnue";
          
          // Si c'est une erreur "Failed to fetch", c'est probablement que le serveur n'est pas démarré
          if (errorMessage.includes("Failed to fetch") || errorMessage.includes("fetch")) {
            throw new Error(
              "Impossible de contacter le serveur. Vérifiez que le serveur Next.js est démarré (npm run dev)."
            );
          }
          
          throw new Error(`Erreur réseau: ${errorMessage}`);
        }

        if (!response.ok) {
          let errorData: { message?: string };
          try {
            errorData = await response.json();
          } catch {
            errorData = {
              message: `Erreur HTTP ${response.status} ${response.statusText}`,
            };
          }
          console.error("❌ Erreur API create-payment-intent:", {
            status: response.status,
            statusText: response.statusText,
            error: errorData,
          });
          throw new Error(errorData.message || "Erreur lors de la création du paiement");
        }

        let data: { clientSecret?: string; amount?: number };
        try {
          data = await response.json();
        } catch (jsonError) {
          console.error("❌ Erreur lors du parsing de la réponse JSON:", jsonError);
          throw new Error("Réponse serveur invalide (format JSON attendu)");
        }

        console.log("✅ Payment Intent créé:", {
          clientSecret: data.clientSecret ? "✅ Présent" : "❌ Manquant",
          clientSecretPreview: data.clientSecret ? `${data.clientSecret.substring(0, 20)}...` : "null",
          amount: data.amount,
        });
        if (!data.clientSecret) {
          console.error("❌ ERREUR CRITIQUE : Pas de clientSecret retourné par le serveur !");
          throw new Error("Le serveur n'a pas retourné de clientSecret");
        }
        console.log("💾 clientSecret défini dans le state");
        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error("❌ Erreur lors de la création du payment intent:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Une erreur est survenue lors de la création du paiement";
        setError(errorMessage);
        console.error("❌ Détails de l'erreur:", {
          message: errorMessage,
          cartItems: cartItems.length,
        });
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, [cartItems]);

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

  // Options d'apparence Stripe (style Byredo)
  const stripeOptions = {
    clientSecret,
    appearance: {
      theme: "stripe" as const,
      variables: {
        colorPrimary: "#000000",
        fontFamily: "Inter, sans-serif",
        fontSizeBase: "14px",
        spacingUnit: "4px",
        borderRadius: "0px", // Angles droits style Byredo
      },
      rules: {
        ".Input": {
          borderBottom: "1px solid rgba(0, 0, 0, 0.2)",
          borderTop: "none",
          borderLeft: "none",
          borderRight: "none",
          borderRadius: "0",
          paddingBottom: "8px",
        },
        ".Input:focus": {
          borderBottom: "1px solid #000000",
          boxShadow: "none",
        },
        ".Label": {
          fontSize: "10px",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          fontWeight: "500",
          color: "#6b7280",
        },
      },
    },
  };

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
              THE PARFUMERIEE
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

          {/* Formulaire avec intégration Stripe */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="animate-spin mx-auto mb-4 text-gray-400" size={32} />
                <p className="text-sm text-gray-500 uppercase tracking-wide">
                  Chargement du module de paiement...
                </p>
              </div>
            </div>
          ) : error ? (
            <div>
              <CheckoutForm />
              <div className="mt-8 bg-red-50 border border-red-200 rounded-sm p-6">
                <p className="text-sm text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-xs uppercase tracking-widest font-medium text-red-600 hover:underline"
                >
                  Réessayer
                </button>
              </div>
            </div>
          ) : clientSecret ? (
            <Elements stripe={getStripe()} options={stripeOptions}>
              <CheckoutForm paymentForm={<PaymentForm />} />
            </Elements>
          ) : (
            <CheckoutForm />
          )}
        </div>

        {/* COLONNE DROITE : Résumé Panier */}
        <div className="bg-gray-50 p-8 lg:p-12">
          <CheckoutSummary />
        </div>
      </div>
    </div>
  );
}
