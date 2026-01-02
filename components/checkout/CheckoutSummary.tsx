"use client";

import Image from "next/image";
import { useCart } from "@/context/CartContext";

/**
 * CheckoutSummary - Résumé du panier pour la page de checkout
 *
 * Design Byredo :
 * - Fond gris très clair
 * - Liste des produits avec images miniatures
 * - Sous-total, livraison, total TTC
 * - Style minimaliste et épuré
 */
export default function CheckoutSummary() {
  const { cartItems, cartTotal } = useCart();

  // Formater le prix en euros
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    }).format(price);
  };

  // Calculer les frais de livraison (5€ si < 100€, sinon offert)
  const SHIPPING_FEE_THRESHOLD = 100;
  const SHIPPING_FEE = 5;
  const shippingFee = cartTotal < SHIPPING_FEE_THRESHOLD ? SHIPPING_FEE : 0;
  const totalWithShipping = cartTotal + shippingFee;

  return (
    <div className="h-full flex flex-col">
      {/* Titre */}
      <div className="mb-8">
        <h2 className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-2">
          Résumé
        </h2>
      </div>

      {/* Liste des produits */}
      <div className="flex-1 overflow-y-auto mb-8 space-y-6">
        {cartItems.map((item) => (
          <div key={item.id} className="flex gap-4">
            {/* Image miniature */}
            <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100 overflow-hidden">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-[8px] text-gray-400 uppercase tracking-widest">
                    Photo
                  </span>
                </div>
              )}
            </div>

            {/* Infos produit */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium uppercase tracking-wide text-black mb-1 truncate">
                {item.name}
              </h3>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">
                Quantité: {item.quantity}
              </p>
              <p className="text-sm font-medium text-black">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Totaux */}
      <div className="border-t border-black/10 pt-6 space-y-4">
        {/* Sous-total */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 uppercase tracking-wide">Sous-total</span>
          <span className="font-medium text-black">{formatPrice(cartTotal)}</span>
        </div>

        {/* Livraison */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 uppercase tracking-wide">Livraison</span>
          <span className="font-medium text-black">
            {shippingFee > 0 ? (
              formatPrice(shippingFee)
            ) : (
              <span className="text-green-600">Offerte</span>
            )}
          </span>
        </div>

        {/* Séparateur */}
        <div className="border-t border-black/10 pt-4">
          <div className="flex justify-between">
            <span className="text-base font-bold uppercase tracking-widest text-black">
              Total TTC
            </span>
            <span className="text-base font-bold text-black">
              {formatPrice(totalWithShipping)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

