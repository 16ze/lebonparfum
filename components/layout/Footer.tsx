import Link from "next/link";

/**
 * Footer - Footer Global du Site (Style Byredo Dark)
 *
 * Design :
 * - Fond noir (#000000)
 * - Typographie blanche minimaliste
 * - Newsletter simple en haut
 * - Grille de liens (Client, Légal, Social)
 * - Signature gigantesque "LE BON PARFUM" (text-[10vw])
 */

export default function Footer() {
  return (
    <footer className="relative z-20 w-full bg-black text-white pt-16 md:pt-24 pb-8">
      <div className="text-center text-white text-xs uppercase tracking-widest ">
        Inscrivez-vous pour suivre l'actualité{" "}
      </div>
      <div className="text-center text-white text-sm md:text-lg lg:text-2xl uppercase tracking-widest mb-8 py-4 px-4 md:px-6 mx-auto max-w-2xl font-bold">
        Recevez des informations exclusives sur le lancement de la collection,
        des communications personnalisées et les dernières actualités{" "}
      </div>

      {/* Bouton souligné */}
      <div className="text-center mb-16">
        <button
          type="button"
          className="text-white text-xs uppercase tracking-widest font-medium hover:underline transition-colors underline-offset-4 mb-16"
        >
          + S'inscrire
        </button>
      </div>
      {/* Separator */}
      <div className="border-t border-gray-500/10 pt-8 md:pt-12"></div>
      <div className="max-w-[1800px] mx-auto px-4 md:px-6">
        {/* Newsletter Simple */}
        <div className="mb-16 md:mb-24 max-w-2xl">
          <h3 className="text-xs uppercase tracking-widest font-bold mb-4">
            Newsletter
          </h3>
          <p className="text-xs text-gray-400 mb-6 leading-relaxed">
            Recevez nos dernières nouveautés et offres exclusives.
          </p>
          <form className="flex gap-3">
            <input
              type="email"
              placeholder="Votre email"
              className="flex-1 bg-transparent border border-white/20 px-4 py-3 text-xs uppercase tracking-wide focus:outline-none focus:border-white transition-colors"
            />
            <button
              type="submit"
              className="bg-white text-black px-6 py-3 text-xs uppercase tracking-widest font-bold hover:bg-gray-200 transition-colors whitespace-nowrap"
            >
              S'inscrire
            </button>
          </form>
        </div>

        {/* Grille de liens */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16 md:mb-24">
          {/* COL 1 : Client */}
          <div>
            <h3 className="text-xs uppercase tracking-widest font-bold mb-6">
              Client
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/compte"
                  className="text-xs text-gray-400 hover:text-white transition-colors uppercase tracking-wide"
                >
                  Mon Compte
                </Link>
              </li>
              <li>
                <Link
                  href="/commandes"
                  className="text-xs text-gray-400 hover:text-white transition-colors uppercase tracking-wide"
                >
                  Mes Commandes
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-xs text-gray-400 hover:text-white transition-colors uppercase tracking-wide"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* COL 2 : Légal */}
          <div>
            <h3 className="text-xs uppercase tracking-widest font-bold mb-6">
              Légal
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/mentions-legales"
                  className="text-xs text-gray-400 hover:text-white transition-colors uppercase tracking-wide"
                >
                  Mentions Légales
                </Link>
              </li>
              <li>
                <Link
                  href="/confidentialite"
                  className="text-xs text-gray-400 hover:text-white transition-colors uppercase tracking-wide"
                >
                  Confidentialité
                </Link>
              </li>
              <li>
                <Link
                  href="/cgv"
                  className="text-xs text-gray-400 hover:text-white transition-colors uppercase tracking-wide"
                >
                  CGV
                </Link>
              </li>
            </ul>
          </div>

          {/* COL 3 : Social */}
          <div>
            <h3 className="text-xs uppercase tracking-widest font-bold mb-6">
              Suivez-Nous
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-400 hover:text-white transition-colors uppercase tracking-wide"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-400 hover:text-white transition-colors uppercase tracking-wide"
                >
                  Facebook
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-gray-500/10 pt-8 md:pt-12">
          {/* Signature Gigantesque */}
          <div className="text-center mb-8">
            <h2 className="text-[10vw] font-bold uppercase tracking-wider leading-none">
              LE BON PARFUM
            </h2>
          </div>

          {/* Copyright */}
          <div className="text-center">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">
              © 2026 LE BON PARFUM. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
