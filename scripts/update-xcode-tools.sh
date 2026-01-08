#!/bin/bash

# Script pour mettre à jour les Command Line Tools Xcode
# Nécessaire avant d'installer Stripe CLI
# Usage: ./scripts/update-xcode-tools.sh

set -e

echo "🔍 Vérification des Command Line Tools Xcode..."

# Vérifier si les outils sont installés
if ! xcode-select -p &> /dev/null; then
    echo "❌ Command Line Tools non installés"
    echo "📦 Installation des Command Line Tools..."
    sudo xcode-select --install
    echo ""
    echo "✅ Suivez les instructions dans la fenêtre qui s'ouvre"
    echo "   Une fois l'installation terminée, relancez ce script"
    exit 0
fi

echo "✅ Command Line Tools installés"

# Vérifier la version
CLT_PATH=$(xcode-select -p)
echo "📍 Chemin : $CLT_PATH"

echo ""
echo "🔄 Mise à jour des Command Line Tools..."
echo ""
echo "Option 1 (Recommandé) : Via System Settings"
echo "   1. Ouvrez System Settings (Réglages Système)"
echo "   2. Allez dans General > Software Update"
echo "   3. Installez les mises à jour disponibles"
echo ""
echo "Option 2 : Réinstallation complète"
echo "   Exécutez ces commandes :"
echo ""
echo "   sudo rm -rf /Library/Developer/CommandLineTools"
echo "   sudo xcode-select --install"
echo ""
echo "Option 3 : Téléchargement manuel"
echo "   https://developer.apple.com/download/all/"
echo "   Recherchez : 'Command Line Tools for Xcode 26.0'"
echo ""
echo "⚠️  Après la mise à jour, relancez :"
echo "   ./scripts/install-stripe.sh"

