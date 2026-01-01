"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
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
  productId: string; // ID unique du produit (slug ou UUID)
  slug: string; // Slug pour l'URL
  collection: string;
  title: string;
  price: string; // Prix formaté en string (ex: "15,00 €")
  priceNumeric: number; // Prix en nombre pour les calculs
  description: string;
  variants: { id: string; label: string; value: string }[];
  image?: string; // URL de l'image du produit
  notes?: string;
  ingredients?: string;
  shipping?: string;
}

export default function ProductInfo({
  productId,
  slug,
  collection,
  title,
  price,
  priceNumeric,
  description,
  variants,
  image,
  notes,
  ingredients,
  shipping,
}: ProductInfoProps) {
  const [selectedVariant, setSelectedVariant] = useState(variants[0]?.id);
  const { addToCart, openCart } = useCart();

  /**
   * handleAddToCart - Ajoute le produit au panier et ouvre le drawer
   */
  const handleAddToCart = () => {
    // Créer un ID unique pour cette combinaison produit + variante
    // Si plusieurs variantes, on les traite comme des produits distincts
    const cartItemId = variants.length > 0 
      ? `${productId}-${selectedVariant}`
      : productId;

    // Nom complet avec variante si applicable
    const productName = variants.length > 0
      ? `${title} - ${variants.find(v => v.id === selectedVariant)?.label || selectedVariant}`
      : title;

    addToCart({
      id: cartItemId,
      name: productName,
      price: priceNumeric,
      image: image,
      slug: slug,
    });

    // Ouvrir le drawer pour montrer que le produit a été ajouté
    openCart();
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

