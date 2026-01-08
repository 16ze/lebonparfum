#!/bin/bash

# Script pour lancer Stripe CLI sur le port 3001
# Usage: ./scripts/run-stripe-3001.sh

set -e

echo "🚀 Démarrage de Stripe CLI sur le port 3001..."
echo ""

# Trouver stripe dans différents emplacements
STRIPE_CMD=""
if command -v stripe &> /dev/null; then
    STRIPE_CMD="stripe"
elif [ -f "$HOME/.local/bin/stripe" ]; then
    STRIPE_CMD="$HOME/.local/bin/stripe"
    export PATH="$HOME/.local/bin:$PATH"
else
    echo "❌ Stripe CLI non trouvé."
    echo ""
    echo "📦 Installation nécessaire :"
    echo "   ./scripts/install-stripe-direct.sh"
    echo ""
    exit 1
fi

echo "✅ Stripe CLI trouvé: $STRIPE_CMD"
$STRIPE_CMD --version
echo ""

# Vérifier si l'utilisateur est connecté
if ! $STRIPE_CMD config --list &> /dev/null; then
    echo "🔐 Connexion à Stripe nécessaire..."
    $STRIPE_CMD login
    echo ""
fi

echo "🚀 Démarrage sur localhost:3001/api/webhooks/stripe"
echo ""

# Lancer Stripe listen sur le port 3001
$STRIPE_CMD listen --forward-to localhost:3001/api/webhooks/stripe
