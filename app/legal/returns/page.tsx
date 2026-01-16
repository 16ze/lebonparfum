import { LEGAL_CONSTANTS } from "../constants";

export const metadata = {
  title: "Politique de Retours & Remboursements",
  description: "Politique de Retours et Remboursements de THE PARFUMERIEE",
};

export default function ReturnsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-wider mb-8">
        Politique de Retours & Remboursements
      </h1>

      <div className="space-y-6 text-sm md:text-base leading-relaxed text-gray-800">
        <section>
          <h2 className="text-xl font-bold uppercase tracking-wide mb-4 mt-8">
            1. Droit de rétractation
          </h2>
          <p>
            Conformément à l'article L.221-18 du Code de la consommation, vous
            disposez d'un délai de <strong>14 jours calendaires</strong> à
            compter de la réception de votre commande pour exercer votre droit
            de rétractation, sans avoir à justifier de motifs ni à payer de
            pénalité.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold uppercase tracking-wide mb-4 mt-8">
            2. Conditions de retour
          </h2>
          <p>Pour être accepté, le retour doit respecter les conditions suivantes :</p>
          <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
            <li>
              Les produits doivent être retournés dans leur emballage d'origine
              et en parfait état
            </li>
            <li>
              Les produits ne doivent pas avoir été utilisés, ouverts ou
              endommagés
            </li>
            <li>
              Tous les accessoires et documents fournis avec le produit doivent
              être inclus
            </li>
            <li>
              Le retour doit être effectué dans le délai de 14 jours
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold uppercase tracking-wide mb-4 mt-8">
            3. Procédure de retour
          </h2>
          <p>Pour retourner un produit :</p>
          <ol className="list-decimal list-inside mt-4 space-y-2 ml-4">
            <li>
              Contactez-nous à{" "}
              <a
                href={`mailto:${LEGAL_CONSTANTS.companyEmail}`}
                className="text-black underline hover:text-gray-600"
              >
                {LEGAL_CONSTANTS.companyEmail}
              </a>{" "}
              en indiquant votre numéro de commande et les produits à retourner
            </li>
            <li>
              Nous vous enverrons un bon de retour avec les instructions
              d'expédition
            </li>
            <li>
              Emballez soigneusement les produits dans leur emballage d'origine
            </li>
            <li>
              Expédiez le colis à l'adresse indiquée sur le bon de retour
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-bold uppercase tracking-wide mb-4 mt-8">
            4. Frais de retour
          </h2>
          <p>
            Les frais de retour sont à votre charge, sauf en cas de produit
            défectueux ou d'erreur de notre part. Dans ce cas, nous prendrons en
            charge les frais de retour.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold uppercase tracking-wide mb-4 mt-8">
            5. Remboursement
          </h2>
          <p>
            Une fois le produit retourné et vérifié, nous procéderons au
            remboursement dans un délai maximum de <strong>14 jours</strong> à
            compter de la réception du retour.
          </p>
          <p className="mt-4">
            Le remboursement sera effectué selon le même mode de paiement que
            celui utilisé lors de la commande initiale. Si le paiement a été
            effectué par carte bancaire, le remboursement sera crédité sur la
            même carte.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold uppercase tracking-wide mb-4 mt-8">
            6. Produits non échangeables
          </h2>
          <p>
            Conformément à l'article L.221-28 du Code de la consommation, le
            droit de rétractation ne peut être exercé pour :
          </p>
          <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
            <li>
              Les produits confectionnés selon les spécifications du client ou
              nettement personnalisés
            </li>
            <li>
              Les produits qui ont été descellés et qui ne peuvent être
              renvoyés pour des raisons d'hygiène ou de protection de la santé
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold uppercase tracking-wide mb-4 mt-8">
            7. Produits défectueux
          </h2>
          <p>
            Si vous recevez un produit défectueux ou non conforme à votre
            commande, contactez-nous immédiatement à{" "}
            <a
              href={`mailto:${LEGAL_CONSTANTS.companyEmail}`}
              className="text-black underline hover:text-gray-600"
            >
              {LEGAL_CONSTANTS.companyEmail}
            </a>
            . Nous vous proposerons un échange ou un remboursement, et nous
            prendrons en charge les frais de retour.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold uppercase tracking-wide mb-4 mt-8">
            8. Garantie légale de conformité
          </h2>
          <p>
            En plus du droit de rétractation, vous bénéficiez de la garantie
            légale de conformité prévue aux articles L.217-4 et suivants du Code
            de la consommation, qui vous permet de demander la réparation ou le
            remplacement du produit défectueux pendant 2 ans à compter de la
            livraison.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold uppercase tracking-wide mb-4 mt-8">
            9. Contact
          </h2>
          <p>
            Pour toute question concernant les retours et remboursements,
            contactez-nous :
          </p>
          <p className="mt-4">
            <strong>Email :</strong>{" "}
            <a
              href={`mailto:${LEGAL_CONSTANTS.companyEmail}`}
              className="text-black underline hover:text-gray-600"
            >
              {LEGAL_CONSTANTS.companyEmail}
            </a>
            <br />
            <strong>Téléphone :</strong> {LEGAL_CONSTANTS.companyPhone}
            <br />
            <strong>Adresse :</strong> {LEGAL_CONSTANTS.companyAddress}
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
