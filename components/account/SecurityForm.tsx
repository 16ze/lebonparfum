"use client";

import { useState } from "react";
import { Loader2, Check, X, Eye, EyeOff, Key } from "lucide-react";
import { updatePasswordAction } from "@/app/account/actions";

/**
 * SecurityForm - Formulaire de changement de mot de passe
 *
 * Design Byredo :
 * - Inputs flat avec border-b
 * - Validation en temps réel
 * - Affichage des critères de sécurité
 * - Toggle show/hide password
 */

export default function SecurityForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation des critères
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const isValid = hasMinLength && hasUppercase && hasNumber && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    if (!isValid) {
      setError("Veuillez respecter tous les critères de sécurité");
      setIsLoading(false);
      return;
    }

    try {
      const result = await updatePasswordAction(password);

      if (!result.success) {
        setError(result.error || "Erreur lors du changement de mot de passe");
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error("❌ Erreur update password:", err);
      setError("Une erreur inattendue s'est produite");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Section : Changement de mot de passe */}
      <div className="border border-black/10 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <Key size={20} strokeWidth={1.5} className="text-gray-400" />
          <h2 className="text-xs uppercase tracking-widest text-gray-500">
            Changer mon mot de passe
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nouveau mot de passe */}
          <div>
            <label
              htmlFor="password"
              className="block text-xs uppercase tracking-widest text-gray-500 mb-2"
            >
              Nouveau mot de passe
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full border-0 border-b border-black/20 pb-2 text-sm focus:outline-none focus:border-black transition-colors disabled:opacity-50 pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 bottom-2 text-gray-400 hover:text-black transition-colors"
              >
                {showPassword ? (
                  <EyeOff size={18} strokeWidth={1.5} />
                ) : (
                  <Eye size={18} strokeWidth={1.5} />
                )}
              </button>
            </div>
          </div>

          {/* Confirmation mot de passe */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-xs uppercase tracking-widest text-gray-500 mb-2"
            >
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                className="w-full border-0 border-b border-black/20 pb-2 text-sm focus:outline-none focus:border-black transition-colors disabled:opacity-50 pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-0 bottom-2 text-gray-400 hover:text-black transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} strokeWidth={1.5} />
                ) : (
                  <Eye size={18} strokeWidth={1.5} />
                )}
              </button>
            </div>
          </div>

          {/* Critères de sécurité */}
          <div className="bg-gray-50 p-4 border border-black/10">
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">
              Critères de sécurité
            </p>
            <ul className="space-y-2">
              <SecurityCriterion
                met={hasMinLength}
                label="Au moins 8 caractères"
              />
              <SecurityCriterion
                met={hasUppercase}
                label="Au moins une majuscule"
              />
              <SecurityCriterion met={hasNumber} label="Au moins un chiffre" />
              <SecurityCriterion
                met={passwordsMatch}
                label="Les mots de passe correspondent"
              />
            </ul>
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
              <span>Mot de passe modifié avec succès</span>
            </div>
          )}

          {/* Bouton Submit */}
          <button
            type="submit"
            disabled={isLoading || !isValid}
            className="bg-black text-white uppercase tracking-wider text-xs py-4 px-8 hover:bg-black/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? "Modification..." : "Changer le mot de passe"}
          </button>
        </form>
      </div>

      {/* Section : Conseil de sécurité */}
      <div className="border border-black/10 p-6 bg-gray-50">
        <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-3">
          Conseils de sécurité
        </h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• Utilisez un mot de passe unique pour ce site</li>
          <li>• Ne partagez jamais votre mot de passe</li>
          <li>• Changez votre mot de passe régulièrement</li>
          <li>• Utilisez un gestionnaire de mots de passe</li>
        </ul>
      </div>
    </div>
  );
}

/**
 * SecurityCriterion - Ligne de critère de sécurité
 */
function SecurityCriterion({ met, label }: { met: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      {met ? (
        <Check size={16} className="text-green-600" strokeWidth={2} />
      ) : (
        <X size={16} className="text-gray-300" strokeWidth={2} />
      )}
      <span className={met ? "text-green-700" : "text-gray-500"}>{label}</span>
    </li>
  );
}

