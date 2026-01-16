import { LEGAL_CONSTANTS } from "../constants";

export const metadata = {
  title: "Mentions Légales",
  description: "Mentions Légales de THE PARFUMERIEE",
};

export default function MentionsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-wider mb-8">
        Mentions Légales
      </h1>

      <div className="space-y-6 text-sm md:text-base leading-relaxed text-gray-800">
        <section>
          <h2 className="text-xl font-bold uppercase tracking-wide mb-4 mt-8">
            1. Éditeur du site
          </h2>
          <p>
            Le site {LEGAL_CONSTANTS.companyName} est édité par :
          </p>
          <p className="mt-4">
            <strong>{LEGAL_CONSTANTS.companyName}</strong>
            <br />
            {LEGAL_CONSTANTS.companyAddress}
            <br />
            SIRET : {LEGAL_CONSTANTS.companySIRET}
            <br />
            RCS : {LEGAL_CONSTANTS.companyRCS}
            <br />
            TVA Intracommunautaire : {LEGAL_CONSTANTS.companyVAT}
            <br />
            Email :{" "}
            <a
              href={`mailto:${LEGAL_CONSTANTS.companyEmail}`}
              className="text-black underline hover:text-gray-600"
            >
              {LEGAL_CONSTANTS.companyEmail}
            </a>
            <br />
            Téléphone : {LEGAL_CONSTANTS.companyPhone}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold uppercase tracking-wide mb-4 mt-8">
            2. Directeur de publication
          </h2>
          <p>
            Le directeur de la publication est le représentant légal de{" "}
            {LEGAL_CONSTANTS.companyName}.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold uppercase tracking-wide mb-4 mt-8">
            3. Hébergement
          </h2>
          <p>
            Le site est hébergé par :
          </p>
          <p className="mt-4">
            <strong>Vercel Inc.</strong>
            <br />
            340 S Lemon Ave #4133
            <br />
            Walnut, CA 91789
            <br />
            États-Unis
            <br />
            Site web :{" "}
            <a
              href="https://vercel.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-black underline hover:text-gray-600"
            >
              vercel.com
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold uppercase tracking-wide mb-4 mt-8">
            4. Propriété intellectuelle
          </h2>
          <p>
            L'ensemble de ce site relève de la législation française et
            internationale sur le droit d'auteur et la propriété
            intellectuelle. Tous les droits de reproduction sont réservés,
            y compris pour les documents téléchargeables et les représentations
            iconographiques et photographiques.
          </p>
          <p className="mt-4">
            La reproduction de tout ou partie de ce site sur un support
            électronique ou autre est formellement interdite sauf autorisation
            expresse du directeur de la publication.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold uppercase tracking-wide mb-4 mt-8">
            5. Protection des données personnelles
          </h2>
          <p>
            Conformément à la loi "Informatique et Libertés" du 6 janvier 1978
            modifiée et au Règlement Général sur la Protection des Données
            (RGPD), vous disposez d'un droit d'accès, de rectification, de
            suppression et d'opposition aux données personnelles vous
            concernant.
          </p>
          <p className="mt-4">
            Pour exercer ce droit, contactez-nous à :{" "}
            <a
              href={`mailto:${LEGAL_CONSTANTS.companyEmail}`}
              className="text-black underline hover:text-gray-600"
            >
              {LEGAL_CONSTANTS.companyEmail}
            </a>
          </p>
          <p className="mt-4">
            Pour plus d'informations, consultez notre{" "}
            <a
              href="/legal/privacy"
              className="text-black underline hover:text-gray-600"
            >
              Politique de Confidentialité
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold uppercase tracking-wide mb-4 mt-8">
            6. Cookies
          </h2>
          <p>
            Le site utilise des cookies pour améliorer l'expérience utilisateur
            et analyser le trafic. En continuant à naviguer sur ce site, vous
            acceptez l'utilisation de cookies.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold uppercase tracking-wide mb-4 mt-8">
            7. Liens hypertextes
          </h2>
          <p>
            Le site peut contenir des liens hypertextes vers d'autres sites
            présents sur le réseau Internet. Les liens vers ces autres sites ne
            sauraient engager la responsabilité de {LEGAL_CONSTANTS.companyName}
            quant au contenu de ces sites externes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold uppercase tracking-wide mb-4 mt-8">
            8. Limitation de responsabilité
          </h2>
          <p>
            {LEGAL_CONSTANTS.companyName} s'efforce d'assurer au mieux de ses
            possibilités l'exactitude et la mise à jour des informations
            diffusées sur le site, dont elle se réserve le droit de corriger,
            à tout moment et sans préavis, le contenu.
          </p>
          <p className="mt-4">
            Toutefois, {LEGAL_CONSTANTS.companyName} ne peut garantir
            l'exactitude, la précision ou l'exhaustivité des informations mises
            à disposition sur ce site.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold uppercase tracking-wide mb-4 mt-8">
            9. Droit applicable
          </h2>
          <p>
            Les présentes mentions légales sont régies par le droit français.
            En cas de litige et après échec de toute tentative de recherche
            d'une solution amiable, les tribunaux français seront seuls
            compétents pour connaître de ce litige.
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
