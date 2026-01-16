import { LEGAL_CONSTANTS } from "../constants";

export const metadata = {
  title: "Politique de Confidentialité",
  description: "Politique de Confidentialité et Protection des Données de THE PARFUMERIEE",
};

export default function PrivacyPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-wider mb-8">
        Politique de Confidentialité
      </h1>

      <div className="space-y-6 text-sm md:text-base leading-relaxed text-gray-800">
        <section>
          <h2 className="text-xl font-bold uppercase tracking-wide mb-4 mt-8">
            1. Introduction
          </h2>
          <p>
            {LEGAL_CONSTANTS.companyName} (ci-après "nous", "notre") s'engage à
            protéger et respecter votre vie privée. Cette politique de
            confidentialité explique comment nous collectons, utilisons,
            stockons et protégeons vos données personnelles conformément au
            Règlement Général sur la Protection des Données (RGPD) et à la loi
            Informatique et Libertés.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold uppercase tracking-wide mb-4 mt-8">
            2. Responsable du traitement
          </h2>
          <p>
            Le responsable du traitement des données personnelles est :
            <br />
            <strong>{LEGAL_CONSTANTS.companyName}</strong>
            <br />
            {LEGAL_CONSTANTS.companyAddress}
            <br />
            Email : {LEGAL_CONSTANTS.companyEmail}
            <br />
            Téléphone : {LEGAL_CONSTANTS.companyPhone}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold uppercase tracking-wide mb-4 mt-8">
            3. Données collectées
          </h2>
          <p>Nous collectons les données suivantes :</p>
          <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
            <li>
              <strong>Données d'identification :</strong> nom, prénom, adresse
              email, numéro de téléphone
            </li>
            <li>
              <strong>Données de commande :</strong> adresse de livraison,
              adresse de facturation, historique des commandes
            </li>
            <li>
              <strong>Données de paiement :</strong> traitées exclusivement par
              notre prestataire de paiement sécurisé Stripe (nous ne stockons
              pas vos données bancaires)
            </li>
            <li>
              <strong>Données de navigation :</strong> adresse IP, cookies,
              données de connexion
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold uppercase tracking-wide mb-4 mt-8">
            4. Finalités du traitement
          </h2>
          <p>Vos données sont utilisées pour :</p>
          <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
            <li>Gérer et traiter vos commandes</li>
            <li>Vous contacter concernant votre commande</li>
            <li>Améliorer nos services et votre expérience utilisateur</li>
            <li>Vous envoyer des communications marketing (avec votre consentement)</li>
            <li>Respecter nos obligations légales et réglementaires</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold uppercase tracking-wide mb-4 mt-8">
            5. Base légale du traitement
          </h2>
          <p>
            Le traitement de vos données personnelles est basé sur :
          </p>
          <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
            <li>
              <strong>L'exécution d'un contrat :</strong> pour la gestion de vos
              commandes
            </li>
            <li>
              <strong>Votre consentement :</strong> pour les communications
              marketing
            </li>
            <li>
              <strong>L'intérêt légitime :</strong> pour l'amélioration de nos
              services
            </li>
            <li>
              <strong>Les obligations légales :</strong> pour la conservation
              des factures
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold uppercase tracking-wide mb-4 mt-8">
            6. Conservation des données
          </h2>
          <p>
            Vos données sont conservées pour la durée nécessaire aux finalités
            pour lesquelles elles ont été collectées :
          </p>
          <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
            <li>
              <strong>Données de commande :</strong> 10 ans (obligation légale
              de conservation des factures)
            </li>
            <li>
              <strong>Données de compte :</strong> durée de vie du compte,
              puis 3 ans après la dernière activité
            </li>
            <li>
              <strong>Données marketing :</strong> jusqu'à retrait du
              consentement
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold uppercase tracking-wide mb-4 mt-8">
            7. Partage des données
          </h2>
          <p>
            Vos données peuvent être partagées avec :
          </p>
          <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
            <li>
              <strong>Prestataires de paiement :</strong> Stripe (traitement
              sécurisé des paiements)
            </li>
            <li>
              <strong>Prestataires de livraison :</strong> pour l'expédition de
              vos commandes
            </li>
            <li>
              <strong>Prestataires techniques :</strong> Supabase (hébergement
              base de données), Vercel (hébergement site)
            </li>
          </ul>
          <p className="mt-4">
            Nous ne vendons jamais vos données personnelles à des tiers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold uppercase tracking-wide mb-4 mt-8">
            8. Vos droits
          </h2>
          <p>
            Conformément au RGPD, vous disposez des droits suivants :
          </p>
          <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
            <li>
              <strong>Droit d'accès :</strong> obtenir une copie de vos données
            </li>
            <li>
              <strong>Droit de rectification :</strong> corriger vos données
              inexactes
            </li>
            <li>
              <strong>Droit à l'effacement :</strong> supprimer vos données
              (sous réserve des obligations légales)
            </li>
            <li>
              <strong>Droit à la portabilité :</strong> récupérer vos données
              dans un format structuré
            </li>
            <li>
              <strong>Droit d'opposition :</strong> vous opposer au traitement
              de vos données
            </li>
            <li>
              <strong>Droit à la limitation :</strong> limiter le traitement de
              vos données
            </li>
            <li>
              <strong>Droit de retrait du consentement :</strong> retirer votre
              consentement à tout moment
            </li>
          </ul>
          <p className="mt-4">
            Pour exercer ces droits, contactez-nous à :{" "}
            <a
              href={`mailto:${LEGAL_CONSTANTS.companyEmail}`}
              className="text-black underline hover:text-gray-600"
            >
              {LEGAL_CONSTANTS.companyEmail}
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold uppercase tracking-wide mb-4 mt-8">
            9. Cookies
          </h2>
          <p>
            Notre site utilise des cookies pour améliorer votre expérience de
            navigation. Vous pouvez gérer vos préférences de cookies dans les
            paramètres de votre navigateur.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold uppercase tracking-wide mb-4 mt-8">
            10. Sécurité
          </h2>
          <p>
            Nous mettons en œuvre des mesures techniques et organisationnelles
            appropriées pour protéger vos données personnelles contre tout accès
            non autorisé, perte, destruction ou altération.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold uppercase tracking-wide mb-4 mt-8">
            11. Réclamation
          </h2>
          <p>
            Si vous estimez que le traitement de vos données personnelles
            constitue une violation du RGPD, vous avez le droit d'introduire une
            réclamation auprès de la Commission Nationale de l'Informatique et
            des Libertés (CNIL) :{" "}
            <a
              href="https://www.cnil.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-black underline hover:text-gray-600"
            >
              www.cnil.fr
            </a>
          </p>
        </section>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
          </p>
        </div>
      </div>
    </div>
  );
}
