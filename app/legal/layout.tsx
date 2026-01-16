import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * Layout spécifique pour les pages légales
 * Design : Centré, texte lisible, largeur limitée, fond blanc
 */
export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Bouton Retour */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-black hover:text-gray-600 transition-colors mb-8 uppercase tracking-wide"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la boutique
        </Link>

        {/* Contenu */}
        <div className="max-w-none">
          {children}
        </div>
      </div>
    </div>
  );
}
