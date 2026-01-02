"use client";

import { useEffect, useState } from "react";
import { Save, Loader2, Instagram, Twitter } from "lucide-react";
import { SiTiktok } from "react-icons/si";

/**
 * Page Admin - Configuration Site
 *
 * Permet de modifier :
 * - URL Instagram
 * - URL TikTok
 * - Email de contact
 *
 * Design Byredo : Formulaire minimal avec sauvegarde instantanée
 */

type Settings = {
  instagram_url: string;
  tiktok_url: string;
  contact_email: string;
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    instagram_url: "",
    tiktok_url: "",
    contact_email: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Charger les paramètres actuels
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (error) {
        console.error("Erreur chargement settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Sauvegarder les modifications
  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        throw new Error("Erreur lors de la sauvegarde");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-gray-400 uppercase tracking-wider">
          Chargement...
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl uppercase tracking-widest font-bold mb-2">
          Configuration
        </h1>
        <p className="text-sm text-gray-500 uppercase tracking-wider">
          Paramètres généraux du site
        </p>
      </div>

      {/* Formulaire */}
      <div className="max-w-2xl">
        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-sm mb-6">
            ✓ Paramètres sauvegardés avec succès
          </div>
        )}

        {/* Section Réseaux sociaux */}
        <div className="border border-black/10 p-8 mb-6">
          <h2 className="text-lg uppercase tracking-widest font-bold mb-6 flex items-center gap-2">
            <Instagram className="w-5 h-5" strokeWidth={1.5} />
            Réseaux Sociaux
          </h2>

          <div className="space-y-6">
            {/* Instagram */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                Instagram URL
              </label>
              <input
                type="url"
                value={settings.instagram_url}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    instagram_url: e.target.value,
                  }))
                }
                placeholder="https://instagram.com/votrecompte"
                className="w-full px-4 py-3 border border-black/10 focus:outline-none focus:border-black transition-colors"
              />
            </div>

            {/* TikTok */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                TikTok URL
              </label>
              <input
                type="url"
                value={settings.tiktok_url}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    tiktok_url: e.target.value,
                  }))
                }
                placeholder="https://tiktok.com/@votrecompte"
                className="w-full px-4 py-3 border border-black/10 focus:outline-none focus:border-black transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Section Contact */}
        <div className="border border-black/10 p-8 mb-6">
          <h2 className="text-lg uppercase tracking-widest font-bold mb-6">
            Contact
          </h2>

          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
              Email de contact
            </label>
            <input
              type="email"
              value={settings.contact_email}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  contact_email: e.target.value,
                }))
              }
              placeholder="contact@lebonparfum.com"
              className="w-full px-4 py-3 border border-black/10 focus:outline-none focus:border-black transition-colors"
            />
            <p className="text-xs text-gray-400 mt-2 uppercase tracking-wider">
              Utilisé pour les notifications et le formulaire de contact
            </p>
          </div>
        </div>

        {/* Bouton Sauvegarder */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-black text-white px-8 py-4 text-sm uppercase tracking-wider hover:bg-black/80 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" strokeWidth={2} />
                Enregistrer les modifications
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

