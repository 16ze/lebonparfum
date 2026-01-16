"use client";

import { useActionState } from "react";
import { submitContactForm, type ContactFormState } from "./actions";
import { Mail, Clock, HelpCircle } from "lucide-react";
import Link from "next/link";
import { LEGAL_CONSTANTS } from "@/app/legal/constants";

export default function ContactPage() {
  const [state, formAction, isPending] = useActionState<
    ContactFormState | null,
    FormData
  >(submitContactForm, null);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20">
        {/* Titre */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-wider mb-4">
            Contactez-Nous
          </h1>
          <p className="text-sm md:text-base text-gray-600 uppercase tracking-wide max-w-2xl mx-auto">
            Une question ? Un besoin particulier ? Notre équipe est à votre
            écoute.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16">
          {/* Colonne gauche : Informations */}
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold uppercase tracking-wide mb-6">
                Informations de Contact
              </h2>
              <div className="space-y-6">
                {/* Email */}
                <div className="flex items-start gap-4">
                  <Mail className="w-5 h-5 text-black mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                      Email
                    </p>
                    <a
                      href={`mailto:${LEGAL_CONSTANTS.companyEmail}`}
                      className="text-sm md:text-base text-black hover:text-gray-600 transition-colors"
                    >
                      {LEGAL_CONSTANTS.companyEmail}
                    </a>
                  </div>
                </div>

                {/* Téléphone */}
                <div className="flex items-start gap-4">
                  <Mail className="w-5 h-5 text-black mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                      Téléphone
                    </p>
                    <a
                      href={`tel:${LEGAL_CONSTANTS.companyPhone.replace(/\s/g, "")}`}
                      className="text-sm md:text-base text-black hover:text-gray-600 transition-colors"
                    >
                      {LEGAL_CONSTANTS.companyPhone}
                    </a>
                  </div>
                </div>

                {/* Horaires */}
                <div className="flex items-start gap-4">
                  <Clock className="w-5 h-5 text-black mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                      Horaires
                    </p>
                    <p className="text-sm md:text-base text-black">
                      Lundi - Vendredi : 9h - 18h
                      <br />
                      Samedi : 10h - 16h
                      <br />
                      Dimanche : Fermé
                    </p>
                  </div>
                </div>

                {/* Adresse */}
                <div className="flex items-start gap-4">
                  <Mail className="w-5 h-5 text-black mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                      Adresse
                    </p>
                    <p className="text-sm md:text-base text-black">
                      {LEGAL_CONSTANTS.companyAddress}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Link */}
            <div className="pt-8 border-t border-gray-200">
              <Link
                href="/legal/terms"
                className="inline-flex items-center gap-2 text-sm text-black hover:text-gray-600 transition-colors uppercase tracking-wide"
              >
                <HelpCircle className="w-4 h-4" />
                Consultez nos CGV et FAQ
              </Link>
            </div>
          </div>

          {/* Colonne droite : Formulaire */}
          <div>
            <h2 className="text-xl font-bold uppercase tracking-wide mb-6">
              Envoyez-Nous un Message
            </h2>

            {state?.success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 text-sm">
                <p className="font-medium">✓ Message envoyé avec succès</p>
                <p className="mt-1 text-xs">
                  Nous vous répondrons sous 24h ouvrées.
                </p>
              </div>
            )}

            {state?.error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 text-sm">
                <p className="font-medium">✗ {state.error}</p>
              </div>
            )}

            <form action={formAction} className="space-y-6">
              {/* Nom */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-xs uppercase tracking-wide text-gray-700 mb-2"
                >
                  Nom complet *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  disabled={isPending}
                  className="w-full bg-white border border-black px-4 py-3 text-sm uppercase tracking-wide focus:outline-none focus:ring-1 focus:ring-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {state?.fieldErrors?.name && (
                  <p className="mt-1 text-xs text-red-600">
                    {state.fieldErrors.name[0]}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs uppercase tracking-wide text-gray-700 mb-2"
                >
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  disabled={isPending}
                  className="w-full bg-white border border-black px-4 py-3 text-sm uppercase tracking-wide focus:outline-none focus:ring-1 focus:ring-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {state?.fieldErrors?.email && (
                  <p className="mt-1 text-xs text-red-600">
                    {state.fieldErrors.email[0]}
                  </p>
                )}
              </div>

              {/* Sujet */}
              <div>
                <label
                  htmlFor="subject"
                  className="block text-xs uppercase tracking-wide text-gray-700 mb-2"
                >
                  Sujet *
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  disabled={isPending}
                  className="w-full bg-white border border-black px-4 py-3 text-sm uppercase tracking-wide focus:outline-none focus:ring-1 focus:ring-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Sélectionnez un sujet</option>
                  <option value="commande">Question sur une commande</option>
                  <option value="info">Demande d'information</option>
                  <option value="autre">Autre</option>
                </select>
                {state?.fieldErrors?.subject && (
                  <p className="mt-1 text-xs text-red-600">
                    {state.fieldErrors.subject[0]}
                  </p>
                )}
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-xs uppercase tracking-wide text-gray-700 mb-2"
                >
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  disabled={isPending}
                  className="w-full bg-white border border-black px-4 py-3 text-sm uppercase tracking-wide focus:outline-none focus:ring-1 focus:ring-black transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {state?.fieldErrors?.message && (
                  <p className="mt-1 text-xs text-red-600">
                    {state.fieldErrors.message[0]}
                  </p>
                )}
              </div>

              {/* Bouton Submit */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-black text-white px-6 py-4 text-xs uppercase tracking-widest font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? "Envoi en cours..." : "Envoyer le message"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
