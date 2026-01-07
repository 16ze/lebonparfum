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
      <div className="px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs uppercase tracking-widest text-gray-400">
              Espace Administration
            </h2>
          </div>
          <Link
            href="/"
            className="text-xs uppercase tracking-widest font-medium text-black hover:opacity-50 transition-opacity duration-300 underline underline-offset-4"
          >
            Retour à la boutique
          </Link>
        </div>
      </div>
    </div>
  );
}

