#!/bin/bash

# Installation directe de Stripe CLI depuis GitHub (sans Homebrew)
# Usage: ./scripts/install-stripe-direct.sh

set -e

echo "🔍 Installation directe de Stripe CLI (sans Homebrew/Xcode)..."
echo ""

# Détecter l'architecture
ARCH=$(uname -m)
OS=$(uname -s | tr '[:upper:]' '[:lower:]')

# Mapper l'architecture
case "$ARCH" in
    x86_64)
        STRIPE_ARCH="amd64"
        ;;
    arm64|aarch64)
        STRIPE_ARCH="arm64"
        ;;
    *)
        echo "❌ Architecture non supportée: $ARCH"
        exit 1
        ;;
esac

if [ "$OS" != "darwin" ]; then
    echo "❌ Ce script est uniquement pour macOS"
    exit 1
fi

# Définir le répertoire d'installation local
INSTALL_DIR="$HOME/.local/bin"
STRIPE_BIN="$INSTALL_DIR/stripe"

# Créer le répertoire s'il n'existe pas
mkdir -p "$INSTALL_DIR"

# URL de téléchargement (version la plus récente)
STRIPE_VERSION="1.34.0"
DOWNLOAD_URL="https://github.com/stripe/stripe-cli/releases/download/v${STRIPE_VERSION}/stripe_${STRIPE_VERSION}_${OS}_${STRIPE_ARCH}.tar.gz"

echo "📥 Téléchargement de Stripe CLI v${STRIPE_VERSION}..."
echo "   Architecture: $STRIPE_ARCH"
echo "   URL: $DOWNLOAD_URL"
echo ""

# Télécharger dans un répertoire temporaire
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"

curl -L -o stripe.tar.gz "$DOWNLOAD_URL" || {
    echo "❌ Échec du téléchargement"
    exit 1
}

echo "📦 Extraction..."
tar -xzf stripe.tar.gz

echo "📝 Installation dans $INSTALL_DIR..."
cp stripe "$STRIPE_BIN"
chmod +x "$STRIPE_BIN"

# Nettoyer
cd - > /dev/null
rm -rf "$TEMP_DIR"

# Ajouter au PATH si nécessaire
if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
    echo ""
    echo "⚠️  Ajoutez ceci à votre ~/.zshrc ou ~/.bashrc :"
    echo "   export PATH=\"\$HOME/.local/bin:\$PATH\""
    echo ""
    echo "Ou exécutez maintenant :"
    echo "   export PATH=\"\$HOME/.local/bin:\$PATH\""
    echo ""
fi

# Vérifier l'installation
if [ -f "$STRIPE_BIN" ]; then
    echo "✅ Stripe CLI installé avec succès !"
    "$STRIPE_BIN" --version
    
    # Ajouter temporairement au PATH pour cette session
    export PATH="$INSTALL_DIR:$PATH"
    
    echo ""
    echo "🚀 Prochaine étape : Exécutez 'stripe login'"
    echo ""
    echo "💡 Pour utiliser Stripe CLI dans cette session :"
    echo "   export PATH=\"\$HOME/.local/bin:\$PATH\""
    echo "   stripe login"
else
    echo "❌ Échec de l'installation"
    exit 1
fi
