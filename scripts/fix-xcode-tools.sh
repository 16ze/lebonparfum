#!/bin/bash

# Script pour réinstaller les Command Line Tools Xcode
# Usage: ./scripts/fix-xcode-tools.sh

set -e

echo "═══════════════════════════════════════════════════════════════"
echo "🔧 MISE À JOUR DES COMMAND LINE TOOLS XCODE"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Cette opération va :"
echo "  1. Supprimer les anciens Command Line Tools"
echo "  2. Lancer l'installation des nouveaux outils"
echo ""
echo "⚠️  Vous devrez entrer votre mot de passe système"
echo ""

read -p "Voulez-vous continuer ? (o/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[OoYy]$ ]]; then
    echo "❌ Annulé"
    exit 1
fi

echo ""
echo "🗑️  Suppression des anciens outils..."
sudo rm -rf /Library/Developer/CommandLineTools

echo "✅ Anciens outils supprimés"
echo ""
echo "📥 Lancement de l'installation des nouveaux outils..."
echo "   (Une fenêtre système va s'ouvrir)"
echo ""

sudo xcode-select --install

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "✅ Installation lancée !"
echo ""
echo "📋 PROCHAINES ÉTAPES :"
echo "   1. Suivez les instructions dans la fenêtre système"
echo "   2. Attendez la fin de l'installation (~5-10 minutes)"
echo "   3. Une fois terminé, exécutez :"
echo "      ./scripts/install-stripe.sh"
echo "═══════════════════════════════════════════════════════════════"
