# 🔒 Configuration du Rate Limiting avec Upstash Redis

## Vue d'ensemble

Le rate limiting protège votre application contre :
- **Attaques par force brute** (login, password reset)
- **Abus d'API** (scraping, spam)
- **Déni de service** (DoS)

## Limites configurées

| Route Type | Limite | Période | Protection |
|------------|--------|---------|------------|
| `/api/auth/*` | 5 requêtes | 15 minutes | Brute force login |
| `/api/admin/*` | 20 requêtes | 1 minute | Abus admin |
| `/api/*` | 30 requêtes | 1 minute | Abus API générale |
| Routes publiques | 100 requêtes | 1 minute | Scraping |

## Configuration Upstash Redis

### 1. Créer un compte Upstash

1. Aller sur [https://console.upstash.com/](https://console.upstash.com/)
2. Se connecter avec GitHub ou créer un compte
3. Le plan gratuit offre **10,000 commandes/jour** (largement suffisant)

### 2. Créer une base de données Redis

1. Dans la console Upstash, cliquer sur **"Create Database"**
2. Configurer :
   - **Name** : `lebonparfum-rate-limit`
   - **Region** : Choisir la région la plus proche de votre serveur
     - Pour Vercel (Europe) : `eu-west-1` (Ireland)
     - Pour Vercel (US) : `us-east-1` (Virginia)
   - **Type** : `Regional` (gratuit)
   - **Eviction** : `allkeys-lru` (recommandé)
3. Cliquer sur **"Create"**

### 3. Récupérer les credentials

1. Dans la page de votre base de données, aller à l'onglet **"REST API"**
2. Copier les valeurs suivantes :
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

### 4. Ajouter les variables d'environnement

#### Développement local (`.env.local`)

```bash
# Upstash Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here
```

#### Production (Vercel)

1. Aller dans **Settings > Environment Variables**
2. Ajouter :
   - `UPSTASH_REDIS_REST_URL` = `https://your-database.upstash.io`
   - `UPSTASH_REDIS_REST_TOKEN` = `your_token_here`
3. Cocher **Production, Preview, Development**
4. Redéployer l'application

## Test du Rate Limiting

### Méthode 1 : Script automatique

```bash
# Tester route admin (limite : 20 req/min)
./scripts/test-rate-limit.sh http://localhost:3000/api/admin/products 25

# Tester route auth (limite : 5 req/15min)
./scripts/test-rate-limit.sh http://localhost:3000/api/auth/callback 10
```

### Méthode 2 : Manuel avec curl

```bash
# Envoyer 25 requêtes rapidement
for i in {1..25}; do
  curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/admin/products
  sleep 0.1
done
```

**Résultat attendu :**
- Premières 20 requêtes : `200` ou `401` (success)
- Requêtes 21-25 : `429` (rate limited)

### Méthode 3 : Depuis le navigateur

1. Ouvrir la console DevTools (`F12`)
2. Exécuter ce script :

```javascript
async function testRateLimit() {
  const results = { success: 0, rateLimited: 0 };

  for (let i = 0; i < 25; i++) {
    const response = await fetch('/api/admin/products');
    if (response.status === 429) {
      results.rateLimited++;
      console.log(`❌ Requête ${i + 1}: RATE LIMITED`);

      // Afficher headers
      console.log('Retry-After:', response.headers.get('Retry-After'));
      console.log('X-RateLimit-Reset:', response.headers.get('X-RateLimit-Reset'));
    } else {
      results.success++;
      console.log(`✅ Requête ${i + 1}: SUCCESS (${response.status})`);
    }

    await new Promise(r => setTimeout(r, 100));
  }

  console.log('\n📊 RÉSULTATS:', results);
}

testRateLimit();
```

## Monitoring

### Vérifier dans Upstash Console

1. Aller dans **Details > Metrics**
2. Observer :
   - **Daily Requests** : nombre total de vérifications
   - **Database Size** : mémoire utilisée (devrait rester faible)
   - **Throughput** : pics de trafic

### Vérifier les logs Vercel (Production)

```bash
vercel logs --follow
```

Rechercher :
- `🚨 Rate limit dépassé` : limite atteinte
- `⚠️  Rate limiting désactivé` : Upstash mal configuré

## Headers de Rate Limiting

Chaque réponse inclut ces headers (RFC standard) :

```http
X-RateLimit-Limit: 20          # Limite totale
X-RateLimit-Remaining: 15      # Requêtes restantes
X-RateLimit-Reset: 2026-01-10T14:23:00.000Z  # Reset timestamp
Retry-After: 45                 # Secondes avant retry (si 429)
```

## Personnalisation

### Modifier les limites

Éditer [lib/rate-limit.ts](../lib/rate-limit.ts):

```typescript
// Exemple : passer auth de 5/15min à 10/15min
export const authRateLimit = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(10, "15 m"),  // ← Modifier ici
      analytics: true,
      prefix: "@ratelimit/auth",
    })
  : null;
```

### Exclure certaines routes

Éditer [middleware.ts](../middleware.ts):

```typescript
export const config = {
  matcher: [
    // Ajouter des exclusions :
    "/((?!_next/static|_next/image|favicon.ico|api/webhook|.*\\.(?:svg|png)$).*)",
    //                                          ↑ Exclure /api/webhook
  ],
};
```

## Dépannage

### ⚠️  "Rate limiting désactivé"

**Cause :** Variables d'environnement Upstash manquantes

**Solution :**
1. Vérifier `.env.local` contient bien `UPSTASH_REDIS_REST_URL` et `UPSTASH_REDIS_REST_TOKEN`
2. Redémarrer le serveur Next.js : `npm run dev`

### ❌ "Erreur rate limiting"

**Cause :** Problème de connexion Redis

**Solution :**
1. Vérifier que l'URL et le token sont corrects
2. Tester la connexion depuis Upstash Console > **REST API > Try it**
3. Vérifier que la base Redis est active (pas en pause)

### 🐌 Rate limit jamais atteint en test

**Cause :** Identifier client mal détecté (toujours "development-ip")

**Solution :**
- En dev local, c'est normal (pas de proxy)
- En production, Vercel/Cloudflare injecte `x-forwarded-for`
- Pour forcer en local, modifier `getClientIdentifier()` :

```typescript
return Math.random().toString(); // Chaque requête = nouvelle IP
```

## Coûts

### Plan Gratuit Upstash

- ✅ **10,000 commandes/jour**
- ✅ **256 MB de stockage**
- ✅ Largement suffisant pour < 500 utilisateurs/jour

### Estimation usage

| Trafic quotidien | Commandes Redis | Plan requis |
|------------------|-----------------|-------------|
| 100 visiteurs | ~1,000 | Gratuit |
| 500 visiteurs | ~5,000 | Gratuit |
| 2,000 visiteurs | ~20,000 | Pay-as-you-go ($0.2/10k) |

**Note :** Chaque vérification = 1 commande. Le middleware vérifie toutes les requêtes.

## Sécurité

### Protection multi-couches

1. **Rate Limiting** (Upstash) ← vous êtes ici
2. **Authentication** (Supabase RLS)
3. **CSRF Protection** (à implémenter)
4. **Input Validation** (Zod schemas)

### Contournement possible

⚠️ Un attaquant peut contourner le rate limiting basé sur IP avec :
- **VPN / Proxy rotation**
- **Botnet distribué**

**Solutions avancées (si nécessaire) :**
- Rate limiting par **user ID** (après login)
- CAPTCHA sur auth après 3 échecs
- Fingerprinting navigateur (canvas, WebGL, etc.)

## Ressources

- [Documentation Upstash Redis](https://docs.upstash.com/redis)
- [Documentation @upstash/ratelimit](https://github.com/upstash/ratelimit)
- [RFC 6585 - HTTP 429](https://tools.ietf.org/html/rfc6585#section-4)
- [Vercel Edge Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
