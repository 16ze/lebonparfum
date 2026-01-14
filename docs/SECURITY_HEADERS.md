# 🔒 Headers de Sécurité HTTP

## Vue d'ensemble

Les headers de sécurité HTTP sont configurés dans [next.config.ts](../next.config.ts) et appliqués automatiquement à toutes les routes de l'application.

## Headers implémentés

### 1. X-Frame-Options: DENY

**Protection contre :** Clickjacking

```
X-Frame-Options: DENY
```

- Empêche l'application d'être chargée dans une iframe
- Protège contre les attaques de type clickjacking où un attaquant pourrait superposer un site malveillant
- Alternative : `SAMEORIGIN` (permet les iframes du même domaine)

**Exemples d'attaques bloquées :**
- Un site malveillant ne peut pas charger votre page de paiement dans une iframe invisible
- Impossible de tromper les utilisateurs en superposant des boutons malveillants

### 2. X-Content-Type-Options: nosniff

**Protection contre :** MIME type sniffing

```
X-Content-Type-Options: nosniff
```

- Force le navigateur à respecter le Content-Type déclaré
- Empêche l'exécution de scripts déguisés en images ou autres types de fichiers
- Critique pour éviter l'exécution de code malveillant

**Exemple d'attaque bloquée :**
- Upload d'un fichier `malware.jpg` contenant du JavaScript → le navigateur ne l'exécutera pas

### 3. Strict-Transport-Security (HSTS)

**Protection contre :** Downgrade attacks, Cookie hijacking

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

- `max-age=31536000` : Force HTTPS pendant 1 an (31536000 secondes)
- `includeSubDomains` : Applique aussi aux sous-domaines
- `preload` : Permet l'inscription dans la liste HSTS preload des navigateurs

**Important :**
- Active uniquement en production HTTPS
- En dev local (HTTP), ce header est ignoré par les navigateurs
- Inscription preload : [hstspreload.org](https://hstspreload.org/)

**Exemples d'attaques bloquées :**
- Man-in-the-middle tentant de forcer HTTP
- Vol de cookies non-secure sur réseau non sécurisé

### 4. Referrer-Policy

**Protection contre :** Fuites d'informations

```
Referrer-Policy: strict-origin-when-cross-origin
```

- **Same-origin :** Envoie l'URL complète (ex: `https://site.com/checkout?token=abc`)
- **Cross-origin HTTPS :** Envoie seulement l'origine (ex: `https://site.com`)
- **Cross-origin HTTP :** N'envoie rien

**Avantages :**
- Évite les fuites de tokens/IDs dans les paramètres d'URL
- Balance entre analytics et vie privée

### 5. Permissions-Policy

**Protection contre :** Abus de fonctionnalités du navigateur

```
Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
```

- `camera=()` : Désactive l'accès caméra
- `microphone=()` : Désactive l'accès micro
- `geolocation=()` : Désactive la géolocalisation
- `interest-cohort=()` : Désactive FLoC/Topics (tracking Google)

**Bénéfices :**
- Réduit la surface d'attaque
- Protège la vie privée des utilisateurs
- Limite les permissions de scripts tiers

### 6. Content-Security-Policy (CSP)

**Protection contre :** XSS, injection de code, exfiltration de données

C'est le header le plus puissant et complexe.

#### Configuration actuelle

```csp
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com;
style-src 'self' 'unsafe-inline';
img-src 'self' data: https://images.unsplash.com https://placehold.co https://*.supabase.co;
font-src 'self' data:;
connect-src 'self' https://*.supabase.co https://api.stripe.com https://*.upstash.io wss://*.supabase.co;
frame-src 'self' https://js.stripe.com https://hooks.stripe.com;
base-uri 'self';
form-action 'self';
object-src 'none';
upgrade-insecure-requests
```

#### Détail des directives

**script-src** (Sources de scripts JavaScript)
- `'self'` : Scripts du même domaine
- `'unsafe-inline'` : Scripts inline `<script>` (requis pour Next.js)
- `'unsafe-eval'` : `eval()` et fonctions similaires (requis pour dev Next.js)
- `https://js.stripe.com` : SDK Stripe

⚠️ **Note :** `unsafe-inline` et `unsafe-eval` réduisent la sécurité. En production stricte, utiliser des nonces ou hashes.

**style-src** (Sources de styles CSS)
- `'self'` : CSS du même domaine
- `'unsafe-inline'` : Styles inline (requis pour Tailwind)

**img-src** (Sources d'images)
- `'self'` : Images du même domaine
- `data:` : Data URIs (images inline base64)
- `https://images.unsplash.com` : Images Unsplash
- `https://placehold.co` : Placeholders
- `https://*.supabase.co` : Stockage Supabase

**font-src** (Sources de polices)
- `'self'` : Polices du même domaine
- `data:` : Polices inline

**connect-src** (Connexions fetch/XHR/WebSocket)
- `'self'` : API du même domaine
- `https://*.supabase.co` : API Supabase
- `https://api.stripe.com` : API Stripe
- `https://*.upstash.io` : Redis Upstash (rate limiting)
- `wss://*.supabase.co` : WebSocket Supabase (real-time)

**frame-src** (Sources de frames/iframes)
- `'self'` : Iframes du même domaine
- `https://js.stripe.com` : Checkout Stripe
- `https://hooks.stripe.com` : Webhooks Stripe

**Autres directives**
- `base-uri 'self'` : Limite les URLs de base
- `form-action 'self'` : Les formulaires ne peuvent cibler que le même domaine
- `object-src 'none'` : Interdit Flash, Java applets, etc.
- `upgrade-insecure-requests` : Force la mise à niveau HTTP → HTTPS

## Test des Headers

### Méthode 1 : cURL (ligne de commande)

```bash
curl -I https://votresite.com
```

Cherchez les headers `X-Frame-Options`, `Content-Security-Policy`, etc.

### Méthode 2 : Navigateur DevTools

1. Ouvrir DevTools (F12)
2. Onglet **Network**
3. Recharger la page
4. Cliquer sur la requête principale
5. Onglet **Headers** → voir les Response Headers

### Méthode 3 : Outils en ligne

- [securityheaders.com](https://securityheaders.com/) - Score A+ visé
- [Mozilla Observatory](https://observatory.mozilla.org/)
- [Hardenize](https://www.hardenize.com/)

## Score de Sécurité Attendu

Avec cette configuration :

| Outil | Score attendu |
|-------|---------------|
| SecurityHeaders.com | **A** |
| Mozilla Observatory | **B+** à **A-** |
| Qualys SSL Labs | **A** (avec HTTPS configuré) |

## Avertissements CSP en Dev

En développement local, vous pourriez voir des erreurs CSP dans la console :

```
Refused to execute inline script because it violates CSP directive
```

**C'est normal** si :
- Vous utilisez des extensions de navigateur
- Vous testez du code tiers non autorisé
- Le hot reload Next.js génère du code inline

**Solutions :**
1. Ajouter `'unsafe-inline'` temporairement (déjà fait)
2. Utiliser des nonces pour Next.js (configuration avancée)
3. Ignorer les warnings en dev, tester en production

## Amélioration Future : CSP avec Nonces

Pour une sécurité maximale, remplacer `'unsafe-inline'` par des nonces :

```typescript
// Exemple (non implémenté)
const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

headers: {
  'Content-Security-Policy': `script-src 'self' 'nonce-${nonce}'`
}
```

Cela nécessite :
- Génération de nonce par requête
- Injection du nonce dans chaque `<script>` tag
- Configuration Next.js avancée

## Compatibilité Navigateurs

| Header | Chrome | Firefox | Safari | Edge |
|--------|--------|---------|--------|------|
| X-Frame-Options | ✅ | ✅ | ✅ | ✅ |
| X-Content-Type-Options | ✅ | ✅ | ✅ | ✅ |
| HSTS | ✅ | ✅ | ✅ | ✅ |
| Referrer-Policy | ✅ | ✅ | ✅ | ✅ |
| Permissions-Policy | ✅ | ✅ | ⚠️ Partiel | ✅ |
| CSP | ✅ | ✅ | ✅ | ✅ |

## Déploiement Production

### Vercel

Les headers sont automatiquement appliqués via `next.config.ts`.

**Vérification :**
```bash
curl -I https://votre-app.vercel.app
```

### Variables d'environnement

Aucune variable d'environnement n'est requise pour les headers de sécurité.

### HTTPS Obligatoire

⚠️ **HSTS ne fonctionne qu'en HTTPS**

Assurez-vous que :
1. Vercel fournit HTTPS automatiquement (certificate SSL)
2. Redirection HTTP → HTTPS activée
3. Domaine custom configuré avec HTTPS

## Monitoring

### Vérifier régulièrement

- [ ] Mensuel : Test sur [securityheaders.com](https://securityheaders.com/)
- [ ] Après déploiement : Vérifier les headers avec cURL
- [ ] Après ajout de domaine tiers : Mettre à jour CSP

### Logs CSP (Production)

Pour monitorer les violations CSP en production, ajouter :

```typescript
'Content-Security-Policy': '...; report-uri https://votre-endpoint.com/csp-report'
```

Ou utiliser un service comme :
- [Report URI](https://report-uri.com/)
- [Sentry](https://sentry.io/) (CSP reporting intégré)

## Dépannage

### Problème : Stripe ne charge pas

**Symptôme :** Erreur CSP bloquant Stripe

**Solution :** Vérifier que CSP contient :
```
script-src https://js.stripe.com;
frame-src https://js.stripe.com https://hooks.stripe.com;
connect-src https://api.stripe.com;
```

### Problème : Images Supabase bloquées

**Symptôme :** Images de produits ne s'affichent pas

**Solution :** Vérifier que CSP contient :
```
img-src https://*.supabase.co;
```

### Problème : WebSocket Supabase échoue

**Symptôme :** Fonctionnalités temps réel ne marchent pas

**Solution :** Vérifier que CSP contient :
```
connect-src wss://*.supabase.co;
```

## Ressources

- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Content Security Policy Reference](https://content-security-policy.com/)
- [Can I Use - Browser Support](https://caniuse.com/)

## Checklist Pré-Production

- [x] Headers configurés dans next.config.ts
- [x] Test local réussi (tous les headers présents)
- [ ] Test sur environnement de staging
- [ ] Score A sur securityheaders.com
- [ ] Aucune erreur CSP bloquante en production
- [ ] Stripe fonctionne correctement
- [ ] Images Supabase chargent
- [ ] WebSocket Supabase connecte
