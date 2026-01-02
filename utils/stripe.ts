import { loadStripe, Stripe } from "@stripe/stripe-js";

/**
 * Initialisation de Stripe avec la clé publique
 * 
 * La clé publique doit être dans NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
 * dans le fichier .env.local
 */
let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    
    if (!publishableKey) {
      console.error("❌ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY manquante");
      throw new Error("Stripe publishable key is missing");
    }

    stripePromise = loadStripe(publishableKey);
  }

  return stripePromise;
};

