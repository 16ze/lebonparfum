"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

/**
 * LoginForm - Formulaire d'authentification style Byredo
 *
 * Design :
 * - Inputs flat avec border-b uniquement
 * - Labels uppercase tracking-widest
 * - Toggle login/signup
 * - Loading state
 */

interface LoginFormProps {
  onSubmit: (data: {
    email: string;
    password: string;
    fullName?: string;
    isSignup: boolean;
  }) => Promise<void>;
  onGoogleLogin?: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export default function LoginForm({
  onSubmit,
  onGoogleLogin,
  isLoading,
  error,
}: LoginFormProps) {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      ...formData,
      isSignup,
    });
  };

  return (
    <div className="w-full max-w-md">
      {/* Toggle Login/Signup */}
      <div className="flex items-center justify-center gap-8 mb-12">
        <button
          type="button"
          onClick={() => setIsSignup(false)}
          className={`text-sm uppercase tracking-widest pb-2 transition-colors ${
            !isSignup
              ? "text-black border-b-2 border-black font-bold"
              : "text-gray-400 border-b border-transparent hover:text-gray-600"
          }`}
        >
          Connexion
        </button>
        <button
          type="button"
          onClick={() => setIsSignup(true)}
          className={`text-sm uppercase tracking-widest pb-2 transition-colors ${
            isSignup
              ? "text-black border-b-2 border-black font-bold"
              : "text-gray-400 border-b border-transparent hover:text-gray-600"
          }`}
        >
          Créer un compte
        </button>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Nom complet (signup seulement) */}
        {isSignup && (
          <div>
            <label
              htmlFor="fullName"
              className="block text-xs uppercase tracking-widest text-gray-500 mb-2"
            >
              Nom complet
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required={isSignup}
              disabled={isLoading}
              className="w-full border-0 border-b border-black/20 pb-2 text-sm focus:outline-none focus:border-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Jean Dupont"
            />
          </div>
        )}

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-xs uppercase tracking-widest text-gray-500 mb-2"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isLoading}
            className="w-full border-0 border-b border-black/20 pb-2 text-sm focus:outline-none focus:border-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="vous@exemple.com"
          />
        </div>

        {/* Mot de passe */}
        <div>
          <label
            htmlFor="password"
            className="block text-xs uppercase tracking-widest text-gray-500 mb-2"
          >
            Mot de passe
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={isLoading}
            className="w-full border-0 border-b border-black/20 pb-2 text-sm focus:outline-none focus:border-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="••••••••"
          />
          {isSignup && (
            <p className="text-xs text-gray-400 mt-2">
              Min. 8 caractères, 1 majuscule, 1 chiffre
            </p>
          )}
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Bouton submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-black text-white uppercase tracking-wider py-4 px-8 hover:bg-black/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isLoading
            ? "Chargement..."
            : isSignup
            ? "Créer mon compte"
            : "Se connecter"}
        </button>
      </form>

      {/* Séparateur OU */}
      {onGoogleLogin && (
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-black/10"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-4 text-xs uppercase tracking-widest text-gray-400">
              Ou
            </span>
          </div>
        </div>
      )}

      {/* Bouton Google */}
      {onGoogleLogin && (
        <button
          type="button"
          onClick={onGoogleLogin}
          disabled={isLoading}
          className="w-full border border-black/20 text-black uppercase tracking-wider py-4 px-8 hover:bg-black/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continuer avec Google
        </button>
      )}

      {/* Lien mot de passe oublié (non implémenté MVP) */}
      {!isSignup && (
        <div className="text-center mt-6">
          <button
            type="button"
            className="text-xs uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
          >
            Mot de passe oublié ?
          </button>
        </div>
      )}
    </div>
  );
}
