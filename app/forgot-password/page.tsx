"use client";

import { useState } from "react";
import { forgotPasswordAction } from "@/app/login/actions";
import { Loader2 } from "lucide-react";

/**
 * Page Forgot Password - Demande de réinitialisation
 *
 * Design Byredo Split Screen (comme la page login)
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await forgotPasswordAction(email);

      if (!result.success) {
        setError(result.error || "Erreur lors de l'envoi de l'email");
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setIsLoading(false);
    } catch (err) {
      console.error("❌ Erreur inattendue:", err);
      setError("Une erreur inattendue s'est produite");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white flex flex-col md:flex-row">
      {/* ZONE GAUCHE : Image */}
      <div className="relative w-full md:w-1/2 h-[40vh] md:h-screen bg-black">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-80"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=2908&auto=format&fit=crop')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
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

      {/* ZONE DROITE : Formulaire */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-12 md:py-0">
        <div className="w-full max-w-md">
          {/* Titre */}
          <div className="mb-12">
            <h2 className="text-2xl uppercase tracking-widest font-bold mb-2">
              Mot de passe oublié
            </h2>
            <p className="text-xs uppercase tracking-widest text-gray-400">
              Réinitialisez votre mot de passe
            </p>
          </div>

          {success ? (
            // Message de succès
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4">
                <p className="text-sm mb-2 font-medium">Email envoyé !</p>
                <p className="text-xs">
                  Si un compte existe avec cet email, vous recevrez un lien de
                  réinitialisation dans quelques instants.
                </p>
              </div>

              <div className="text-center">
                <a
                  href="/login"
                  className="text-xs uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ← Retour à la connexion
                </a>
              </div>
            </div>
          ) : (
            // Formulaire
            <form onSubmit={handleSubmit} className="space-y-8">
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full border-0 border-b border-black/20 pb-2 text-sm focus:outline-none focus:border-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="vous@exemple.com"
                />
                <p className="text-xs text-gray-400 mt-2">
                  Entrez l'email associé à votre compte
                </p>
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
                {isLoading ? "Envoi en cours..." : "Envoyer le lien"}
              </button>

              {/* Retour à la connexion */}
              <div className="text-center">
                <a
                  href="/login"
                  className="text-xs uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ← Retour à la connexion
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
