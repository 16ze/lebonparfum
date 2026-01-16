"use client";

/**
 * SkipLinks - Liens de navigation rapide pour l'accessibilité
 * 
 * Permet aux utilisateurs de clavier d'aller directement au contenu principal
 * sans avoir à naviguer à travers tous les éléments de navigation
 */
export default function SkipLinks() {
  return (
    <div className="sr-only focus-within:not-sr-only focus-within:absolute focus-within:z-[100] focus-within:top-4 focus-within:left-4">
      <a
        href="#main-content"
        className="block bg-black text-white px-6 py-3 uppercase tracking-widest text-xs font-bold focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
      >
        Aller au contenu principal
      </a>
    </div>
  );
}
