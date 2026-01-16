# 🚨 Plan de Réponse aux Incidents

**Projet** : THE PARFUMERIEE  
**Version** : 1.0  
**Dernière mise à jour** : 2024

---

## 📞 Contacts d'Urgence

### Équipe Technique

| Rôle | Nom | Email | Téléphone |
|------|-----|-------|-----------|
| Lead Tech | - | - | - |
| Développeur | - | - | - |

### Support Externe

| Service | Contact | Lien |
|---------|---------|------|
| Vercel Support | support@vercel.com | [vercel.com/support](https://vercel.com/support) |
| Supabase Support | support@supabase.com | [supabase.com/support](https://supabase.com/support) |
| Stripe Support | support@stripe.com | [stripe.com/support](https://stripe.com/support) |
| Sentry Support | support@sentry.io | [sentry.io/support](https://sentry.io/support) |

---

## 🔍 Détection des Problèmes

### Sources de Monitoring

1. **Uptime Monitoring** (UptimeRobot)
   - Vérifie toutes les 5 minutes
   - Alertes email/SMS en cas de downtime

2. **Sentry** (Error Tracking)
   - Alertes automatiques pour erreurs critiques
   - Dashboard : [sentry.io](https://sentry.io)

3. **Vercel Analytics**
   - Monitoring performance
   - Alertes pour erreurs serveur

4. **Stripe Dashboard**
   - Alertes pour échecs de paiement
   - Webhooks non livrés

5. **Supabase Dashboard**
   - Monitoring base de données
   - Alertes pour erreurs de connexion

---

## 🚨 Scénarios d'Incidents

### 1. Site Down (Downtime)

**Symptômes** :
- Site inaccessible (erreur 500, 502, 503)
- Timeout sur toutes les pages
- Uptime monitoring alerte

**Actions Immédiates** :

1. **Vérifier le statut Vercel**
   - Aller sur [vercel.com/status](https://vercel.com/status)
   - Vérifier si c'est un problème Vercel global

2. **Vérifier les logs Vercel**
   - Dashboard Vercel → Logs
   - Identifier l'erreur

3. **Vérifier Supabase**
   - Dashboard Supabase → Status
   - Vérifier si la base de données est accessible

4. **Actions de résolution** :
   - Si erreur de code : Rollback vers version précédente
   - Si problème Vercel : Attendre résolution ou contacter support
   - Si problème Supabase : Contacter support Supabase

**Rollback Vercel** :
```bash
# Via Dashboard Vercel
1. Aller dans "Deployments"
2. Trouver le dernier déploiement fonctionnel
3. Cliquer sur "..." → "Promote to Production"
```

**Communication** :
- Si downtime > 5 minutes : Informer les utilisateurs (si possible)
- Mettre à jour le statut sur le site (page de maintenance)

---

### 2. Erreur de Paiement

**Symptômes** :
- Commandes non créées après paiement
- Webhooks Stripe non reçus
- Erreurs dans les logs Stripe

**Actions Immédiates** :

1. **Vérifier Stripe Dashboard**
   - Aller dans "Payments" → Vérifier les paiements récents
   - Aller dans "Webhooks" → Vérifier les logs de webhooks

2. **Vérifier les logs Vercel**
   - Chercher les erreurs dans `/api/webhooks/stripe`
   - Vérifier la signature webhook

3. **Vérifier Supabase**
   - Vérifier que la table `orders` est accessible
   - Vérifier les contraintes (doublons, etc.)

4. **Actions de résolution** :
   - Si webhook non reçu : Redéclencher depuis Stripe Dashboard
   - Si erreur de code : Corriger et redéployer
   - Si problème de base : Vérifier les contraintes

**Redéclencher un webhook Stripe** :
```
1. Stripe Dashboard → Webhooks
2. Trouver l'événement
3. Cliquer sur "Send test webhook" ou "Replay"
```

**Récupération des commandes manquantes** :
- Si paiement réussi mais commande non créée :
  1. Récupérer `payment_intent_id` depuis Stripe
  2. Vérifier dans Supabase si commande existe
  3. Si non, créer manuellement la commande

---

### 3. Perte de Données

**Symptômes** :
- Données manquantes dans Supabase
- Produits/images supprimés
- Commandes perdues

**Actions Immédiates** :

1. **Vérifier les backups Supabase**
   - Dashboard Supabase → Database → Backups
   - Vérifier les backups disponibles

2. **Identifier l'étendue du problème**
   - Quelles tables sont affectées ?
   - Quand les données ont-elles été perdues ?

3. **Actions de résolution** :
   - Restaurer depuis un backup Supabase
   - Vérifier les logs pour identifier la cause

**Restauration Supabase** :
```
1. Dashboard Supabase → Database → Backups
2. Sélectionner le backup à restaurer
3. Cliquer sur "Restore"
4. Confirmer la restauration
```

**⚠️ Attention** : La restauration remplace toutes les données actuelles

---

### 4. Attaque Sécurité

**Symptômes** :
- Tentatives de connexion suspectes
- Erreurs d'authentification multiples
- Activité anormale dans les logs

**Actions Immédiates** :

1. **Bloquer l'accès si nécessaire**
   - Activer le mode maintenance Vercel
   - Bloquer les IP suspectes (via Vercel ou Cloudflare)

2. **Vérifier les logs**
   - Vercel Logs → Chercher les patterns suspects
   - Supabase Logs → Vérifier les tentatives d'accès

3. **Actions de résolution** :
   - Changer les clés API si compromises
   - Révoquer les sessions utilisateurs si nécessaire
   - Contacter le support si attaque majeure

4. **Post-mortem** :
   - Documenter l'attaque
   - Identifier les failles
   - Mettre à jour les mesures de sécurité

---

### 5. Problème de Performance

**Symptômes** :
- Site lent (> 3s de chargement)
- Timeouts fréquents
- Erreurs 504 Gateway Timeout

**Actions Immédiates** :

1. **Vérifier Vercel Analytics**
   - Dashboard → Analytics
   - Identifier les pages lentes

2. **Vérifier Supabase**
   - Dashboard → Database → Performance
   - Vérifier les requêtes lentes

3. **Actions de résolution** :
   - Optimiser les requêtes lentes
   - Ajouter du caching
   - Scale up Supabase si nécessaire
   - Optimiser les images

---

## 📋 Procédure Générale de Résolution

### 1. Détection
- Identifier le problème via monitoring ou signalement utilisateur
- Noter l'heure de détection

### 2. Diagnostic
- Vérifier les logs (Vercel, Supabase, Stripe, Sentry)
- Identifier la cause racine
- Évaluer l'impact (nombre d'utilisateurs affectés)

### 3. Résolution
- Appliquer la solution appropriée (voir scénarios ci-dessus)
- Tester la résolution
- Vérifier que le problème est résolu

### 4. Communication
- Si impact utilisateur : Informer (email, page de statut)
- Documenter l'incident
- Mettre à jour l'équipe

### 5. Post-Mortem
- Analyser la cause racine
- Documenter les leçons apprises
- Mettre à jour les procédures si nécessaire
- Prévenir les récurrences

---

## 🔧 Outils de Diagnostic

### Commandes Utiles

```bash
# Vérifier le statut du site
curl -I https://votre-domaine.com

# Vérifier les headers de sécurité
curl -I https://votre-domaine.com | grep -i security

# Tester un endpoint API
curl -X POST https://votre-domaine.com/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# Vérifier DNS
dig votre-domaine.com
nslookup votre-domaine.com
```

### Dashboards à Vérifier

1. **Vercel** : [vercel.com/dashboard](https://vercel.com/dashboard)
   - Deployments
   - Logs
   - Analytics

2. **Supabase** : [app.supabase.com](https://app.supabase.com)
   - Database → Logs
   - Database → Backups
   - Auth → Users

3. **Stripe** : [dashboard.stripe.com](https://dashboard.stripe.com)
   - Payments
   - Webhooks
   - Events

4. **Sentry** : [sentry.io](https://sentry.io)
   - Issues
   - Performance

---

## 📝 Template de Rapport d'Incident

```markdown
# Rapport d'Incident - [DATE]

## Résumé
- **Date/Heure** : [DATE] [HEURE]
- **Durée** : [DURÉE]
- **Impact** : [IMPACT]
- **Statut** : [RÉSOLU/EN COURS]

## Description
[Description détaillée du problème]

## Cause Racine
[Cause identifiée]

## Actions Prises
1. [Action 1]
2. [Action 2]
3. [Action 3]

## Résolution
[Comment le problème a été résolu]

## Prévention
[Mesures pour éviter la récurrence]

## Leçons Apprises
[Ce qui a été appris]
```

---

## 🔗 Ressources

- [Vercel Status](https://vercel.com/status)
- [Supabase Status](https://status.supabase.com)
- [Stripe Status](https://status.stripe.com)
- [Checklist Pré-Lancement](./PRE_LAUNCH_CHECKLIST.md)
- [Guide de Déploiement](../PRODUCTION_DEPLOYMENT.md)

---

**⚠️ Important** : Ce plan doit être régulièrement mis à jour et testé.
