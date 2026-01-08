#!/bin/bash

# Script pour démarrer Stripe CLI et configurer les webhooks
# Usage: ./scripts/start-stripe.sh

set -e

echo "🔍 Vérification de Stripe CLI..."

# Vérifier si Stripe CLI est installé
if ! command -v stripe &> /dev/null; then
    echo "❌ Stripe CLI n'est pas installé."
    echo ""
    echo "📦 Installation de Stripe CLI..."
    echo ""
    echo "Pour macOS (avec Homebrew):"
    echo "  brew install stripe/stripe-cli/stripe"
    echo ""
    echo "Pour Linux/Windows:"
    echo "  https://stripe.com/docs/stripe-cli#install"
    echo ""
    echo "Après l'installation, exécutez:"
    echo "  stripe login"
    echo ""
    exit 1
fi

echo "✅ Stripe CLI est installé"

# Vérifier si l'utilisateur est connecté
if ! stripe config --list &> /dev/null; then
    echo "🔐 Vous devez vous connecter à Stripe:"
    echo "  stripe login"
    exit 1
fi

echo "✅ Connecté à Stripe"

# Détecter le port Next.js (3000 ou 3001)
PORT=3000
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    PORT=3001
elif ! lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Aucun serveur Next.js détecté sur les ports 3000 ou 3001"
    echo "   Assurez-vous que 'npm run dev' est en cours d'exécution"
    echo ""
fi

echo "🚀 Démarrage de Stripe CLI sur le port $PORT..."
echo ""

# Démarrer Stripe listen
stripe listen --forward-to localhost:${PORT}/api/webhooks/stripe

