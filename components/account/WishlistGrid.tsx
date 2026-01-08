"use client";

import { useState } from "react";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { toggleWishlistAction } from "@/app/wishlist/actions";
import Link from "next/link";

/**
 * WishlistGrid - Grid des produits en wishlist
 *
 * Design Byredo :
 * - Grid 2-3 colonnes responsive
 * - Cards minimalistes avec image
 * - Boutons flat sans ombres
 */

interface WishlistItem {
  id: string;
  created_at: string;
  products: {
    id: string;
    name: string;
    slug: string;
    brand: string;
    collection: string;
    price: number;
    image_url: string;
    stock: number;
  };
}

interface WishlistGridProps {
  wishlist: WishlistItem[];
}

export default function WishlistGrid({ wishlist }: WishlistGridProps) {
  const { addToCart, openCart } = useCart();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemove = async (productId: string) => {
    setRemovingId(productId);
    await toggleWishlistAction(productId);
    setRemovingId(null);
    // Recharger la page pour mettre à jour la liste
    window.location.reload();
  };

  const handleAddToCart = (product: WishlistItem["products"]) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url,
      slug: product.slug,
    });
    // Ouvrir le drawer pour montrer que le produit a été ajouté
    openCart();
  };

  if (wishlist.length === 0) {
    return (
      <div className="border border-black/10 p-12 text-center">
        <Heart size={48} strokeWidth={1} className="mx-auto mb-4 text-gray-300" />
        <h3 className="text-sm uppercase tracking-widest text-gray-500 mb-2">
          Wishlist vide
        </h3>
        <p className="text-sm text-gray-400 mb-6">
          Ajoutez des produits à vos favoris pour les retrouver facilement
        </p>
        <Link
          href="/"
          className="inline-block bg-black text-white uppercase tracking-wider text-xs py-3 px-6 hover:bg-black/80 transition-colors"
        >
          Découvrir nos parfums
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {wishlist.map((item) => {
        const product = item.products;
        const isRemoving = removingId === product.id;

        return (
          <div
            key={item.id}
            className="border border-black/10 group hover:border-black/30 transition-all"
          >
            {/* Image */}
            <Link href={`/product/${product.slug}`} className="block relative aspect-square overflow-hidden bg-gray-50">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Badge Out of Stock */}
              {product.stock === 0 && (
                <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 text-[10px] uppercase tracking-widest">
                  Rupture de stock
                </div>
              )}
            </Link>

            {/* Infos */}
            <div className="p-4">
              <Link href={`/product/${product.slug}`}>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">
                  {product.brand}
                </p>
                <h3 className="text-sm font-medium mb-1 hover:underline">
                  {product.name}
                </h3>
                <p className="text-xs text-gray-500 mb-3">{product.collection}</p>
              </Link>

              <p className="text-sm font-bold mb-4">
                {(product.price / 100).toFixed(2)} €
              </p>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock === 0}
                  className="flex-1 bg-black text-white uppercase tracking-wider text-[10px] py-3 px-4 hover:bg-black/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={14} strokeWidth={1.5} />
                  <span>Ajouter</span>
                </button>

                <button
                  onClick={() => handleRemove(product.id)}
                  disabled={isRemoving}
                  className="p-3 border border-black/20 text-gray-400 hover:text-red-600 hover:border-red-600 transition-all disabled:opacity-50"
                  title="Retirer de la wishlist"
                >
                  <Trash2 size={14} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

