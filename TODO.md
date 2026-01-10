# 📊 DASHBOARD PROJET - TODO

**Stack Technique**
- Frontend: Next.js 15 + TypeScript + Tailwind
- Backend: Supabase (PostgreSQL + Auth + Storage)
- Paiement: Stripe
- Hébergement: Vercel (à déployer)

**Status Général**: 🟡 92% terminé - Phase de sécurisation

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
- [ ] Ajouter rate limiting (Upstash Redis)
- [ ] Vérifier authentification sur toutes les routes /api/admin/*
- [ ] Implémenter CSRF protection
- [ ] Logs des erreurs avec Sentry

### 2. Sécurité Supabase
- [ ] Activer RLS (Row Level Security) sur toutes les tables
- [ ] Auditer les policies Supabase
- [ ] Révoquer clés API publiques inutilisées
- [ ] Configurer IP allowlist (production)

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

## Issues Connues
- Aucune issue bloquante détectée
- Flux de paiement opérationnel
- À nettoyer: logs console avant production

---

**Temps estimé pour finir**: 3-4 jours de dev concentré
**Dernière mise à jour**: 10 Janvier 2026
