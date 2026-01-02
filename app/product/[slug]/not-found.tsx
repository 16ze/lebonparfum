import Link from "next/link";

/**
 * Page Not Found - Produit non trouvé
 */
export default function ProductNotFound() {
  return (
    <main className="min-h-screen bg-white pt-[120px] pb-20 px-6 md:px-12 flex items-center justify-center">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold uppercase tracking-widest mb-4">
          Produit non trouvé
        </h1>
        <p className="text-sm text-gray-600 mb-8">
          Le produit que vous recherchez n'existe pas ou a été supprimé.
        </p>
        <Link
          href="/"
          className="inline-block text-black text-xs uppercase tracking-widest font-medium border-b border-black pb-1 hover:opacity-70 transition-opacity"
        >
          Retour à l'accueil
        </Link>
      </div>
    </main>
  );
}


