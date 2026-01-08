#!/bin/bash

# Script pour installer automatiquement les Command Line Tools Xcode
# Usage: ./scripts/install-xcode-tools-auto.sh

set -e

echo "🔍 Vérification des mises à jour disponibles..."

# Vérifier si une mise à jour des Command Line Tools est disponible
UPDATE_INFO=$(softwareupdate --list 2>&1 | grep -i "Command Line Tools" || echo "")

if [ -z "$UPDATE_INFO" ]; then
    echo "✅ Les Command Line Tools sont à jour"
    exit 0
fi

echo "📦 Mise à jour disponible trouvée :"
echo "$UPDATE_INFO"
echo ""
echo "🚀 Installation des Command Line Tools..."
echo ""
echo "⚠️  Cette commande nécessite votre mot de passe système"
echo ""

# Extraire le label de la mise à jour
LABEL=$(echo "$UPDATE_INFO" | grep -o "Label: [^,]*" | cut -d' ' -f2)

if [ -z "$LABEL" ]; then
    echo "❌ Impossible de trouver le label de la mise à jour"
    echo ""
    echo "💡 Alternative : Installez manuellement via :"
    echo "   sudo softwareupdate --install \"Command Line Tools for Xcode 26.2\""
    exit 1
fi

echo "📥 Installation de : $LABEL"
echo ""

# Installer via softwareupdate
sudo softwareupdate --install "$LABEL"

echo ""
echo "✅ Installation terminée !"
echo ""
echo "🔍 Vérification de l'installation..."
xcode-select -p

echo ""
echo "🚀 Vous pouvez maintenant installer Stripe CLI :"
echo "   ./scripts/install-stripe.sh"

