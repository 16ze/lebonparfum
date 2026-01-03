import { MapPin } from "lucide-react";

/**
 * Page Addresses - Gestion des adresses de livraison
 *
 * TODO: Implémenter la gestion complète des adresses
 * - CRUD adresses
 * - Définir adresse par défaut
 * - Validation formulaire
 */
export default function AddressesPage() {
  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-2xl md:text-3xl uppercase tracking-widest font-bold mb-2">
          Mes Adresses
        </h1>
        <p className="text-sm text-gray-500">
          Gérez vos adresses de livraison pour vos commandes
        </p>
      </div>

      {/* Placeholder */}
      <div className="border border-black/10 p-12 text-center">
        <MapPin size={48} strokeWidth={1} className="mx-auto mb-4 text-gray-300" />
        <h3 className="text-sm uppercase tracking-widest text-gray-500 mb-2">
          Bientôt disponible
        </h3>
        <p className="text-sm text-gray-400">
          La gestion des adresses sera disponible prochainement
        </p>
      </div>
    </div>
  );
}

