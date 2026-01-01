"use client";

import { useState } from "react";
import AccordionItem from "./AccordionItem";

/**
 * ProductInfo - Informations produit avec sticky desktop
 *
 * Design Byredo :
 * - Collection, Titre, Prix, Description
 * - Sélecteur de variante (taille)
 * - Bouton CTA large
 * - Accordéons pour détails
 */
interface ProductInfoProps {
  collection: string;
  title: string;
  price: string;
  description: string;
  variants: { id: string; label: string; value: string }[];
  notes?: string;
  ingredients?: string;
  shipping?: string;
}

export default function ProductInfo({
  collection,
  title,
  price,
  description,
  variants,
  notes,
  ingredients,
  shipping,
}: ProductInfoProps) {
  const [selectedVariant, setSelectedVariant] = useState(variants[0]?.id);

  /**
   * handleAddToCart - Gère l'ajout au panier
   */
  const handleAddToCart = () => {
    // TODO: Implémenter la logique d'ajout au panier
    console.log("Ajout au panier:", { title, variant: selectedVariant });
  };

  return (
    <div className="md:sticky md:top-32 h-fit">
      {/* Collection */}
      <div className="text-xs text-gray-400 uppercase tracking-widest mb-2">
        {collection}
      </div>

      {/* Titre */}
      <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-wide mb-4">
        {title}
      </h1>

      {/* Prix */}
      <div className="text-lg font-medium mb-6">{price}</div>

      {/* Description */}
      <p className="text-sm text-gray-600 leading-relaxed mb-8">
        {description}
      </p>

      {/* Sélecteur de Variante */}
      {variants.length > 0 && (
        <div className="mb-8">
          <div className="text-xs uppercase tracking-widest font-bold mb-3">
            Taille
          </div>
          <div className="flex gap-3">
            {variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => setSelectedVariant(variant.id)}
                className={`px-6 py-3 text-xs uppercase tracking-widest font-medium border border-black transition-colors ${
                  selectedVariant === variant.id
                    ? "bg-black text-white"
                    : "bg-transparent text-black hover:bg-gray-100"
                }`}
              >
                {variant.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bouton CTA */}
      <button
        onClick={handleAddToCart}
        className="w-full bg-black text-white py-4 uppercase tracking-widest text-xs font-bold hover:bg-gray-800 transition-colors mb-8"
      >
        Ajouter au panier
      </button>

      {/* Accordéons */}
      <div className="space-y-0">
        {notes && (
          <AccordionItem title="Notes Olfactives">
            <p>{notes}</p>
          </AccordionItem>
        )}

        {ingredients && (
          <AccordionItem title="Ingrédients">
            <p>{ingredients}</p>
          </AccordionItem>
        )}

        {shipping && (
          <AccordionItem title="Livraison & Retours">
            <p>{shipping}</p>
          </AccordionItem>
        )}
      </div>
    </div>
  );
}

