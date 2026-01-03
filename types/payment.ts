/**
 * Types pour le système de paiement Stripe
 */

/**
 * Item du panier envoyé par le frontend pour créer un payment intent
 * 
 * IMPORTANT : Ne contient PAS le prix (sécurité)
 * Le backend récupère toujours le prix depuis la base de données
 */
export interface PaymentCartItem {
  id: string; // ID du produit (slug ou UUID)
  quantity: number;
}

/**
 * Item de produit avec prix vérifié depuis la DB
 * Utilisé côté serveur après vérification
 */
export interface VerifiedCartItem {
  id: string;
  slug: string;
  name: string;
  price: number; // Prix en euros (ex: 15.00)
  quantity: number;
  imageUrl?: string | null;
}

/**
 * Réponse de l'API create-payment-intent
 */
export interface CreatePaymentIntentResponse {
  clientSecret: string;
  amount: number; // Montant total en centimes (ex: 1500 pour 15.00€)
  shippingFee: number; // Frais de livraison en centimes (ex: 500 pour 5.00€)
}

/**
 * Erreur de l'API create-payment-intent
 */
export interface PaymentIntentError {
  error: string;
  message: string;
}

/**
 * Item de commande stocké dans la DB (order_items)
 */
export interface OrderItem {
  product_id: string;
  product_name: string;
  product_slug: string;
  quantity: number;
  price_at_time: number; // Prix unitaire en centimes au moment de l'achat
  image_url?: string | null;
}

/**
 * Données extraites des metadata Stripe pour créer une commande
 */
export interface StripeMetadataCart {
  id: string; // Product ID ou slug
  qty: number;
}

