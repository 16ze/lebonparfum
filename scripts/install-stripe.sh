#!/bin/bash

# Script d'installation automatique de Stripe CLI
# Usage: ./scripts/install-stripe.sh

set -e

echo "🔍 Vérification de Stripe CLI..."

# Vérifier si Stripe CLI est déjà installé
if command -v stripe &> /dev/null; then
    echo "✅ Stripe CLI est déjà installé"
    stripe --version
    exit 0
fi

echo "📦 Installation de Stripe CLI..."

# Détecter le système d'exploitation
OS="$(uname -s)"

case "$OS" in
    Darwin*)
        echo "🍎 macOS détecté - Installation via Homebrew..."
        if ! command -v brew &> /dev/null; then
            echo "❌ Homebrew n'est pas installé."
            echo "   Installez Homebrew d'abord : https://brew.sh"
            exit 1
        fi
        brew install stripe/stripe-cli/stripe
        ;;
    Linux*)
        echo "🐧 Linux détecté - Installation manuelle requise"
        echo "   Téléchargez depuis : https://github.com/stripe/stripe-cli/releases"
        exit 1
        ;;
    *)
        echo "❌ Système d'exploitation non supporté : $OS"
        echo "   Consultez : https://stripe.com/docs/stripe-cli#install"
        exit 1
        ;;
esac

# Vérifier l'installation
if command -v stripe &> /dev/null; then
    echo "✅ Stripe CLI installé avec succès !"
    stripe --version
    echo ""
    echo "🚀 Prochaine étape : Exécutez 'stripe login'"
else
    echo "❌ Échec de l'installation"
    exit 1
fi

