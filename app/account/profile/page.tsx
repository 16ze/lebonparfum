"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Loader2, User } from "lucide-react";

/**
 * Page Mon Profil - Espace Client
 *
 * Affiche et permet de modifier :
 * - Nom complet
 * - Email (non modifiable)
 * - Mot de passe (changement)
 *
 * Design Byredo : Formulaire minimal
 */

type ProfileData = {
  email: string;
  full_name: string | null;
};

export default function AccountProfilePage() {
  const supabase = createClient();

  const [profile, setProfile] = useState<ProfileData>({
    email: "",
    full_name: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Mot de passe
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Charger le profil
  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("id", user.id)
          .single();

        if (data) {
          setProfile(data);
        }
      }

      setLoading(false);
    };

    fetchProfile();
  }, [supabase]);

  // Sauvegarder le profil
  const handleSaveProfile = async () => {
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Non authentifié");

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ full_name: profile.full_name })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  // Changer le mot de passe
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (newPassword.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      setSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Erreur lors du changement de mot de passe");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      {/* Titre */}
      <div className="mb-8">
        <h1 className="text-3xl uppercase tracking-widest font-bold mb-2">
          Mon Profil
        </h1>
        <p className="text-sm text-gray-500 uppercase tracking-wider">
          Gérez vos informations personnelles
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-sm mb-6">
          ✓ Modifications enregistrées avec succès
        </div>
      )}

      {/* Formulaire Informations personnelles */}
      <div className="border border-black/10 p-8 mb-6">
        <h2 className="text-lg uppercase tracking-widest font-bold mb-6 flex items-center gap-2">
          <User className="w-5 h-5" strokeWidth={1.5} />
          Informations Personnelles
        </h2>

        <div className="space-y-6">
          {/* Nom complet */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
              Nom complet
            </label>
            <input
              type="text"
              value={profile.full_name || ""}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, full_name: e.target.value }))
              }
              className="w-full px-4 py-3 border border-black/10 focus:outline-none focus:border-black transition-colors"
              placeholder="Votre nom"
            />
          </div>

          {/* Email (non modifiable) */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
              Email
            </label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full px-4 py-3 border border-black/10 bg-gray-50 text-gray-500"
            />
            <p className="text-xs text-gray-400 mt-2 uppercase tracking-wider">
              L'email ne peut pas être modifié
            </p>
          </div>
        </div>

        {/* Bouton Sauvegarder */}
        <div className="flex justify-end mt-6">
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="bg-black text-white px-6 py-3 text-sm uppercase tracking-wider hover:bg-black/80 transition-colors disabled:opacity-50"
          >
            {saving ? "Sauvegarde..." : "Enregistrer"}
          </button>
        </div>
      </div>

      {/* Section Mot de passe */}
      <div className="border border-black/10 p-8">
        <h2 className="text-lg uppercase tracking-widest font-bold mb-4">
          Sécurité
        </h2>

        {!showPasswordForm ? (
          <button
            onClick={() => setShowPasswordForm(true)}
            className="text-sm uppercase tracking-wider text-gray-700 hover:text-black transition-colors underline"
          >
            Changer mon mot de passe
          </button>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 border border-black/10 focus:outline-none focus:border-black transition-colors"
                placeholder="Minimum 8 caractères"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-black/10 focus:outline-none focus:border-black transition-colors"
                placeholder="Retapez le mot de passe"
              />
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowPasswordForm(false)}
                className="px-6 py-3 text-sm uppercase tracking-wider text-gray-600 hover:bg-black/5 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleChangePassword}
                disabled={saving}
                className="bg-black text-white px-6 py-3 text-sm uppercase tracking-wider hover:bg-black/80 transition-colors disabled:opacity-50"
              >
                {saving ? "Modification..." : "Modifier le mot de passe"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

