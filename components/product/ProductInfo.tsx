"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import AccordionItem from "./AccordionItem";
import WishlistButton from "@/components/ui/WishlistButton";
import { Check, AlertCircle } from "lucide-react";

/**
 * ProductInfo - Informations produit avec sticky desktop
 *
 * Design Byredo :
 * - Collection, Titre, Prix, Description
 * - Indicateur de stock
 * - Sélecteur de variante (taille)
 * - Bouton CTA large (désactivé si rupture)
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
  stock?: number; // Quantité en stock
  isWishlisted?: boolean; // Si le produit est dans la wishlist
  notes?: string;
  ingredients?: string;
  shipping?: string;
  categories?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  tags?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
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
  stock = 0,
  notes,
  ingredients,
  shipping,
  isWishlisted = false,
  categories,
  tags,
}: ProductInfoProps) {
  const [selectedVariant, setSelectedVariant] = useState(variants[0]?.id);
  const { addToCart, openCart } = useCart();

  // Rupture de stock ?
  const isOutOfStock = stock === 0;

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
      {/* Catégories (Famille Olfactive) */}
      <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">
        {collection}
        {categories && categories.length > 0 && (
          <>
            {" / "}
            {categories.map((cat, idx) => (
              <span key={cat.id}>
                {idx > 0 && " / "}
                <Link
                  href={`/category/${cat.slug}`}
                  className="hover:text-black hover:underline transition-colors"
                >
                  {cat.name}
                </Link>
              </span>
            ))}
          </>
        )}
      </div>

      {/* Titre */}
      <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-wide mb-4">
        {title}
      </h1>

      {/* Prix + Tags */}
      <div className="flex items-center gap-3 mb-4">
        <div className="text-lg font-medium">{price}</div>
        {tags && tags.length > 0 && (
          <div className="flex items-center gap-2">
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tag/${tag.slug}`}
                className="border border-black px-2 py-0.5 text-[10px] uppercase font-medium tracking-wide hover:bg-gray-50 transition-colors"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Indicateur de Stock */}
      <div className="flex items-center gap-2 mb-6">
        {isOutOfStock ? (
          <>
            <AlertCircle size={14} className="text-gray-400" strokeWidth={1.5} />
            <span className="text-xs uppercase tracking-widest text-gray-400">
              Rupture de stock
            </span>
          </>
        ) : (
          <>
            <Check size={14} className="text-green-600" strokeWidth={1.5} />
            <span className="text-xs uppercase tracking-widest text-green-600">
              En stock ({stock} disponible{stock > 1 ? "s" : ""})
            </span>
          </>
        )}</div>

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

      {/* Message d'urgence si stock faible */}
      {!isOutOfStock && stock > 0 && stock < 5 && (
        <div className="mb-4">
          <p className="text-xs text-red-600 uppercase tracking-widest font-medium">
            Plus que {stock} exemplaire{stock > 1 ? "s" : ""} !
          </p>
        </div>
      )}

      {/* Bouton CTA - Désactivé si rupture de stock */}
      <button
        onClick={handleAddToCart}
        disabled={isOutOfStock}
        className={`w-full py-4 uppercase tracking-widest text-xs font-bold transition-colors mb-4 ${
          isOutOfStock
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-black text-white hover:bg-gray-800"
        }`}
      >
        {isOutOfStock ? "Rupture de stock" : "Ajouter au panier"}
      </button>

      {/* Bouton Wishlist */}
      <div className="mb-8">
        <WishlistButton
          productId={productId}
          initialIsActive={isWishlisted}
          variant="text"
        />
      </div>

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

