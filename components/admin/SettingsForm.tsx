"use client";

import { useState } from "react";
import { Loader2, Instagram, Facebook, Twitter, Youtube } from "lucide-react";
import { updateSiteSettings } from "@/app/admin/settings/actions";
import { useRouter } from "next/navigation";

/**
 * SettingsForm - Formulaire des paramètres du site (Client Component)
 *
 * Features :
 * - Édition des liens réseaux sociaux
 * - Validation URL
 * - Sauvegarde
 */

interface SettingsFormProps {
  settings: Record<string, string>;
}

export default function SettingsForm({ settings }: SettingsFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    social_instagram: settings.social_instagram || "",
    social_facebook: settings.social_facebook || "",
    social_twitter: settings.social_twitter || "",
    social_tiktok: settings.social_tiktok || "",
    social_youtube: settings.social_youtube || "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Gérer les changements de champs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setSuccess(false);
  };

  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await updateSiteSettings(formData);

      if (!result.success) {
        setError(result.error || "Erreur lors de la sauvegarde");
        setIsLoading(false);
        return;
      }

      // Succès
      setSuccess(true);
      setIsLoading(false);
      router.refresh();
    } catch (err) {
      console.error("❌ Erreur inattendue:", err);
      setError("Une erreur inattendue s'est produite");
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl uppercase tracking-widest font-bold mb-2">
          Paramètres
        </h1>
        <p className="text-sm text-gray-500 uppercase tracking-wider">
          Configuration du site
        </p>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
        {/* Section Réseaux sociaux */}
        <div className="border border-black/10 p-8">
          <h2 className="text-xl uppercase tracking-widest font-bold mb-6">
            Réseaux sociaux
          </h2>
          <p className="text-xs text-gray-400 mb-6 uppercase tracking-wider">
            Liens affichés dans le footer du site
          </p>

          <div className="space-y-6">
            {/* Instagram */}
            <div>
              <label
                htmlFor="social_instagram"
                className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500 mb-2"
              >
                <Instagram className="w-4 h-4" strokeWidth={1.5} />
                Instagram
              </label>
              <input
                type="url"
                id="social_instagram"
                name="social_instagram"
                value={formData.social_instagram}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full border-0 border-b border-black/20 pb-2 text-sm focus:outline-none focus:border-black transition-colors disabled:opacity-50"
                placeholder="https://instagram.com/votrecompte"
              />
            </div>

            {/* Facebook */}
            <div>
              <label
                htmlFor="social_facebook"
                className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500 mb-2"
              >
                <Facebook className="w-4 h-4" strokeWidth={1.5} />
                Facebook
              </label>
              <input
                type="url"
                id="social_facebook"
                name="social_facebook"
                value={formData.social_facebook}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full border-0 border-b border-black/20 pb-2 text-sm focus:outline-none focus:border-black transition-colors disabled:opacity-50"
                placeholder="https://facebook.com/votrecompte"
              />
            </div>

            {/* Twitter */}
            <div>
              <label
                htmlFor="social_twitter"
                className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500 mb-2"
              >
                <Twitter className="w-4 h-4" strokeWidth={1.5} />
                Twitter
              </label>
              <input
                type="url"
                id="social_twitter"
                name="social_twitter"
                value={formData.social_twitter}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full border-0 border-b border-black/20 pb-2 text-sm focus:outline-none focus:border-black transition-colors disabled:opacity-50"
                placeholder="https://twitter.com/votrecompte"
              />
            </div>

            {/* TikTok */}
            <div>
              <label
                htmlFor="social_tiktok"
                className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500 mb-2"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
                TikTok
              </label>
              <input
                type="url"
                id="social_tiktok"
                name="social_tiktok"
                value={formData.social_tiktok}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full border-0 border-b border-black/20 pb-2 text-sm focus:outline-none focus:border-black transition-colors disabled:opacity-50"
                placeholder="https://tiktok.com/@votrecompte"
              />
            </div>

            {/* YouTube */}
            <div>
              <label
                htmlFor="social_youtube"
                className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500 mb-2"
              >
                <Youtube className="w-4 h-4" strokeWidth={1.5} />
                YouTube
              </label>
              <input
                type="url"
                id="social_youtube"
                name="social_youtube"
                value={formData.social_youtube}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full border-0 border-b border-black/20 pb-2 text-sm focus:outline-none focus:border-black transition-colors disabled:opacity-50"
                placeholder="https://youtube.com/@votrecompte"
              />
            </div>
          </div>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Message de succès */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-sm">
            Paramètres sauvegardés avec succès !
          </div>
        )}

        {/* Bouton sauvegarder */}
        <button
          type="submit"
          disabled={isLoading}
          className="bg-black text-white px-8 py-3 uppercase tracking-wider text-sm hover:bg-black/80 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isLoading ? "Sauvegarde..." : "Sauvegarder"}
        </button>
      </form>
    </div>
  );
}
