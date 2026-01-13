# 📊 DASHBOARD PROJET - TODO

**Stack Technique**
- Frontend: Next.js 15 + TypeScript + Tailwind
- Backend: Supabase (PostgreSQL + Auth + Storage)
- Paiement: Stripe
- Hébergement: Vercel (à déployer)

**Status Général**: 🟡 94% terminé - Phase de sécurisation

**GitHub**: https://github.com/16ze/lebonparfum

---

# ✅ TERMINÉ RÉCEMMENT (Janvier 2026)

## Diagnostic & Debugging Stripe
- [x] Ajout logs détaillés API create-payment-intent
- [x] Ajout logs détaillés Frontend checkout
- [x] Test connexion Stripe avec curl
- [x] Vérification variables d'environnement
- [x] Confirmation webhooks Stripe fonctionnels
- [x] Documentation flux de paiement complet

## UI/UX Corrections
- [x] Correction effet rideau section Showcase
- [x] Section Showcase scroll normal (plus de sticky)
- [x] Ajustement padding vertical Showcase (style Byredo)

## Système de Catégories & Tags (10 Jan 2026)
- [x] Création interfaces admin pour Catégories
- [x] Création interfaces admin pour Tags
- [x] Assignation catégories/tags aux produits (formulaire admin)
- [x] Affichage catégories/tags sur page produit publique
- [x] Pages de résultats par catégorie (`/category/[slug]`)
- [x] Pages de résultats par tag (`/tag/[slug]`)
- [x] Navigation cliquable (catégories et tags → pages de filtrage)
- [x] Badges stylisés (noir pour catégories, bordure pour tags)
- [x] Tables pivot many-to-many (product_categories, product_tags)

## Rate Limiting avec Upstash Redis (10 Jan 2026)
- [x] Installation packages @upstash/ratelimit + @upstash/redis
- [x] Configuration lib/rate-limit.ts (4 tiers de protection)
- [x] Middleware Next.js pour application globale
- [x] Headers RFC standard (X-RateLimit-*, Retry-After)
- [x] Documentation complète (docs/RATE_LIMITING_SETUP.md)
- [x] Script de test automatique (scripts/test-rate-limit.sh)
- [x] Variables d'environnement (.env.local.example)
- [x] Configuration compte Upstash (eminent-horse-27385)
- [x] Tests locaux validés (auth: 5/15min, admin: 20/min, public: 100/min)
- [ ] Tests en production avec vraies requêtes

---

# 🔒 SÉCURITÉ (PRIORITÉ HAUTE)

## ✅ Déjà fait
- [x] Authentification Supabase
- [x] Stripe webhook signature verification
- [x] Variables d'environnement
- [x] Validation prix côté serveur (sécurité paiement)
- [x] Logs détaillés pour audit

## 🔴 À FAIRE URGENT

### 1. Protection des API Routes
- [x] Ajouter rate limiting (Upstash Redis)
- [ ] Vérifier authentification sur toutes les routes /api/admin/*
- [ ] Implémenter CSRF protection
- [ ] Logs des erreurs avec Sentry

### 2. Sécurité Supabase
- [x] Activer RLS (Row Level Security) sur toutes les tables
- [x] Auditer les policies Supabase
- [x] Révoquer clés API publiques inutilisées


### 3. Protection Stripe
- [x] Vérifier signature webhook en prod
- [x] Tester webhooks en environnement local
- [ ] Configurer webhook endpoint en HTTPS uniquement
- [ ] Limiter retry automatique webhooks

### 4. Headers de sécurité
- [ ] Content Security Policy (CSP)
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] Strict-Transport-Security (HSTS)

### 5. Validation des données
- [x] Valider inputs utilisateur côté serveur (paiement)
- [ ] Valider inputs utilisateur (zod schema global)
- [ ] Sanitize HTML dans descriptions produits
- [ ] Limiter taille upload images (max 5MB)
- [ ] Vérifier extension fichiers uploadés

---

# 🚀 OPTIMISATION PERFORMANCE

## 🟡 Moyenne priorité

### 1. Images
- [ ] Optimiser toutes les images (WebP + lazy loading)
- [ ] Utiliser Next.js Image component partout
- [ ] Ajouter blur placeholder
- [ ] CDN pour images statiques (Cloudflare)

### 2. Code
- [ ] Tree-shaking des dépendances inutilisées
- [ ] Code splitting dynamique (React.lazy)
- [ ] Minification JS/CSS en prod
- [x] Logs console détaillés (à nettoyer pour prod)
- [ ] Supprimer console.log en production

### 3. Base de données
- [ ] Indexer colonnes fréquemment requêtées
- [ ] Query optimization (éviter N+1)
- [ ] Ajouter pagination sur listes produits
- [ ] Cache Supabase queries (React Query)

### 4. SEO
- [ ] Ajouter metadata pages (title, description)
- [ ] Générer sitemap.xml
- [ ] Robots.txt
- [ ] Schema.org markup (produits)
- [ ] Open Graph images

---

# 📧 NOTIFICATIONS (NOUVELLE FEATURE)

## 🟢 Basse priorité (addon)

### Email Resend (2-3h)
- [ ] Installer Resend
- [ ] Email nouvelle commande → admin
- [ ] Email confirmation commande → client
- [ ] Email expédition → client
- [ ] Template email branded

### SMS Twilio (optionnel)
- [ ] Setup compte Twilio
- [ ] SMS nouvelle commande → admin
- [ ] Config numéro France

---

# 🎨 FINALISATION UX/UI

## 🟡 Moyenne priorité

### 1. Expérience utilisateur
- [x] Loading states sur checkout
- [ ] Loading states sur tous les boutons
- [ ] Animations micro-interactions
- [x] Toast notifications checkout (succès/erreur)
- [ ] Page 404 custom
- [ ] Page 500 custom

### 2. Accessibilité (A11Y)
- [ ] Aria labels sur éléments interactifs
- [ ] Navigation clavier
- [ ] Contraste couleurs WCAG AA
- [ ] Screen reader friendly

### 3. Mobile
- [ ] Tester toutes pages sur mobile
- [ ] Menu burger responsive
- [x] Checkout mobile optimisé
- [ ] Touch targets 44x44px minimum

---

# 🧪 TESTS & QA

## 🔴 À FAIRE URGENT

### 1. Tests fonctionnels
- [x] Parcours complet achat (E2E) - diagnostic fait
- [ ] Tester tous les cas d'erreur Stripe
- [ ] Vérifier emails confirmation Supabase
- [ ] Tester avec vraie carte bancaire (mode test)

### 2. Tests sécurité
- [ ] Injection SQL tentative
- [ ] XSS dans formulaires
- [ ] CSRF sur actions sensibles
- [ ] Brute force login (rate limit)

### 3. Tests performance
- [ ] Lighthouse audit (score >90)
- [ ] WebPageTest
- [ ] Tester avec 3G throttling
- [ ] Vérifier bundle size (<300KB)

---

# 🌍 DÉPLOIEMENT PRODUCTION

## 🔴 CRITIQUE (avant mise en ligne)

### 1. Configuration Vercel
- [ ] Déployer sur Vercel
- [ ] Variables environnement prod
- [ ] Custom domain
- [ ] SSL/TLS certificate (auto)

### 2. Configuration Supabase
- [ ] Projet Supabase production
- [ ] Backup automatique activé
- [ ] Point-in-time recovery
- [ ] Monitoring alertes

### 3. Configuration Stripe
- [ ] Passer en mode live
- [ ] Configurer webhooks prod URL
- [ ] Activer 3D Secure (SCA)
- [ ] Configurer disputes/chargebacks

### 4. Monitoring
- [ ] Setup Sentry (error tracking)
- [ ] Setup Vercel Analytics
- [ ] Google Analytics / Plausible
- [ ] Uptime monitoring (UptimeRobot)

---

# 📚 DOCUMENTATION

## 🟢 Basse priorité
- [ ] README.md complet
- [ ] Guide d'installation dev
- [x] Documentation flux paiement (logs détaillés)
- [ ] Documentation API endpoints
- [ ] Guide admin (comment gérer produits)
- [ ] Procédure backup/restore
- [ ] Plan de reprise après incident

---

# 💰 BUSINESS / LÉGAL

## 🔴 OBLIGATOIRE
- [ ] CGV (Conditions Générales de Vente)
- [ ] Mentions légales
- [ ] Politique confidentialité (RGPD)
- [ ] Politique cookies
- [ ] Page retours/remboursements
- [ ] Contact/support

---

# 📋 CHECKLIST PRÉ-LANCEMENT

## Avant de montrer au client
- [x] Toutes features fonctionnent
- [x] 0 erreur console bloquante
- [x] Design responsive (checkout OK)
- [ ] Sécurité niveau production
- [ ] Performance optimale
- [ ] Documentation complète

## Avant mise en ligne
- [ ] Tests achat complet OK
- [ ] Stripe en mode live
- [ ] Domain custom configuré
- [ ] Monitoring actif
- [ ] Backup automatique
- [ ] Plan incident documenté

---

# 🎯 PRIORITÉS CETTE SEMAINE

## Jour 1-2
1. ✅ Diagnostic flux paiement Stripe (FAIT)
2. ✅ Correction UI Showcase (FAIT)
3. Sécurité API Routes + RLS
4. Headers sécurité
5. Rate limiting

## Jour 3-4
1. Tests E2E complets
2. Fix bugs découverts
3. Optimisation images

## Jour 5
1. Email Resend
2. Pages légales
3. Prep déploiement

---

# 💡 PROCHAINES FEATURES (POST-LANCEMENT)

- [ ] Système avis clients
- [ ] Programme fidélité
- [ ] Wishlist
- [ ] Comparateur parfums
- [ ] Blog content marketing
- [ ] Multi-langue (EN)

---

# 🔍 NOTES TECHNIQUES RÉCENTES

## Diagnostic Stripe (10 Jan 2026)
- Infrastructure Stripe 100% fonctionnelle
- API create-payment-intent validée avec curl
- Webhooks reçus et traités (200 OK)
- Logs complets ajoutés pour debugging futur
- Produits testés: coco-vanille-mancera, creme-brulee-khalil, etc.

## Système Catégories & Tags (10 Jan 2026)
- Architecture many-to-many complète via tables pivot
- Admin CRUD complet pour catégories et tags
- Formulaire produit avec multi-select (badges cliquables)
- Pages publiques de filtrage (`/category/[slug]`, `/tag/[slug]`)
- Navigation cliquable depuis les fiches produits
- SEO: generateStaticParams pour pré-génération au build
- Style Byredo: catégories (noir), tags (bordure)
- Fichiers créés:
  - `app/category/[slug]/page.tsx`
  - `app/tag/[slug]/page.tsx`
  - `app/admin/categories/` (page + actions + modals + tables)
  - `app/admin/tags/` (page + actions + modals + tables)
  - Modifications: ProductModal, ProductInfo, ProductsTable

## Rate Limiting Upstash (10 Jan 2026)
- Protection multi-niveaux contre brute force et abus d'API
- 4 tiers de rate limiting configurés:
  - Auth routes: 5 req/15min (protection login)
  - Admin routes: 20 req/min
  - API routes: 30 req/min
  - Public routes: 100 req/min
- Middleware Next.js appliqué globalement
- Headers RFC standard (X-RateLimit-*, Retry-After)
- Sliding window algorithm pour précision maximale
- Fail-open en cas d'erreur Redis (disponibilité > sécurité)
- Analytics Upstash intégrées pour monitoring
- Tests locaux réussis:
  - Auth: 5 requêtes passées, 6-10 bloquées (429)
  - Admin: 20 requêtes passées, 21-25 bloquées (429)
  - Public: toutes requêtes passées (limite 100/min)
  - Headers conformes (x-ratelimit-*, retry-after)
- Base Redis Upstash: eminent-horse-27385 (Ireland)
- Fichiers créés:
  - `lib/rate-limit.ts` (configuration Upstash)
  - `middleware.ts` (Next.js Edge Middleware)
  - `docs/RATE_LIMITING_SETUP.md` (documentation complète)
  - `scripts/test-rate-limit.sh` (tests automatiques)
  - `.env.local.example` (variables Upstash)

## Issues Connues
- Aucune issue bloquante détectée
- Flux de paiement opérationnel
- Système de catégories/tags opérationnel
- À nettoyer: logs console avant production

---

**Temps estimé pour finir**: 3-4 jours de dev concentré
**Dernière mise à jour**: 10 Janvier 2026
