"use client";

import { useState } from "react";
import { Loader2, Check, X } from "lucide-react";
import { updateProfileAction } from "@/app/account/actions";

/**
 * ProfileForm - Formulaire d'édition du profil
 *
 * Design Byredo :
 * - Inputs flat avec border-b
 * - Labels uppercase tracking-widest
 * - Bouton noir flat
 */

interface ProfileFormProps {
  profile: {
    id: string;
    email: string;
    full_name: string | null;
    created_at: string;
  };
}

export default function ProfileForm({ profile }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fullName, setFullName] = useState(profile.full_name || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await updateProfileAction(profile.id, {
        full_name: fullName.trim(),
      });

      if (!result.success) {
        setError(result.error || "Erreur lors de la mise à jour");
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("❌ Erreur update profil:", err);
      setError("Une erreur inattendue s'est produite");
    } finally {
      setIsLoading(false);
    }
  };

  const createdDate = new Date(profile.created_at).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-8">
      {/* Section : Informations Générales */}
      <div className="border border-black/10 p-6">
        <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-6">
          Informations Générales
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nom complet */}
          <div>
            <label
              htmlFor="fullName"
              className="block text-xs uppercase tracking-widest text-gray-500 mb-2"
            >
              Nom Complet
            </label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isLoading}
              className="w-full border-0 border-b border-black/20 pb-2 text-sm focus:outline-none focus:border-black transition-colors disabled:opacity-50"
              placeholder="Jean Dupont"
            />
          </div>

          {/* Email (lecture seule) */}
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
              value={profile.email}
              disabled
              className="w-full border-0 border-b border-black/20 pb-2 text-sm bg-gray-50 cursor-not-allowed opacity-60"
            />
            <p className="text-xs text-gray-400 mt-2">
              Pour modifier votre email, contactez le support
            </p>
          </div>

          {/* Date de création */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
              Membre depuis
            </label>
            <p className="text-sm">{createdDate}</p>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm flex items-center gap-2">
              <X size={16} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 text-sm flex items-center gap-2">
              <Check size={16} />
              <span>Profil mis à jour avec succès</span>
            </div>
          )}

          {/* Bouton Submit */}
          <button
            type="submit"
            disabled={isLoading || fullName.trim() === profile.full_name}
            className="bg-black text-white uppercase tracking-wider text-xs py-4 px-8 hover:bg-black/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </form>
      </div>

      {/* Section : Sécurité (Future) */}
      <div className="border border-black/10 p-6">
        <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-4">
          Sécurité
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Modifiez votre mot de passe pour sécuriser votre compte
        </p>
        <button
          disabled
          className="bg-gray-100 text-gray-400 uppercase tracking-wider text-xs py-3 px-6 cursor-not-allowed"
        >
          Changer le mot de passe (Bientôt disponible)
        </button>
      </div>
    </div>
  );
}

