import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * Page 404 Custom - Style Byredo
 *
 * Design :
 * - Minimalisme brutaliste
 * - Noir et blanc uniquement
 * - Typographie uppercase avec letter-spacing
 * - Angles droits
 */

export default function NotFound() {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="text-center max-w-2xl mx-auto">
        {/* Code 404 */}
        <h1 className="text-8xl md:text-9xl font-bold text-black mb-8 tracking-tight">
          404
        </h1>

        {/* Message */}
        <h2 className="text-2xl md:text-3xl uppercase tracking-widest font-bold text-black mb-6">
          Page introuvable
        </h2>

        <p className="text-sm md:text-base text-gray-600 mb-12 max-w-md mx-auto leading-relaxed">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>

        {/* Bouton retour */}
        <Link
          href="/"
          className="inline-flex items-center gap-3 px-8 py-4 bg-black text-white uppercase tracking-widest text-xs font-bold hover:bg-gray-800 transition-colors duration-200 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" strokeWidth={2} />
          <span>Retour à l'accueil</span>
        </Link>
      </div>
    </main>
  );
}
