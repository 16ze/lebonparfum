"use client";

import { useState, useEffect } from "react";
import * as React from "react";
import { Heart } from "lucide-react";
import { toggleWishlistAction } from "@/app/wishlist/actions";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

/**
 * WishlistButton - Bouton favori réutilisable
 *
 * Design Byredo :
 * - Icône Heart (vide/plein)
 * - Animation scale au clic
 * - Feedback immédiat avec useOptimistic
 * - Ouvre AuthDrawer si non connecté
 */

interface WishlistButtonProps {
  productId: string;
  initialIsActive: boolean;
  variant?: "icon" | "text";
  className?: string;
}

export default function WishlistButton({
  productId,
  initialIsActive,
  variant = "icon",
  className = "",
}: WishlistButtonProps) {
  const { user, openAuthDrawer } = useAuth();
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  
  // State local pour feedback immédiat (optimistic UI)
  const [isActive, setIsActive] = useState(initialIsActive);
  
  // Mettre à jour le state local si initialIsActive change (après refresh)
  React.useEffect(() => {
    setIsActive(initialIsActive);
  }, [initialIsActive]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Si non connecté, ouvrir AuthDrawer
    if (!user) {
      openAuthDrawer();
      return;
    }

    // Optimistic update (feedback immédiat)
    const previousState = isActive;
    setIsActive(!isActive);
    setIsPending(true);

    try {
      const result = await toggleWishlistAction(productId);
      
      if (!result.success) {
        // En cas d'erreur, revenir à l'état précédent
        setIsActive(previousState);
        console.error("❌ Erreur toggle wishlist:", result.error);
      } else {
        // Revalider les pages pour mettre à jour l'UI
        router.refresh();
      }
    } catch (error) {
      // En cas d'erreur, revenir à l'état précédent
      setIsActive(previousState);
      console.error("❌ Erreur inattendue toggle wishlist:", error);
    } finally {
      setIsPending(false);
    }
  };

  // Variant "icon" - Pour les cartes produits
  if (variant === "icon") {
    return (
      <button
        onClick={handleClick}
        disabled={isPending}
        className={`absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-all duration-200 active:scale-90 z-10 ${className}`}
        aria-label={isActive ? "Retirer des favoris" : "Ajouter aux favoris"}
      >
        <Heart
          className={`w-5 h-5 transition-all duration-200 ${
            isActive
              ? "fill-black text-black"
              : "text-black"
          }`}
          strokeWidth={1.5}
        />
      </button>
    );
  }

  // Variant "text" - Pour la page produit
  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`flex items-center gap-2 text-xs uppercase tracking-widest font-medium transition-colors hover:opacity-70 ${
        isActive ? "text-black" : "text-black/60"
      } ${className}`}
      aria-label={isActive ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      <Heart
        className={`w-4 h-4 transition-all duration-200 ${
          isActive
            ? "fill-black text-black"
            : "text-black/60"
        }`}
        strokeWidth={1.5}
      />
      <span>{isActive ? "Retirer des favoris" : "Ajouter aux favoris"}</span>
    </button>
  );
}

