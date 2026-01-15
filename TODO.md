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
- [x] Headers RFC standard (X-RateLimit-\*, Retry-After)
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
- [x] Vérifier authentification sur toutes les Server Actions admin
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

- [x] Content Security Policy (CSP)
- [x] X-Frame-Options: DENY
- [x] X-Content-Type-Options: nosniff
- [x] Strict-Transport-Security (HSTS)
- [x] Referrer-Policy
- [x] Permissions-Policy

### 5. Validation des données

- [x] Valider inputs utilisateur côté serveur (paiement)
- [x] Valider inputs utilisateur (zod schema global)
- [x] Sanitize HTML dans descriptions produits
- [x] Limiter taille upload images (max 5MB)
- [x] Vérifier extension fichiers uploadés

**Implémentation complète:**

- `lib/validation.ts` créé avec schémas Zod (produits, catégories, tags)
- Sanitization HTML avec DOMPurify (balises sécurisées uniquement)
- Validation taille images: max 5MB
- Validation extensions: .jpg, .jpeg, .png, .webp, .gif
- Validation types MIME
- Intégration dans toutes les Server Actions:
  - `app/admin/products/actions.ts` (createProduct, updateProduct)
  - `app/admin/categories/actions.ts` (createCategory, updateCategory)
  - `app/admin/tags/actions.ts` (createTag, updateTag)
- Configuration DOMPurify: balises autorisées (p, strong, em, ul, ol, li, a, h1-h6)
- Messages d'erreur détaillés pour chaque type de validation

---

# 🚀 OPTIMISATION PERFORMANCE

## 🟡 Moyenne priorité

### 1. Images

- [x] Optimiser toutes les images (WebP + lazy loading)
- [x] Utiliser Next.js Image component partout
- [x] Ajouter blur placeholder
- [ ] CDN pour images statiques (Cloudflare)

**Implémentation complète:**

- `lib/image-placeholders.ts` créé avec placeholders blur optimisés
- Remplacé dernière balise `<img>` par `<Image>` (WishlistGrid.tsx)
- Ajouté `placeholder="blur"` + `blurDataURL` à tous les composants:
  - ProductCard, ProductGallery (4 instances)
  - WishlistGrid, CategoryCard
  - CheckoutSummary
  - Showcase (4 instances), HighlightSection
  - ImageUpload (admin)
- Next.js Image optimise automatiquement en WebP
- Lazy loading automatique (sauf `priority={true}`)
- `quality={90}` pour images produits/lifestyle
- Attributs `sizes` responsive sur tous les images
- Total: 19 composants Image optimisés

### 2. Code

- [x] Tree-shaking des dépendances inutilisées
- [x] Code splitting dynamique (React.lazy)
- [x] Minification JS/CSS en prod
- [x] Logs console détaillés (à nettoyer pour prod)
- [x] Supprimer console.log en production

**Implémentation complète:**

- Tree-shaking: Automatique avec Next.js 15 + ES modules
- Code splitting: Automatique par route (Next.js App Router)
- Minification: SWC minifier activé automatiquement en production
- Console.log: Configuration `compiler.removeConsole` dans next.config.ts
  - Supprime automatiquement console.log/info/debug en production
  - Conserve console.error et console.warn pour monitoring
  - 341 console statements traités automatiquement
- Images: 23 composants optimisés avec Next.js Image (WebP, lazy loading, blur)

### 3. Base de données

- [x] Indexer colonnes fréquemment requêtées
- [x] Query optimization (éviter N+1)
- [x] Ajouter pagination sur listes produits
- [ ] Cache Supabase queries (React Query)

**Implémentation complète:**

**Indexes créés** (`supabase/migrations/20260114_add_performance_indexes.sql`):

- Slug indexes: products, categories, tags (13 requêtes optimisées)
- User_id indexes: profiles, wishlist, addresses, notifications, orders (14 requêtes)
- Product_id indexes: product_categories, product_tags, wishlist (8 requêtes)
- Indexes composites: wishlist(user_id, product_id) UNIQUE
- Indexes de tri: created_at, name, price, stock
- Full-text search: pg_trgm sur name et brand pour recherche fuzzy
- Index partiel: stock WHERE stock > 0 (optimisation mémoire)

**Pagination système**:

- Composant UI: `components/ui/Pagination.tsx` (style Byredo)
- Helpers: `lib/pagination.ts` (calculs, validation, Supabase ranges)
- Features: URL-based, SEO-friendly, ellipsis, responsive
- Configuration: 12 items/page (divisible par 2/3/4 pour grids)

**Query optimization**:

- Indexes sur toutes les foreign keys
- ANALYZE automatique pour statistiques optimiseur
- Prévention N+1 avec indexes sur relations many-to-many

### 4. SEO

- [x] Ajouter metadata pages (title, description)
- [x] Générer sitemap.xml
- [x] Robots.txt
- [x] Schema.org markup (produits)
- [x] Open Graph images dynamiques

**Implémentation complète Phase 1 - SEO Dynamique:**

**Metadata système** (`lib/metadata.ts`):
- SITE_CONFIG centralisé (nom, URL, description, réseaux sociaux)
- DEFAULT_METADATA pour toutes les pages (OpenGraph, Twitter Cards, robots)
- generateProductMetadata(): Génère métadonnées complètes produits
- generateCategoryMetadata(): Génère métadonnées catégories
- generateProductSchema(): JSON-LD Schema.org Product
- generateOrganizationSchema(): JSON-LD Schema.org Organization
- generateWebSiteSchema(): JSON-LD Schema.org WebSite avec SearchAction
- generateCollectionSchema(): JSON-LD Schema.org CollectionPage
- generateCategorySchema(): JSON-LD Schema.org pour catégories

**Robots.txt** (`public/robots.txt`):
- Allow: /, /product/, /category/, /tag/, /collections/
- Disallow: /api/, /admin/, /account/, /checkout/, /_next/
- Block bad bots: AhrefsBot, SemrushBot, MJ12bot, DotBot
- Sitemap référencé: https://lebonparfum.com/sitemap.xml

**Sitemap dynamique** (`app/sitemap.ts`):
- Pages statiques: home, collections (priority 1.0 et 0.8)
- Pages dynamiques: products, categories, tags (depuis Supabase)
- ISR avec revalidate: 86400s (24h)
- Métadonnées: lastModified, changeFrequency, priority

**Schema.org intégré** (`app/product/[slug]/page.tsx`):
- JSON-LD Product schema avec offer, availability, price
- JSON-LD Organization schema (coordonnées entreprise)
- Intégration via <script type="application/ld+json">

**Open Graph images dynamiques**:
- `app/opengraph-image.tsx` + `app/twitter-image.tsx` (homepage)
- `app/product/[slug]/opengraph-image.tsx` + `twitter-image.tsx` (produits)
- Génération Edge Runtime avec Next.js ImageResponse
- Style Byredo: fond blanc, texte noir, typographie géométrique
- Format: 1200x630px (standard OG/Twitter)
- Contenu produit: marque, nom, prix formaté

**Pages intégrées**:
- ✅ Pages produits: metadata complètes + Schema.org + OG images
- ⏳ À faire Phase 2: Ajouter champs SEO personnalisables en DB

### 5. SEO Avancé - Phase 2 (En attente)

- [ ] Migration DB: Ajouter colonnes meta_title, meta_description, seo_keywords
- [ ] ProductForm: Section "Référencement" avec champs SEO personnalisables
- [ ] Fonction generateSlug() pour auto-génération slugs
- [ ] Validation Zod: slug unique, regex ^[a-z0-9-]+$
- [ ] Intégration: Utiliser champs custom si remplis, sinon fallback sur valeurs auto

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
- [x] Loading states sur tous les boutons (composant Button créé, à migrer progressivement)
- [x] Animations micro-interactions (transitions globales CSS + composant Button)
- [x] Toast notifications checkout (succès/erreur)
- [x] Page 404 custom
- [x] Page 500 custom
- [x] ProfileDrawer la déconnexion. quand on clique sur déconnecter le statut est bien deconnecter mais le profile drawer montre encore un état connecter il faut corriger cela. Quand on clique sur deconnexion le profile drawer doit montrer un etat deconnecter et afficher le login pour la connexion

### 2. Accessibilité (A11Y)

- [ ] Aria labels sur éléments interactifs
- [ ] Navigation clavier
- [ ] Contraste couleurs WCAG AA
- [ ] Screen reader friendly

### 3. Mobile

- [ ] Tester toutes pages sur mobile
- [ ] Menu burger responsive
- [ ] sidebar coter admin responsive
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
- Headers RFC standard (X-RateLimit-\*, Retry-After)
- Sliding window algorithm pour précision maximale
- Fail-open en cas d'erreur Redis (disponibilité > sécurité)
- Analytics Upstash intégrées pour monitoring
- Tests locaux réussis:
  - Auth: 5 requêtes passées, 6-10 bloquées (429)
  - Admin: 20 requêtes passées, 21-25 bloquées (429)
  - Public: toutes requêtes passées (limite 100/min)
  - Headers conformes (x-ratelimit-\*, retry-after)
- Base Redis Upstash: eminent-horse-27385 (Ireland)
- Fichiers créés:
  - `lib/rate-limit.ts` (configuration Upstash)
  - `middleware.ts` (Next.js Edge Middleware)
  - `docs/RATE_LIMITING_SETUP.md` (documentation complète)
  - `scripts/test-rate-limit.sh` (tests automatiques)
  - `.env.local.example` (variables Upstash)

## Authentification Admin Server Actions (10 Jan 2026)

- Correction faille de sécurité critique sur catégories & tags
- Création helper réutilisable checkIsAdmin() dans lib/auth.ts
- Protection ajoutée sur 6 Server Actions:
  - app/admin/categories/actions.ts (create, update, delete)
  - app/admin/tags/actions.ts (create, update, delete)
- Vérification double: authentification + rôle is_admin=true
- Messages d'erreur cohérents pour refus d'accès
- Note: products et settings avaient déjà ces protections
- Fichier créé:
  - `lib/auth.ts` (checkIsAdmin, checkIsAuthenticated)

## Headers de Sécurité HTTP (10 Jan 2026)

- Configuration complète dans next.config.ts
- 6 headers de sécurité implémentés:
  - X-Frame-Options: DENY (anti-clickjacking)
  - X-Content-Type-Options: nosniff (anti-MIME sniffing)
  - Strict-Transport-Security: HSTS 1 an + subdomains + preload
  - Referrer-Policy: strict-origin-when-cross-origin
  - Permissions-Policy: camera/micro/geo désactivés
  - Content-Security-Policy: défense XSS multi-couches
- CSP configuré pour:
  - Stripe (js.stripe.com, api.stripe.com)
  - Supabase (\*.supabase.co, WebSocket wss://)
  - Upstash (\*.upstash.io)
  - Images externes (Unsplash, Placehold.co)
- Tests locaux validés (tous headers présents)
- Documentation complète: docs/SECURITY_HEADERS.md
- Score attendu: A sur securityheaders.com

## Issues Connues

- Aucune issue bloquante détectée
- Flux de paiement opérationnel
- Système de catégories/tags opérationnel
- À nettoyer: logs console avant production

---

**Temps estimé pour finir**: 3-4 jours de dev concentré
**Dernière mise à jour**: 10 Janvier 2026
