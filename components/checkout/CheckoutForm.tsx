"use client";

import { useState } from "react";

/**
 * CheckoutForm - Formulaire d'adresse et zone de paiement
 *
 * Design Byredo :
 * - Inputs épurés avec border-b seulement
 * - Labels flottants ou discrets
 * - Beaucoup d'espace blanc
 * - Style minimaliste
 */
export default function CheckoutForm() {
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
  });

  /**
   * handleChange - Met à jour les valeurs du formulaire
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="space-y-12">
      {/* Section Livraison */}
      <section>
        <h2 className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-8">
          Livraison
        </h2>

        <div className="space-y-6">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs uppercase tracking-widest text-gray-500 mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border-0 border-b border-black/20 pb-2 text-sm focus:outline-none focus:border-black transition-colors bg-transparent"
              placeholder="exemple@email.com"
            />
          </div>

          {/* Prénom et Nom (en ligne sur desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="firstName"
                className="block text-xs uppercase tracking-widest text-gray-500 mb-2"
              >
                Prénom
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full border-0 border-b border-black/20 pb-2 text-sm focus:outline-none focus:border-black transition-colors bg-transparent"
                placeholder="Jean"
              />
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="block text-xs uppercase tracking-widest text-gray-500 mb-2"
              >
                Nom
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
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
              Adresse
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
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
                Ville
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full border-0 border-b border-black/20 pb-2 text-sm focus:outline-none focus:border-black transition-colors bg-transparent"
                placeholder="Paris"
              />
            </div>

            <div>
              <label
                htmlFor="postalCode"
                className="block text-xs uppercase tracking-widest text-gray-500 mb-2"
              >
                Code postal
              </label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                className="w-full border-0 border-b border-black/20 pb-2 text-sm focus:outline-none focus:border-black transition-colors bg-transparent"
                placeholder="75001"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section Paiement (Placeholder) */}
      <section>
        <h2 className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-8">
          Paiement
        </h2>

        <div className="border border-gray-200 rounded-sm p-8 text-center">
          <p className="text-sm text-gray-500 uppercase tracking-wide">
            Le module de paiement sécurisé s'affichera ici
          </p>
        </div>
      </section>
    </div>
  );
}

