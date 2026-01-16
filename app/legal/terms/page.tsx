import { LEGAL_CONSTANTS } from "../constants";

export const metadata = {
  title: "Conditions Générales de Vente",
  description: "Conditions Générales de Vente de THE PARFUMERIEE",
};

export default function TermsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-wider mb-8">
        Conditions Générales de Vente
      </h1>

      <div className="space-y-6 text-sm md:text-base leading-relaxed text-gray-800">
        <section>
          <h2 className="text-xl font-bold uppercase tracking-wide mb-4 mt-8">
            1. Informations légales
          </h2>
          <p>
            Les présentes Conditions Générales de Vente (CGV) régissent les
            relations entre {LEGAL_CONSTANTS.companyName}, société immatriculée
            au RCS de Paris sous le numéro {LEGAL_CONSTANTS.companyRCS}, et
            toute personne physique ou morale (ci-après "le Client") effectuant
            un achat sur le site internet {LEGAL_CONSTANTS.companyName}.
          </p>
          <p className="mt-4">
            <strong>Coordonnées :</strong>
            <br />
            {LEGAL_CONSTANTS.companyName}
            <br />
            {LEGAL_CONSTANTS.companyAddress}
            <br />
            Email : {LEGAL_CONSTANTS.companyEmail}
            <br />
            Téléphone : {LEGAL_CONSTANTS.companyPhone}
            <br />
            SIRET : {LEGAL_CONSTANTS.companySIRET}
            <br />
            TVA Intracommunautaire : {LEGAL_CONSTANTS.companyVAT}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold uppercase tracking-wide mb-4 mt-8">
            2. Objet
          </h2>
          <p>
            Les présentes CGV ont pour objet de définir les conditions et
            modalités de vente des produits proposés par {LEGAL_CONSTANTS.companyName} sur son site internet, ainsi que les droits et obligations des parties dans ce cadre.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold uppercase tracking-wide mb-4 mt-8">
            3. Produits
          </h2>
          <p>
            Les produits proposés à la vente sont ceux qui figurent sur le site
            internet de {LEGAL_CONSTANTS.companyName} au jour de la consultation
            par le Client. Les produits sont décrits et présentés avec la plus
            grande exactitude possible. Toutefois, {LEGAL_CONSTANTS.companyName} ne saurait être tenu responsable des erreurs ou omissions qui pourraient survenir.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold uppercase tracking-wide mb-4 mt-8">
            4. Prix
          </h2>
          <p>
            Les prix de nos produits sont indiqués en euros toutes taxes
            comprises (TTC). {LEGAL_CONSTANTS.companyName} se réserve le droit de
            modifier ses prix à tout moment, étant toutefois entendu que le
            prix figurant au catalogue le jour de la commande sera le seul
            applicable à l'acheteur.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold uppercase tracking-wide mb-4 mt-8">
            5. Commande
          </h2>
          <p>
            Toute commande vaut acceptation des prix et descriptions des
            produits disponibles à la vente. La vente ne sera considérée comme
            définitive qu'après l'envoi au Client de la confirmation de
            l'acceptation de la commande par {LEGAL_CONSTANTS.companyName} par
            courrier électronique.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold uppercase tracking-wide mb-4 mt-8">
            6. Paiement
          </h2>
          <p>
            Le paiement s'effectue par carte bancaire via le système sécurisé
            Stripe. Le paiement est exigible immédiatement à la commande. Le
            Client garantit à {LEGAL_CONSTANTS.companyName} qu'il dispose des
            autorisations nécessaires pour utiliser le mode de paiement choisi.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold uppercase tracking-wide mb-4 mt-8">
            7. Livraison
          </h2>
          <p>
            Les produits sont livrés à l'adresse indiquée par le Client lors de
            la commande. Les délais de livraison sont indiqués à titre indicatif
            et ne sauraient engager la responsabilité de {LEGAL_CONSTANTS.companyName} en cas de retard.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold uppercase tracking-wide mb-4 mt-8">
            8. Droit de rétractation
          </h2>
          <p>
            Conformément à l'article L.221-18 du Code de la consommation, le
            Client dispose d'un délai de 14 jours à compter de la réception des
            produits pour exercer son droit de rétractation, sans avoir à
            justifier de motifs ni à payer de pénalité.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold uppercase tracking-wide mb-4 mt-8">
            9. Garanties
          </h2>
          <p>
            {LEGAL_CONSTANTS.companyName} garantit la conformité des produits
            aux descriptions qui en sont faites. La garantie légale de
            conformité et la garantie des vices cachés s'appliquent conformément
            aux articles L.217-4 et suivants du Code de la consommation.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold uppercase tracking-wide mb-4 mt-8">
            10. Responsabilité
          </h2>
          <p>
            {LEGAL_CONSTANTS.companyName} ne saurait être tenu responsable des
            dommages résultant de l'utilisation du site internet ou de
            l'impossibilité de l'utiliser.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold uppercase tracking-wide mb-4 mt-8">
            11. Propriété intellectuelle
          </h2>
          <p>
            Tous les éléments du site {LEGAL_CONSTANTS.companyName} sont et
            restent la propriété intellectuelle et exclusive de {LEGAL_CONSTANTS.companyName}. Aucune reproduction n'est autorisée sans accord écrit.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold uppercase tracking-wide mb-4 mt-8">
            12. Droit applicable et juridiction compétente
          </h2>
          <p>
            Les présentes CGV sont soumises au droit français. En cas de litige,
            et après tentative de résolution amiable, les tribunaux français
            seront seuls compétents.
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
