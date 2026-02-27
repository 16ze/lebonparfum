"use client";

import { useEffect, useState } from "react";

/**
 * CookieConsent - Modal centrée pour le consentement aux cookies
 *
 * Design Byredo :
 * - Modal centrée avec backdrop flouté
 * - Style minimaliste noir & blanc
 * - Typographie soignée
 * - Apparaît uniquement si le consentement n'a pas été donné
 */

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Vérifier si le consentement existe déjà dans localStorage
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      // Petit délai pour éviter le flash au chargement
      const timer = setTimeout(() => {
        setIsMounted(true);
        // Délai supplémentaire pour l'animation
        setTimeout(() => {
          setIsVisible(true);
        }, 50);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setIsVisible(false);
    // Retirer du DOM après l'animation
    setTimeout(() => {
      setIsMounted(false);
    }, 300);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie_consent", "declined");
    setIsVisible(false);
    // Retirer du DOM après l'animation
    setTimeout(() => {
      setIsMounted(false);
    }, 300);
  };

  if (!isMounted) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/30 backdrop-blur-md flex items-center justify-center p-4 transition-opacity duration-500"
      style={{ opacity: isVisible ? 1 : 0 }}
    >
      <div
        className="bg-white w-full max-w-md p-10 shadow-2xl relative transition-all duration-300"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "scale(1)" : "scale(0.95)",
        }}
      >
        {/* Titre */}
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6 text-center">
          VOTRE CONFIDENTIALITÉ
        </h2>

        {/* Texte */}
        <p className="text-sm font-light text-center mb-8 leading-relaxed text-black">
          Nous utilisons des cookies pour améliorer votre expérience. Vous
          pouvez choisir d'accepter ou de refuser les cookies non essentiels.{" "}
          <a
            href="/legal/cookies"
            className="underline hover:no-underline transition-all"
            target="_blank"
            rel="noopener noreferrer"
          >
            En savoir plus
          </a>
          .
        </p>

        {/* Boutons */}
        <div className="space-y-4">
          {/* Bouton Principal - Accepter */}
          <button
            onClick={handleAccept}
            className="w-full bg-black text-white py-4 uppercase text-xs font-bold tracking-widest hover:bg-gray-900 transition-colors"
            type="button"
            aria-label="Accepter les cookies"
          >
            Accepter
          </button>

          {/* Bouton Secondaire - Continuer sans accepter */}
          <button
            onClick={handleDecline}
            className="block w-full text-center text-[10px] uppercase tracking-widest text-gray-500 hover:text-black border-b border-transparent hover:border-black transition-all cursor-pointer py-2"
            type="button"
            aria-label="Continuer sans accepter les cookies"
          >
            Continuer sans accepter
          </button>
        </div>
      </div>
    </div>
  );
}
