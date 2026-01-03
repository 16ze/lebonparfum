"use client";

import LoginForm from "@/components/auth/LoginForm";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { loginAction, loginWithGoogleAction, signupAction } from "./actions";

/**
 * Page Login - Authentification utilisateur
 *
 * Design Byredo Split Screen :
 * - Image full height à gauche (50%)
 * - Formulaire à droite (50%)
 * - Mobile : Stack vertical
 */
export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Vérifier si on revient après un reset password réussi
  useEffect(() => {
    if (searchParams.get("reset") === "success") {
      setSuccessMessage(
        "Mot de passe réinitialisé avec succès ! Vous pouvez maintenant vous connecter."
      );
    }
  }, [searchParams]);

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

        // Compte créé avec succès
        console.log("✅ Compte créé avec succès");

        // Si la confirmation email est désactivée, on peut se connecter automatiquement
        // Attendre un peu que le profil soit bien créé
        await new Promise((resolve) => setTimeout(resolve, 200));

        // Tenter de se connecter automatiquement
        const loginResult = await loginAction(data.email, data.password);

        if (!loginResult.success) {
          // Si la connexion échoue, afficher un message pour connexion manuelle
          setError(
            "Compte créé mais erreur de connexion. Essayez de vous connecter manuellement."
          );
          setIsLoading(false);
          return;
        }

        // Connexion automatique réussie, rediriger selon le rôle
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
      console.error("❌ Type d'erreur:", typeof err);
      console.error("❌ Détails:", {
        name: err instanceof Error ? err.name : 'unknown',
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : 'no stack',
      });
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
    <main className="min-h-screen bg-white flex flex-col md:flex-row pt-20 md:pt-0">
      {/* ZONE GAUCHE : Image (50% desktop, 40vh mobile) */}
      <div className="relative w-full md:w-1/2 h-[40vh] md:h-screen bg-black">
        {/* Image de fond */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-80"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=2908&auto=format&fit=crop')",
          }}
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />

        {/* Logo en overlay sur l'image */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-3xl md:text-5xl uppercase tracking-widest font-bold mb-4">
              Le Bon Parfum
            </h1>
            <p className="text-xs md:text-sm uppercase tracking-widest opacity-80">
              Parfums de niche
            </p>
          </div>
        </div>
      </div>

      {/* ZONE DROITE : Formulaire (50% desktop, auto mobile) */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-24 md:py-0">
        <div className="w-full max-w-md">
          {/* Message de succès après reset password */}
          {successMessage && (
            <div className="mb-8 bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-sm">
              {successMessage}
            </div>
          )}

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
      </div>
    </main>
  );
}
