import SecurityForm from "@/components/account/SecurityForm";

/**
 * Page Security - Changement de mot de passe
 *
 * Features :
 * - Formulaire de changement de mot de passe
 * - Validation côté client et serveur
 * - Affichage des critères de sécurité
 */
export default function SecurityPage() {
  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-2xl md:text-3xl uppercase tracking-widest font-bold mb-2">
          Sécurité
        </h1>
        <p className="text-sm text-gray-500">
          Modifiez votre mot de passe pour sécuriser votre compte
        </p>
      </div>

      {/* Formulaire de sécurité */}
      <SecurityForm />
    </div>
  );
}

