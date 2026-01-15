"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";

/**
 * Page 500 Custom - Style Byredo
 *
 * Design :
 * - Minimalisme brutaliste
 * - Noir et blanc uniquement
 * - Typographie uppercase avec letter-spacing
 * - Angles droits
 */

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log l'erreur pour le monitoring
    console.error("❌ Erreur application:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="text-center max-w-2xl mx-auto">
        {/* Code 500 */}
        <h1 className="text-8xl md:text-9xl font-bold text-black mb-8 tracking-tight">
          500
        </h1>

        {/* Message */}
        <h2 className="text-2xl md:text-3xl uppercase tracking-widest font-bold text-black mb-6">
          Erreur serveur
        </h2>

        <p className="text-sm md:text-base text-gray-600 mb-12 max-w-md mx-auto leading-relaxed">
          Une erreur inattendue s'est produite. Notre équipe a été notifiée et travaille à résoudre le problème.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* Bouton réessayer */}
          <button
            onClick={reset}
            className="inline-flex items-center gap-3 px-8 py-4 bg-black text-white uppercase tracking-widest text-xs font-bold hover:bg-gray-800 transition-colors duration-200 group"
          >
            <RefreshCw className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" strokeWidth={2} />
            <span>Réessayer</span>
          </button>

          {/* Bouton retour */}
          <Link
            href="/"
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black border border-black uppercase tracking-widest text-xs font-bold hover:bg-black hover:text-white transition-colors duration-200 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" strokeWidth={2} />
            <span>Retour à l'accueil</span>
          </Link>
        </div>

        {/* Debug info (uniquement en dev) */}
        {process.env.NODE_ENV === "development" && error.message && (
          <div className="mt-12 p-6 bg-black/5 border border-black/10 text-left">
            <p className="text-xs uppercase tracking-widest font-bold text-black mb-2">
              Détails de l'erreur (dev uniquement)
            </p>
            <p className="text-xs text-gray-600 font-mono break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-gray-500 font-mono mt-2">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
