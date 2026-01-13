#!/bin/bash

# Script de test pour le Rate Limiting
# Usage: ./scripts/test-rate-limit.sh [url] [requests]

URL="${1:-http://localhost:3000/api/admin/products}"
REQUESTS="${2:-25}"

echo "🧪 Test Rate Limiting"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "URL: $URL"
echo "Nombre de requêtes: $REQUESTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

SUCCESS_COUNT=0
RATE_LIMITED_COUNT=0

for i in $(seq 1 $REQUESTS); do
  RESPONSE=$(curl -s -w "\n%{http_code}" "$URL")
  STATUS_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | head -n-1)

  if [ "$STATUS_CODE" == "429" ]; then
    RATE_LIMITED_COUNT=$((RATE_LIMITED_COUNT + 1))
    echo "❌ Requête $i: RATE LIMIT (429)"

    # Afficher les headers de rate limiting si possible
    RETRY_AFTER=$(curl -s -I "$URL" | grep -i "retry-after" | cut -d' ' -f2)
    if [ ! -z "$RETRY_AFTER" ]; then
      echo "   ⏳ Retry After: ${RETRY_AFTER}s"
    fi
  else
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    echo "✅ Requête $i: SUCCESS ($STATUS_CODE)"
  fi

  # Petit délai pour ne pas surcharger
  sleep 0.1
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RÉSULTATS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Succès: $SUCCESS_COUNT"
echo "❌ Rate Limited: $RATE_LIMITED_COUNT"
echo ""

if [ $RATE_LIMITED_COUNT -gt 0 ]; then
  echo "✨ Rate limiting fonctionne correctement!"
else
  echo "⚠️  Aucune limite atteinte - vérifiez la configuration Upstash"
fi
