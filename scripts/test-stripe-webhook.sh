#!/bin/bash

# Script de test pour diagnostiquer les problèmes Stripe
# Usage: ./scripts/test-stripe-webhook.sh

set -e

echo "═══════════════════════════════════════════════════════════════"
echo "🔍 DIAGNOSTIC STRIPE WEBHOOK"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Vérifier Stripe CLI
echo "1️⃣ Vérification Stripe CLI..."
export PATH="$HOME/.local/bin:$PATH"
if command -v stripe &> /dev/null; then
    STRIPE_CMD=$(which stripe)
    echo "   ✅ Stripe CLI trouvé: $STRIPE_CMD"
    stripe --version
else
    echo "   ❌ Stripe CLI non trouvé dans PATH"
    exit 1
fi
echo ""

# Vérifier si Stripe CLI écoute
echo "2️⃣ Vérification processus Stripe CLI..."
if pgrep -fl "stripe listen" | grep -v grep > /dev/null; then
    echo "   ✅ Stripe CLI est lancé"
    pgrep -fl "stripe listen" | grep -v grep
else
    echo "   ❌ Stripe CLI n'est PAS lancé"
    echo "   💡 Lancez: stripe listen --forward-to localhost:3000/api/webhooks/stripe"
fi
echo ""

# Vérifier le serveur Next.js
echo "3️⃣ Vérification serveur Next.js..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "   ✅ Serveur Next.js actif sur port 3000"
else
    echo "   ❌ Serveur Next.js non actif sur port 3000"
    echo "   💡 Lancez: npm run dev"
fi
echo ""

# Vérifier .env.local
echo "4️⃣ Vérification variables d'environnement..."
if [ -f .env.local ]; then
    echo "   ✅ Fichier .env.local existe"
    
    if grep -q "STRIPE_SECRET_KEY=" .env.local; then
        echo "   ✅ STRIPE_SECRET_KEY présent"
    else
        echo "   ❌ STRIPE_SECRET_KEY manquant"
    fi
    
    if grep -q "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=" .env.local; then
        echo "   ✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY présent"
    else
        echo "   ❌ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY manquant"
    fi
    
    if grep -q "STRIPE_WEBHOOK_SECRET=" .env.local; then
        WEBHOOK_SECRET=$(grep "STRIPE_WEBHOOK_SECRET=" .env.local | cut -d'=' -f2)
        if [ -n "$WEBHOOK_SECRET" ] && [ "$WEBHOOK_SECRET" != "whsec_" ]; then
            echo "   ✅ STRIPE_WEBHOOK_SECRET présent"
            echo "   📝 Secret commence par: ${WEBHOOK_SECRET:0:10}..."
        else
            echo "   ⚠️  STRIPE_WEBHOOK_SECRET vide ou invalide"
        fi
    else
        echo "   ❌ STRIPE_WEBHOOK_SECRET manquant"
        echo "   💡 Copiez le secret depuis votre terminal Stripe CLI (whsec_...)"
    fi
else
    echo "   ❌ Fichier .env.local non trouvé"
fi
echo ""

# Test de connexion Stripe
echo "5️⃣ Test connexion Stripe..."
if stripe config --list &> /dev/null; then
    echo "   ✅ Stripe CLI est connecté"
    stripe config --list | head -3
else
    echo "   ❌ Stripe CLI n'est pas connecté"
    echo "   💡 Lancez: stripe login"
fi
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo "📋 PROCHAINES ÉTAPES"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Si tout est ✅, testez un paiement et regardez :"
echo ""
echo "1. Terminal Stripe CLI :"
echo "   → Devrait afficher: payment_intent.succeeded [evt_xxx] -> POST ... [200]"
echo ""
echo "2. Terminal serveur Next.js :"
echo "   → Devrait afficher: ✅ Webhook Stripe reçu: payment_intent.succeeded"
echo ""
echo "3. Console navigateur (F12) :"
echo "   → Devrait afficher: ✅ Payment Intent créé"
echo "   → Devrait afficher: ✅ Paiement confirmé"
echo ""
echo "═══════════════════════════════════════════════════════════════"
