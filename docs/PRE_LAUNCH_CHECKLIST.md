# ✅ Checklist Pré-Lancement

**Date de création** : 2024  
**Projet** : THE PARFUMERIEE  
**Status** : Phase de finalisation

---

## 📋 Vue d'ensemble

Cette checklist doit être complétée **AVANT** le lancement en production. Chaque point doit être vérifié et documenté.

---

## 1. 🔒 Sécurité Niveau Production

### Checklist Sécurité

- [ ] **Headers de sécurité HTTP**
  - [x] ✅ Déjà configurés dans `next.config.ts`
  - [ ] Vérifier en production : `curl -I https://votre-domaine.com`
  - [ ] Score A sur [securityheaders.com](https://securityheaders.com/)
  - [ ] Tester avec [Mozilla Observatory](https://observatory.mozilla.org/)

- [ ] **Variables d'environnement**
  - [ ] Toutes les variables sensibles sont dans Vercel (pas dans le code)
  - [ ] `NEXT_PUBLIC_*` uniquement pour les variables publiques
  - [ ] Clés API Stripe en mode live configurées
  - [ ] Clés Supabase production configurées
  - [ ] Aucune clé hardcodée dans le code

- [ ] **Authentification & Autorisation**
  - [x] ✅ RLS activé sur toutes les tables Supabase
  - [ ] Vérifier que les policies RLS sont correctes en production
  - [ ] Tester qu'un utilisateur non-admin ne peut pas accéder à `/admin`
  - [ ] Vérifier que les Server Actions admin vérifient l'authentification

- [ ] **Rate Limiting**
  - [x] ✅ Upstash Redis configuré
  - [ ] Vérifier que le rate limiting fonctionne en production
  - [ ] Tester avec plusieurs requêtes simultanées

- [ ] **Validation & Sanitization**
  - [x] ✅ Validation Zod côté serveur
  - [x] ✅ Sanitization HTML pour les descriptions
  - [ ] Tester injection XSS sur les formulaires
  - [ ] Tester injection SQL (via Supabase RLS)

- [ ] **Webhooks Stripe**
  - [ ] Signature webhook vérifiée en production
  - [ ] Endpoint webhook configuré dans Stripe Dashboard
  - [ ] Tester un webhook réel depuis Stripe

- [ ] **HTTPS & Certificats**
  - [ ] HTTPS activé sur Vercel (automatique)
  - [ ] Redirection HTTP → HTTPS active
  - [ ] Certificat SSL valide (vérifier avec [SSL Labs](https://www.ssllabs.com/ssltest/))

### Commandes de vérification

```bash
# Vérifier les headers de sécurité
curl -I https://votre-domaine.com

# Vérifier le certificat SSL
openssl s_client -connect votre-domaine.com:443 -servername votre-domaine.com
```

### Score cible

- **SecurityHeaders.com** : A ou A+
- **Mozilla Observatory** : B+ minimum
- **SSL Labs** : A minimum

---

## 2. ⚡ Performance Optimale

### Checklist Performance

- [ ] **Lighthouse Audit**
  - [ ] Performance : > 90
  - [ ] Accessibility : > 90
  - [ ] Best Practices : > 90
  - [ ] SEO : > 90
  - [ ] Command : `npm run build && npm run start` puis audit Lighthouse

- [ ] **Bundle Size**
  - [ ] Bundle JavaScript < 300KB (gzipped)
  - [ ] Vérifier avec `npm run build` et analyser `.next/analyze`
  - [ ] Pas de dépendances inutiles

- [ ] **Images**
  - [x] ✅ Next.js Image component utilisé partout
  - [x] ✅ Lazy loading activé
  - [ ] Vérifier que toutes les images sont optimisées (WebP)
  - [ ] Tester avec des images réelles de produits

- [ ] **Caching**
  - [ ] Vercel Edge Caching configuré
  - [ ] Headers Cache-Control appropriés
  - [ ] ISR (Incremental Static Regeneration) si applicable

- [ ] **Core Web Vitals**
  - [ ] LCP (Largest Contentful Paint) < 2.5s
  - [ ] FID (First Input Delay) < 100ms
  - [ ] CLS (Cumulative Layout Shift) < 0.1
  - [ ] Vérifier avec [PageSpeed Insights](https://pagespeed.web.dev/)

- [ ] **Database Queries**
  - [ ] Indexes sur les colonnes fréquemment requêtées
  - [ ] Pas de N+1 queries
  - [ ] Utiliser `select()` pour limiter les colonnes récupérées

### Commandes de vérification

```bash
# Build et analyse
npm run build

# Lighthouse CLI (si installé)
npx lighthouse https://votre-domaine.com --view

# Analyse bundle
ANALYZE=true npm run build
```

### Scores cibles

- **Lighthouse Performance** : > 90
- **PageSpeed Insights** : > 90
- **Bundle Size** : < 300KB gzipped

---

## 3. 📚 Documentation Complète

### Checklist Documentation

- [ ] **README.md**
  - [ ] Instructions d'installation
  - [ ] Variables d'environnement documentées
  - [ ] Commandes de développement
  - [ ] Structure du projet

- [ ] **Documentation Technique**
  - [x] ✅ `PRODUCTION_DEPLOYMENT.md` (déploiement)
  - [x] ✅ `docs/SECURITY_HEADERS.md` (sécurité)
  - [ ] `docs/API.md` (endpoints API si nécessaire)
  - [ ] `docs/DATABASE_SCHEMA.md` (schéma base de données)

- [ ] **Documentation Admin**
  - [ ] Guide d'utilisation du panel admin
  - [ ] Comment ajouter/modifier un produit
  - [ ] Comment gérer les commandes
  - [ ] Comment gérer les utilisateurs

- [ ] **Documentation Déploiement**
  - [ ] Procédure de déploiement Vercel
  - [ ] Configuration Supabase production
  - [ ] Configuration Stripe production
  - [ ] Rollback procedure

### Fichiers à créer/compléter

- [ ] `README.md` complet
- [ ] `docs/ADMIN_GUIDE.md` (déjà existant, vérifier complétude)
- [ ] `docs/DEPLOYMENT.md` (procédure détaillée)
- [ ] `docs/TROUBLESHOOTING.md` (dépannage)

---

## 4. 🛒 Tests Achat Complet OK

### Checklist Tests E-commerce

- [ ] **Parcours Client Complet**
  - [ ] Navigation catalogue
  - [ ] Filtres et recherche
  - [ ] Page produit détaillée
  - [ ] Ajout au panier
  - [ ] Modification panier (quantité, suppression)
  - [ ] Passage commande
  - [ ] Formulaire de livraison
  - [ ] Paiement Stripe (mode test)
  - [ ] Confirmation commande
  - [ ] Email de confirmation (si configuré)

- [ ] **Paiement Stripe**
  - [ ] Test avec carte de test : `4242 4242 4242 4242`
  - [ ] Test avec 3D Secure (si activé)
  - [ ] Test échec paiement
  - [ ] Test webhook `payment_intent.succeeded`
  - [ ] Vérifier que la commande est créée en base

- [ ] **Commandes Invités**
  - [ ] Test achat sans compte
  - [ ] Vérifier que `customer_email` et `customer_name` sont sauvegardés
  - [ ] Vérifier affichage dans `/admin/orders`

- [ ] **Commandes Utilisateurs Connectés**
  - [ ] Test achat avec compte
  - [ ] Vérifier que `user_id` est lié
  - [ ] Vérifier affichage dans `/admin/orders`

- [ ] **Gestion Stock**
  - [ ] Test avec stock insuffisant
  - [ ] Test avec variantes (si applicable)
  - [ ] Vérifier déduction stock après commande

- [ ] **Edge Cases**
  - [ ] Double soumission formulaire
  - [ ] Expiration session pendant checkout
  - [ ] Panier vide
  - [ ] Produit supprimé pendant checkout

### Scénarios de test

```bash
# 1. Test complet achat
1. Aller sur la page d'accueil
2. Cliquer sur un produit
3. Ajouter au panier
4. Aller au panier
5. Cliquer "Passer commande"
6. Remplir formulaire livraison
7. Payer avec carte test : 4242 4242 4242 4242
8. Vérifier confirmation
9. Vérifier dans /admin/orders

# 2. Test webhook
# Utiliser Stripe CLI ou Dashboard pour déclencher un webhook
stripe trigger payment_intent.succeeded
```

---

## 5. 💳 Stripe en Mode Live

### Checklist Stripe Production

- [ ] **Configuration Stripe**
  - [ ] Compte Stripe activé (pas en mode test)
  - [ ] Clés API live configurées dans Vercel
    - `STRIPE_SECRET_KEY` (live)
    - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (live)
  - [ ] Webhook endpoint configuré dans Stripe Dashboard
  - [ ] Secret webhook (`STRIPE_WEBHOOK_SECRET`) configuré

- [ ] **Webhooks Production**
  - [ ] Endpoint : `https://votre-domaine.com/api/webhooks/stripe`
  - [ ] Événements à écouter :
    - `payment_intent.succeeded`
    - `payment_intent.payment_failed` (optionnel)
  - [ ] Signature webhook vérifiée
  - [ ] Tester avec un vrai paiement de test (montant minimal)

- [ ] **3D Secure (SCA)**
  - [ ] Activé dans Stripe Dashboard
  - [ ] Testé avec carte nécessitant 3D Secure
  - [ ] Flow de confirmation fonctionnel

- [ ] **Disputes & Chargebacks**
  - [ ] Email de notification configuré
  - [ ] Procédure documentée pour gérer les disputes
  - [ ] Dashboard Stripe accessible

### Commandes de vérification

```bash
# Vérifier les clés Stripe (ne pas afficher les vraies clés)
echo $STRIPE_SECRET_KEY | cut -c1-10  # Affiche seulement les 10 premiers caractères

# Tester webhook en production (avec Stripe CLI)
stripe listen --forward-to https://votre-domaine.com/api/webhooks/stripe
```

### ⚠️ Important

- **NE JAMAIS** utiliser les clés de test en production
- **NE JAMAIS** commiter les clés dans Git
- Tester avec de **vraies cartes de test** (montant minimal) avant le lancement

---

## 6. 🌐 Domain Custom Configuré

### Checklist Domain

- [ ] **Configuration Vercel**
  - [ ] Domain ajouté dans Vercel Dashboard
  - [ ] DNS configuré correctement
  - [ ] Certificat SSL généré automatiquement
  - [ ] Redirection www → non-www (ou inversement)

- [ ] **DNS Records**
  - [ ] A Record ou CNAME pointant vers Vercel
  - [ ] Vérifier propagation DNS : `dig votre-domaine.com`
  - [ ] TTL approprié (300s recommandé)

- [ ] **HTTPS**
  - [ ] Certificat SSL valide
  - [ ] Redirection HTTP → HTTPS active
  - [ ] Vérifier avec [SSL Labs](https://www.ssllabs.com/ssltest/)

- [ ] **Email (si nécessaire)**
  - [ ] SPF record configuré
  - [ ] DKIM configuré
  - [ ] DMARC configuré (optionnel)

### Commandes de vérification

```bash
# Vérifier DNS
dig votre-domaine.com
nslookup votre-domaine.com

# Vérifier HTTPS
curl -I https://votre-domaine.com
openssl s_client -connect votre-domaine.com:443
```

---

## 7. 📊 Monitoring Actif

### Checklist Monitoring

- [ ] **Vercel Analytics**
  - [ ] Activé dans Vercel Dashboard
  - [ ] Vérifier que les données sont collectées
  - [ ] Dashboard accessible

- [ ] **Error Tracking (Sentry)**
  - [x] ✅ Sentry configuré
  - [ ] Vérifier que les erreurs sont envoyées à Sentry
  - [ ] Alertes configurées (email/Slack)
  - [ ] Dashboard Sentry accessible

- [ ] **Uptime Monitoring**
  - [ ] Service configuré (UptimeRobot, Pingdom, etc.)
  - [ ] Vérification toutes les 5 minutes
  - [ ] Alertes email/SMS en cas de downtime
  - [ ] Pages à monitorer :
    - Page d'accueil
    - Page produit
    - Page checkout
    - API webhook

- [ ] **Performance Monitoring**
  - [ ] Vercel Analytics (Core Web Vitals)
  - [ ] Google Analytics / Plausible (optionnel)
  - [ ] Dashboard de performance accessible

- [ ] **Logs**
  - [ ] Vercel Logs accessibles
  - [ ] Supabase Logs accessibles
  - [ ] Stripe Logs accessibles
  - [ ] Rotation des logs configurée

### Services recommandés

- **Uptime** : [UptimeRobot](https://uptimerobot.com/) (gratuit jusqu'à 50 monitors)
- **Analytics** : Vercel Analytics (inclus) + Google Analytics (optionnel)
- **Error Tracking** : Sentry (déjà configuré)

---

## 8. 💾 Backup Automatique

### Checklist Backup

- [ ] **Supabase Backups**
  - [ ] Backup automatique activé dans Supabase Dashboard
  - [ ] Fréquence : Quotidien (recommandé)
  - [ ] Rétention : 7 jours minimum
  - [ ] Point-in-time recovery activé (si disponible)
  - [ ] Tester la restauration d'un backup

- [ ] **Storage (Images)**
  - [ ] Backup des images Supabase Storage
  - [ ] Script de backup manuel (optionnel)
  - [ ] Vérifier que les images sont accessibles

- [ ] **Code**
  - [x] ✅ Git (GitHub) = backup automatique du code
  - [ ] Vérifier que toutes les branches importantes sont pushées
  - [ ] Tags de version créés pour les releases

- [ ] **Variables d'environnement**
  - [ ] Documentées dans un fichier sécurisé (chiffré)
  - [ ] Sauvegardées dans un gestionnaire de secrets (1Password, etc.)
  - [ ] **NE JAMAIS** dans Git

- [ ] **Procédure de Restauration**
  - [ ] Documentée dans `docs/BACKUP_RESTORE.md`
  - [ ] Testée au moins une fois
  - [ ] Temps de restauration estimé

### Configuration Supabase

Dans Supabase Dashboard :
1. Aller dans **Settings** → **Database**
2. Activer **Point-in-time recovery** (si disponible)
3. Configurer **Automatic backups** : Quotidien
4. Rétention : 7 jours minimum

---

## 9. 🚨 Plan Incident Documenté

### Checklist Plan Incident

- [ ] **Document Créé**
  - [ ] `docs/INCIDENT_RESPONSE.md` créé
  - [ ] Procédures documentées
  - [ ] Contacts d'urgence listés

- [ ] **Scénarios Couverts**
  - [ ] Site down (downtime)
  - [ ] Erreur de paiement
  - [ ] Perte de données
  - [ ] Attaque sécurité
  - [ ] Problème de performance

- [ ] **Procédures**
  - [ ] Détection du problème
  - [ ] Escalade (qui contacter)
  - [ ] Résolution (étapes)
  - [ ] Communication client (si nécessaire)
  - [ ] Post-mortem

- [ ] **Contacts**
  - [ ] Équipe technique
  - [ ] Support Vercel
  - [ ] Support Supabase
  - [ ] Support Stripe
  - [ ] Client/Business owner

- [ ] **Outils**
  - [ ] Accès aux dashboards (Vercel, Supabase, Stripe, Sentry)
  - [ ] Accès SSH (si nécessaire)
  - [ ] Accès base de données (read-only pour diagnostic)

### Template Plan Incident

Voir `docs/INCIDENT_RESPONSE.md` (à créer)

---

## ✅ Validation Finale

Avant de marquer la checklist comme complète, vérifier :

- [ ] Tous les points ci-dessus sont cochés
- [ ] Tests manuels effectués
- [ ] Documentation à jour
- [ ] Équipe informée
- [ ] Plan de rollback prêt

---

## 📝 Notes

- **Date de validation** : _______________
- **Validé par** : _______________
- **Prochaines étapes** : _______________

---

## 🔗 Ressources

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Security Headers Guide](./SECURITY_HEADERS.md)
- [Production Deployment Guide](../PRODUCTION_DEPLOYMENT.md)
