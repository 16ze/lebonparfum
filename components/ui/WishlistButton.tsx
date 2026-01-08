"use client";

import { useState, useOptimistic } from "react";
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
  
  // useOptimistic pour feedback immédiat
  const [optimisticState, setOptimisticState] = useOptimistic(
    initialIsActive,
    (currentState: boolean) => !currentState
  );

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Si non connecté, ouvrir AuthDrawer
    if (!user) {
      openAuthDrawer();
      return;
    }

    // Optimistic update
    setOptimisticState(!optimisticState);
    setIsPending(true);

    try {
      const result = await toggleWishlistAction(productId);
      
      if (!result.success) {
        // En cas d'erreur, revenir à l'état précédent
        setOptimisticState(optimisticState);
        console.error("❌ Erreur toggle wishlist:", result.error);
      } else {
        // Revalider les pages pour mettre à jour l'UI
        router.refresh();
      }
    } catch (error) {
      // En cas d'erreur, revenir à l'état précédent
      setOptimisticState(optimisticState);
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
        aria-label={optimisticState ? "Retirer des favoris" : "Ajouter aux favoris"}
      >
        <Heart
          className={`w-5 h-5 transition-all duration-200 ${
            optimisticState
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
        optimisticState ? "text-black" : "text-black/60"
      } ${className}`}
      aria-label={optimisticState ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      <Heart
        className={`w-4 h-4 transition-all duration-200 ${
          optimisticState
            ? "fill-black text-black"
            : "text-black/60"
        }`}
        strokeWidth={1.5}
      />
      <span>{optimisticState ? "Retirer des favoris" : "Ajouter aux favoris"}</span>
    </button>
  );
}

