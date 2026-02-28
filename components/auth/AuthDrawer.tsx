"use client";

import { useEffect, useRef, useState } from "react";
import { X, Mail, Lock, User, Loader2 } from "lucide-react";
import gsap from "gsap";
import { useAuth } from "@/context/AuthContext";
import { loginAction, signupAction, loginWithGoogleAction } from "@/app/login/actions";

/**
 * AuthDrawer - Overlay d'authentification (style carte flottante Byredo)
 *
 * Design Byredo :
 * - Carte flottante arrondie (rounded-3xl)
 * - Position : fixed right-4, avec marges
 * - Fond blanc, shadow-2xl
 * - Animation slide-in depuis la droite (GSAP)
 * - Backdrop blur
 * - Formulaires login/signup intégrés (pas de redirection)
 */
export default function AuthDrawer() {
  const { isAuthDrawerOpen, closeAuthDrawer, refreshUser } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const drawerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  /**
   * Animation GSAP : Slide-in depuis la droite
   */
  useEffect(() => {
    if (!drawerRef.current || !overlayRef.current) return;

    const ctx = gsap.context(() => {
      if (isAuthDrawerOpen) {
        // Entrée : Slide depuis la droite
        gsap.fromTo(
          drawerRef.current,
          { x: "105%", visibility: "visible" },
          { x: 0, duration: 0.4, ease: "power2.out" }
        );
        gsap.to(overlayRef.current, {
          opacity: 1,
          duration: 0.3,
          ease: "power2.out",
        });
      } else {
        // Sortie : Slide vers la droite
        gsap.to(drawerRef.current, {
          x: "105%",
          duration: 0.3,
          ease: "power2.in",
          onComplete: () => {
            if (drawerRef.current) {
              drawerRef.current.style.visibility = "hidden";
            }
          },
        });
        gsap.to(overlayRef.current, {
          opacity: 0,
          duration: 0.2,
          ease: "power2.in",
        });
      }
    });

    return () => ctx.revert();
  }, [isAuthDrawerOpen]);

  /**
   * Réinitialiser le formulaire lors de la fermeture ou de l'ouverture
   * CRITIQUE : Réinitialiser isLoading pour éviter que le bouton reste en chargement
   */
  useEffect(() => {
    if (!isAuthDrawerOpen) {
      // Réinitialiser quand le drawer se ferme
      setEmail("");
      setPassword("");
      setFullName("");
      setError(null);
      setIsSignup(false);
      setIsLoading(false); // CRITIQUE : Réinitialiser l'état de chargement
    } else {
      // Réinitialiser aussi quand le drawer s'ouvre (au cas où)
      setIsLoading(false);
      setError(null);
    }
  }, [isAuthDrawerOpen]);

  /**
   * Gestion de la soumission du formulaire
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isSignup) {
        // Inscription
        if (!fullName.trim()) {
          setError("Le nom complet est requis");
          setIsLoading(false);
          return;
        }

        const result = await signupAction(email, password, fullName);
        if (!result.success) {
          setError(result.error || "Erreur lors de l'inscription");
          setIsLoading(false);
          return;
        }

        // Tenter de se connecter automatiquement après l'inscription
        const loginResult = await loginAction(email, password);
        if (loginResult.success) {
          await refreshUser();
          setIsLoading(false); // CRITIQUE : Réinitialiser avant de fermer
          closeAuthDrawer();
        } else {
          setError("Compte créé. Connectez-vous maintenant.");
          setIsSignup(false);
          setIsLoading(false); // Réinitialiser même en cas d'échec
        }
      } else {
        // Connexion
        const result = await loginAction(email, password);
        if (!result.success) {
          setError(result.error || "Email ou mot de passe incorrect");
          setIsLoading(false);
          return;
        }

        await refreshUser();
        setIsLoading(false); // CRITIQUE : Réinitialiser avant de fermer
        closeAuthDrawer();
      }
    } catch (err) {
      console.error("❌ Erreur auth:", err);
      setError("Une erreur inattendue s'est produite");
      setIsLoading(false);
    }
  };

  /**
   * Toggle entre Login et Signup
   */
  const toggleMode = () => {
    setIsSignup(!isSignup);
    setError(null);
  };

  /**
   * Connexion avec Google
   */
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await loginWithGoogleAction();
      if (!result.success || !result.url) {
        setError(result.error || "Erreur lors de la connexion avec Google");
        setIsLoading(false);
        return;
      }

      // Rediriger vers Google OAuth
      window.location.href = result.url;
    } catch (err) {
      console.error("❌ Erreur Google OAuth:", err);
      setError("Une erreur inattendue s'est produite");
      setIsLoading(false);
    }
  };

  if (!isAuthDrawerOpen) return null;

  return (
    <>
      {/* Backdrop flou */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998] opacity-0"
        onClick={closeAuthDrawer}
        style={{ visibility: isAuthDrawerOpen ? "visible" : "hidden" }}
      />

      {/* Drawer (Carte flottante) */}
      {/* height: 100dvh = hauteur du viewport VISIBLE sur mobile (exclut la chrome du navigateur) */}
      <div
        ref={drawerRef}
        className="fixed top-4 right-4 w-[90vw] md:w-[480px] bg-white rounded-3xl shadow-2xl z-[9999] flex flex-col overflow-hidden invisible"
        style={{ height: "calc(100dvh - 2rem)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-sm uppercase tracking-[0.3em] font-bold">
            {isSignup ? "Créer un compte" : "Connexion"}
          </h2>
          <button
            onClick={closeAuthDrawer}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Message d'explication */}
          <div className="mb-8 p-4 bg-black/5 rounded-lg">
            <p className="text-xs uppercase tracking-wider text-gray-600">
              Vous devez être connecté pour passer commande et suivre vos achats.
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nom complet (signup uniquement) */}
            {isSignup && (
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-xs uppercase tracking-widest text-gray-500 mb-2"
                >
                  Nom complet *
                </label>
                <div className="relative">
                  <User className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full border-0 border-b border-black/20 pb-2 pl-6 text-sm focus:outline-none focus:border-black transition-colors bg-transparent"
                    placeholder="Jean Dupont"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs uppercase tracking-widest text-gray-500 mb-2"
              >
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border-0 border-b border-black/20 pb-2 pl-6 text-sm focus:outline-none focus:border-black transition-colors bg-transparent"
                  placeholder="exemple@email.com"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs uppercase tracking-widest text-gray-500 mb-2"
              >
                Mot de passe *
              </label>
              <div className="relative">
                <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full border-0 border-b border-black/20 pb-2 pl-6 text-sm focus:outline-none focus:border-black transition-colors bg-transparent"
                  placeholder="••••••••"
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Minimum 6 caractères
              </p>
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-sm p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Bouton de soumission */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 uppercase tracking-widest text-xs font-bold transition-colors ${
                isLoading
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Traitement...
                </span>
              ) : isSignup ? (
                "Créer mon compte"
              ) : (
                "Se connecter"
              )}
            </button>
          </form>

          {/* Séparateur "OU" */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-gray-400 tracking-widest">
                Ou
              </span>
            </div>
          </div>

          {/* Bouton Google OAuth */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className={`w-full py-4 border border-black/20 flex items-center justify-center gap-3 uppercase tracking-widest text-xs font-bold transition-colors ${
              isLoading
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-black/5"
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continuer avec Google
          </button>

          {/* Toggle Login/Signup */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 mb-2">
              {isSignup ? "Vous avez déjà un compte ?" : "Pas encore de compte ?"}
            </p>
            <button
              type="button"
              onClick={toggleMode}
              className="text-xs uppercase tracking-widest font-bold underline hover:no-underline transition-all"
            >
              {isSignup ? "Se connecter" : "Créer un compte"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center uppercase tracking-wider">
            Paiement sécurisé • Livraison suivie
          </p>
        </div>
      </div>
    </>
  );
}

