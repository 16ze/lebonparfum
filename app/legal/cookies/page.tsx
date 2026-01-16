import { LEGAL_CONSTANTS } from "../constants";

export const metadata = {
  title: "Politique des Cookies",
  description: "Politique d'utilisation des cookies de THE PARFUMERIEE",
};

export default function CookiesPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-wider mb-8">
        Politique des Cookies
      </h1>

      <div className="space-y-6 text-sm md:text-base leading-relaxed text-gray-800">
        <section>
          <h2 className="text-xl font-bold uppercase tracking-wide mb-4 mt-8">
            1. Qu'est-ce qu'un cookie ?
          </h2>
          <p>
            Un cookie est un petit fichier texte déposé sur votre terminal
            (ordinateur, tablette, smartphone) lors de la visite d'un site
            internet. Il permet au site de reconnaître votre navigateur et de
            mémoriser certaines informations vous concernant.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold uppercase tracking-wide mb-4 mt-8">
            2. Cookies utilisés sur notre site
          </h2>
          <p>
            {LEGAL_CONSTANTS.companyName} utilise différents types de cookies
            pour améliorer votre expérience de navigation et assurer le bon
            fonctionnement du site.
          </p>

          <h3 className="text-lg font-bold uppercase tracking-wide mb-3 mt-6">
            2.1. Cookies strictement nécessaires
          </h3>
          <p>
            Ces cookies sont indispensables au fonctionnement du site. Ils
            permettent notamment :
          </p>
          <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
            <li>
              <strong>Cookies de session :</strong> Maintien de votre session
              utilisateur et de votre panier d'achat
            </li>
            <li>
              <strong>Cookies d'authentification :</strong> Identification et
              authentification sécurisée via Supabase
            </li>
            <li>
              <strong>Cookies de sécurité :</strong> Protection contre les
              attaques et fraudes
            </li>
          </ul>
          <p className="mt-4">
            Ces cookies ne peuvent pas être désactivés car ils sont essentiels
            au fonctionnement du site.
          </p>

          <h3 className="text-lg font-bold uppercase tracking-wide mb-3 mt-6">
            2.2. Cookies de paiement
          </h3>
          <p>
            Nous utilisons des cookies liés à notre prestataire de paiement
            Stripe pour :
          </p>
          <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
            <li>Sécuriser les transactions de paiement</li>
            <li>Mémoriser vos préférences de paiement (carte sauvegardée)</li>
            <li>Détecter et prévenir les fraudes</li>
          </ul>
          <p className="mt-4">
            Ces cookies sont gérés par Stripe et sont nécessaires pour le
            traitement sécurisé de vos paiements.
          </p>

          <h3 className="text-lg font-bold uppercase tracking-wide mb-3 mt-6">
            2.3. Cookies de performance et d'analyse
          </h3>
          <p>
            Ces cookies nous permettent d'analyser l'utilisation du site pour
            améliorer nos services :
          </p>
          <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
            <li>
              <strong>Sentry :</strong> Détection et suivi des erreurs
              techniques pour améliorer la stabilité du site
            </li>
            <li>
              <strong>Vercel Analytics :</strong> (si activé) Analyse du trafic
              et des performances
            </li>
          </ul>
          <p className="mt-4">
            Ces cookies nous aident à comprendre comment les visiteurs
            utilisent notre site et à identifier les problèmes techniques.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold uppercase tracking-wide mb-4 mt-8">
            3. Durée de conservation
          </h2>
          <p>Les cookies sont conservés pour différentes durées :</p>
          <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
            <li>
              <strong>Cookies de session :</strong> Supprimés à la fermeture du
              navigateur
            </li>
            <li>
              <strong>Cookies d'authentification :</strong> Jusqu'à la
              déconnexion ou expiration (généralement 7 jours)
            </li>
            <li>
              <strong>Cookies de panier :</strong> 30 jours maximum
            </li>
            <li>
              <strong>Cookies analytiques :</strong> 13 mois maximum
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold uppercase tracking-wide mb-4 mt-8">
            4. Gestion de vos préférences
          </h2>
          <p>
            Vous pouvez gérer vos préférences de cookies de plusieurs façons :
          </p>

          <h3 className="text-lg font-bold uppercase tracking-wide mb-3 mt-6">
            4.1. Via votre navigateur
          </h3>
          <p>
            La plupart des navigateurs vous permettent de :
          </p>
          <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
            <li>Voir quels cookies sont stockés</li>
            <li>Supprimer tout ou partie des cookies</li>
            <li>Bloquer les cookies de certains sites</li>
            <li>Bloquer les cookies tiers</li>
            <li>Supprimer tous les cookies à la fermeture du navigateur</li>
          </ul>
          <p className="mt-4">
            <strong>Attention :</strong> La désactivation de certains cookies
            peut affecter le fonctionnement du site, notamment pour les
            fonctionnalités de panier et de paiement.
          </p>

          <h3 className="text-lg font-bold uppercase tracking-wide mb-3 mt-6">
            4.2. Instructions par navigateur
          </h3>
          <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
            <li>
              <strong>Chrome :</strong> Paramètres → Confidentialité et sécurité
              → Cookies et autres données de sites
            </li>
            <li>
              <strong>Firefox :</strong> Options → Vie privée et sécurité →
              Cookies et données de sites
            </li>
            <li>
              <strong>Safari :</strong> Préférences → Confidentialité → Cookies
              et données de sites web
            </li>
            <li>
              <strong>Edge :</strong> Paramètres → Cookies et autorisations de
              site → Cookies et données de sites
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold uppercase tracking-wide mb-4 mt-8">
            5. Cookies tiers
          </h2>
          <p>
            Certains cookies sont déposés par des services tiers que nous
            utilisons :
          </p>
          <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
            <li>
              <strong>Stripe :</strong> Pour le traitement sécurisé des
              paiements.{" "}
              <a
                href="https://stripe.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black underline hover:text-gray-600"
              >
                Politique de confidentialité Stripe
              </a>
            </li>
            <li>
              <strong>Supabase :</strong> Pour l'authentification et la base de
              données.{" "}
              <a
                href="https://supabase.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black underline hover:text-gray-600"
              >
                Politique de confidentialité Supabase
              </a>
            </li>
            <li>
              <strong>Sentry :</strong> Pour le suivi des erreurs.{" "}
              <a
                href="https://sentry.io/privacy/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black underline hover:text-gray-600"
              >
                Politique de confidentialité Sentry
              </a>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold uppercase tracking-wide mb-4 mt-8">
            6. Consentement
          </h2>
          <p>
            En continuant à naviguer sur notre site, vous acceptez l'utilisation
            des cookies strictement nécessaires au fonctionnement du site.
          </p>
          <p className="mt-4">
            Pour les cookies non essentiels (analytiques), vous pouvez retirer
            votre consentement à tout moment via les paramètres de votre
            navigateur.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold uppercase tracking-wide mb-4 mt-8">
            7. Contact
          </h2>
          <p>
            Pour toute question concernant notre utilisation des cookies,
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
