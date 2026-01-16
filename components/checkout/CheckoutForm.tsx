"use client";

import { useCheckout } from "@/context/CheckoutContext";
import PaymentForm from "./PaymentForm";

/**
 * CheckoutForm - Formulaire d'adresse et zone de paiement
 *
 * Design Byredo :
 * - Inputs épurés avec border-b seulement
 * - Labels flottants ou discrets
 * - Beaucoup d'espace blanc
 * - Style minimaliste
 * - Validation en temps réel
 * - Connecté au CheckoutContext
 */
interface CheckoutFormProps {
  paymentForm?: React.ReactNode; // PaymentForm sera passé en props depuis la page
}

export default function CheckoutForm({ paymentForm }: CheckoutFormProps) {
  const { shippingAddress, updateField } = useCheckout();

  /**
   * handleChange - Met à jour les valeurs du formulaire via le Context
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    updateField(name as keyof typeof shippingAddress, value);
  };

  return (
    <div className="space-y-12">
      {/* Section Livraison */}
      <section aria-labelledby="shipping-heading">
        <h2
          id="shipping-heading"
          className="text-xs uppercase tracking-widest font-bold text-gray-500 mb-8"
        >
          Livraison
        </h2>

        <div className="space-y-6">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs uppercase tracking-widest text-gray-600 mb-2"
            >
              Email <span aria-hidden="true">*</span>
              <span className="sr-only">(obligatoire)</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={shippingAddress.email}
              onChange={handleChange}
              required
              aria-required="true"
              autoComplete="email"
              className="w-full border-0 border-b border-black/20 pb-2 text-sm focus:outline-none focus:border-black transition-colors bg-transparent"
              placeholder="exemple@email.com"
            />
          </div>

          {/* Prénom et Nom (en ligne sur desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="firstName"
                className="block text-xs uppercase tracking-widest text-gray-600 mb-2"
              >
                Prénom <span aria-hidden="true">*</span>
                <span className="sr-only">(obligatoire)</span>
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={shippingAddress.firstName}
                onChange={handleChange}
                required
                aria-required="true"
                autoComplete="given-name"
                className="w-full border-0 border-b border-black/20 pb-2 text-sm focus:outline-none focus:border-black transition-colors bg-transparent"
                placeholder="Jean"
              />
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="block text-xs uppercase tracking-widest text-gray-500 mb-2"
              >
                Nom *
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={shippingAddress.lastName}
                onChange={handleChange}
                required
                className="w-full border-0 border-b border-black/20 pb-2 text-sm focus:outline-none focus:border-black transition-colors bg-transparent"
                placeholder="Dupont"
              />
            </div>
          </div>

          {/* Adresse */}
          <div>
            <label
              htmlFor="address"
              className="block text-xs uppercase tracking-widest text-gray-500 mb-2"
            >
              Adresse *
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={shippingAddress.address}
              onChange={handleChange}
              required
              className="w-full border-0 border-b border-black/20 pb-2 text-sm focus:outline-none focus:border-black transition-colors bg-transparent"
              placeholder="123 rue de la République"
            />
          </div>

          {/* Ville et Code postal (en ligne sur desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="city"
                className="block text-xs uppercase tracking-widest text-gray-500 mb-2"
              >
                Ville *
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={shippingAddress.city}
                onChange={handleChange}
                required
                className="w-full border-0 border-b border-black/20 pb-2 text-sm focus:outline-none focus:border-black transition-colors bg-transparent"
                placeholder="Paris"
              />
            </div>

            <div>
              <label
                htmlFor="postalCode"
                className="block text-xs uppercase tracking-widest text-gray-500 mb-2"
              >
                Code postal *
              </label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                value={shippingAddress.postalCode}
                onChange={handleChange}
                required
                className="w-full border-0 border-b border-black/20 pb-2 text-sm focus:outline-none focus:border-black transition-colors bg-transparent"
                placeholder="75001"
              />
            </div>
          </div>

          {/* Pays */}
          <div>
            <label
              htmlFor="country"
              className="block text-xs uppercase tracking-widest text-gray-500 mb-2"
            >
              Pays *
            </label>
            <select
              id="country"
              name="country"
              value={shippingAddress.country}
              onChange={handleChange}
              required
              className="w-full border-0 border-b border-black/20 pb-2 text-sm focus:outline-none focus:border-black transition-colors bg-transparent"
            >
              <option value="France">France</option>
              <option value="Belgique">Belgique</option>
              <option value="Suisse">Suisse</option>
              <option value="Luxembourg">Luxembourg</option>
            </select>
          </div>

          {/* Téléphone (optionnel) */}
          <div>
            <label
              htmlFor="phone"
              className="block text-xs uppercase tracking-widest text-gray-500 mb-2"
            >
              Téléphone (optionnel)
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={shippingAddress.phone || ""}
              onChange={handleChange}
              className="w-full border-0 border-b border-black/20 pb-2 text-sm focus:outline-none focus:border-black transition-colors bg-transparent"
              placeholder="+33 6 12 34 56 78"
            />
          </div>
        </div>
      </section>

      {/* Section Paiement - Intégration Stripe Elements */}
      <section>
        <h2 className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-8">
          Paiement
        </h2>

        {/* PaymentForm injecté depuis la page checkout */}
        {paymentForm || (
          <div className="border border-gray-200 rounded-sm p-8 text-center">
            <p className="text-sm text-gray-500 uppercase tracking-wide">
              Chargement du module de paiement...
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

