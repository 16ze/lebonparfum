"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

/**
 * AdminHeader - Header interne du layout admin
 * 
 * Masqué si ?embed=true (pour le ProfileDrawer expanded)
 */
export default function AdminHeader() {
  const searchParams = useSearchParams();
  const isEmbedMode = searchParams.get("embed") === "true";

  // Ne pas afficher le header en mode embed
  if (isEmbedMode) {
    return null;
  }

  return (
    <div className="border-b border-black/10 bg-white">
      <div className="px-4 md:px-8 py-4 md:py-6">
        <div className="flex flex-row items-center justify-end md:justify-between gap-3 md:gap-0">
          <div className="hidden md:block">
            <h2 className="text-xs uppercase tracking-widest text-gray-400">
              Espace Administration
            </h2>
          </div>
          <div className="flex flex-row items-center gap-3 md:gap-0">
            {/* Sur mobile : Afficher "Espace Administration" avant le bouton */}
            <h2 className="text-xs uppercase tracking-widest text-gray-400 md:hidden">
              Espace Administration
            </h2>
            <Link
              href="/"
              className="text-xs uppercase tracking-widest font-medium text-black hover:opacity-50 transition-opacity duration-300 underline underline-offset-4 whitespace-nowrap"
            >
              Retour à la boutique
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

