"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import { loginAction, signupAction, loginWithGoogleAction } from "./actions";

/**
 * Page Login - Authentification utilisateur
 *
 * Design Byredo :
 * - Page minimaliste centrée
 * - Logo en haut
 * - Formulaire LoginForm
 * - Fond blanc pur
 */
export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: {
    email: string;
    password: string;
    fullName?: string;
    isSignup: boolean;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      if (data.isSignup) {
        // Créer un compte
        if (!data.fullName) {
          setError("Le nom complet est requis");
          setIsLoading(false);
          return;
        }

        const result = await signupAction(
          data.email,
          data.password,
          data.fullName
        );

        if (!result.success) {
          setError(result.error || "Erreur lors de la création du compte");
          setIsLoading(false);
          return;
        }

        // Compte créé → auto-login
        const loginResult = await loginAction(data.email, data.password);

        if (!loginResult.success) {
          setError(
            "Compte créé mais erreur de connexion. Essayez de vous connecter manuellement."
          );
          setIsLoading(false);
          return;
        }

        // Redirection selon le rôle
        if (loginResult.isAdmin) {
          router.push("/admin/dashboard");
        } else {
          router.push("/account/profile");
        }
      } else {
        // Se connecter
        const result = await loginAction(data.email, data.password);

        if (!result.success) {
          setError(result.error || "Erreur lors de la connexion");
          setIsLoading(false);
          return;
        }

        // Redirection selon le rôle
        if (result.isAdmin) {
          router.push("/admin/dashboard");
        } else {
          router.push("/account/profile");
        }
      }
    } catch (err) {
      console.error("❌ Erreur inattendue:", err);
      setError("Une erreur inattendue s'est produite");
      setIsLoading(false);
    }
  };

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
      console.error("❌ Erreur Google login:", err);
      setError("Erreur lors de la connexion avec Google");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Logo / Titre */}
        <div className="text-center mt-12 mb-12">
          <h1 className="text-2xl md:text-3xl uppercase tracking-widest font-bold mb-2">
            Le Bon Parfum
          </h1>
          <p className="text-xs uppercase tracking-widest text-gray-400">
            Espace Client
          </p>
        </div>

        {/* Formulaire de login */}
        <LoginForm
          onSubmit={handleSubmit}
          onGoogleLogin={handleGoogleLogin}
          isLoading={isLoading}
          error={error}
        />

        {/* Retour à l'accueil */}
        <div className="text-center mt-12">
          <a
            href="/"
            className="text-xs uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← Retour à l'accueil
          </a>
        </div>
      </div>
    </main>
  );
}
