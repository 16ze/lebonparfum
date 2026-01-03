# Configuration Google OAuth pour Supabase

Ce guide explique comment configurer Google OAuth pour permettre aux utilisateurs de se connecter avec leur compte Google.

---

## 📋 Prérequis

- Un projet Supabase actif
- Un compte Google Cloud Platform

---

## 🔧 Étape 1 : Configurer Google Cloud Console

### 1.1 Créer un projet Google Cloud

1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créer un nouveau projet ou sélectionner un projet existant
3. Nommer le projet (ex: "Le Bon Parfum")

### 1.2 Activer l'API Google+

1. Dans le menu latéral, aller dans **APIs & Services** > **Library**
2. Rechercher "Google+ API"
3. Cliquer sur **Enable**

### 1.3 Créer des identifiants OAuth 2.0

1. Aller dans **APIs & Services** > **Credentials**
2. Cliquer sur **Create Credentials** > **OAuth client ID**
3. Si demandé, configurer l'écran de consentement OAuth :
   - **User Type** : External
   - **App name** : Le Bon Parfum
   - **User support email** : Votre email
   - **Developer contact** : Votre email
   - **Scopes** : Laisser par défaut (email, profile, openid)
   - **Test users** : Ajouter votre email de test
4. Retourner à **Credentials** > **Create Credentials** > **OAuth client ID**
5. Sélectionner **Application type** : Web application
6. **Name** : Le Bon Parfum - Supabase
7. **Authorized JavaScript origins** :
   ```
   https://ocaphdoqxusfqwrykydr.supabase.co
   ```
8. **Authorized redirect URIs** :
   ```
   https://ocaphdoqxusfqwrykydr.supabase.co/auth/v1/callback
   ```
9. Cliquer sur **Create**
10. **IMPORTANT** : Copier le **Client ID** et **Client Secret** (vous en aurez besoin pour Supabase)

---

## 🔐 Étape 2 : Configurer Supabase

### 2.1 Activer Google OAuth dans Supabase

1. Aller sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionner votre projet
3. Dans le menu latéral, aller dans **Authentication** > **Providers**
4. Trouver **Google** et cliquer sur **Enable**
5. Remplir les champs :
   - **Client ID** : Coller le Client ID de Google
   - **Client Secret** : Coller le Client Secret de Google
6. **Authorized Client IDs** : Laisser vide (optionnel)
7. Cliquer sur **Save**

### 2.2 Vérifier l'URL de callback

L'URL de callback Supabase doit être :
```
https://ocaphdoqxusfqwrykydr.supabase.co/auth/v1/callback
```

Cette URL doit être **exactement la même** que celle configurée dans Google Cloud Console.

---

## 🌐 Étape 3 : Configuration locale (développement)

### 3.1 Ajouter des URLs de redirection pour localhost

Dans **Google Cloud Console** > **Credentials** > Votre OAuth client :

1. Ajouter dans **Authorized JavaScript origins** :
   ```
   http://localhost:3001
   http://localhost:3000
   ```

2. Ajouter dans **Authorized redirect URIs** :
   ```
   https://ocaphdoqxusfqwrykydr.supabase.co/auth/v1/callback
   ```

### 3.2 Vérifier le fichier .env.local

Assurez-vous que votre `.env.local` contient :

```env
NEXT_PUBLIC_SUPABASE_URL=https://ocaphdoqxusfqwrykydr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3001
```

---

## 🧪 Étape 4 : Tester l'authentification

### 4.1 Lancer le serveur de développement

```bash
npm run dev
```

### 4.2 Tester le flow OAuth

1. Aller sur `http://localhost:3001/login`
2. Cliquer sur **Continuer avec Google**
3. Sélectionner un compte Google
4. Accepter les permissions
5. Vous devriez être redirigé vers `/account`

---

## 🚀 Étape 5 : Configuration production

### 5.1 Mettre à jour les URLs autorisées

Dans **Google Cloud Console**, ajouter vos URLs de production :

**Authorized JavaScript origins** :
```
https://votre-domaine.com
https://ocaphdoqxusfqwrykydr.supabase.co
```

**Authorized redirect URIs** :
```
https://ocaphdoqxusfqwrykydr.supabase.co/auth/v1/callback
```

### 5.2 Variables d'environnement production

Mettre à jour `NEXT_PUBLIC_SITE_URL` avec votre domaine de production :

```env
NEXT_PUBLIC_SITE_URL=https://votre-domaine.com
```

---

## ❗ Troubleshooting

### Erreur "redirect_uri_mismatch"

**Cause** : L'URL de callback ne correspond pas exactement à celle configurée dans Google Cloud Console.

**Solution** :
1. Vérifier que l'URL de callback dans Google Cloud est exactement :
   ```
   https://ocaphdoqxusfqwrykydr.supabase.co/auth/v1/callback
   ```
2. Attendre 5-10 minutes après la modification (propagation)

### Erreur "Access blocked: This app's request is invalid"

**Cause** : L'écran de consentement OAuth n'est pas correctement configuré.

**Solution** :
1. Aller dans **APIs & Services** > **OAuth consent screen**
2. Vérifier que l'app est en mode **External** (ou Internal si Google Workspace)
3. Ajouter votre email dans **Test users** si l'app est en mode Testing

### L'utilisateur n'est pas créé dans la table profiles

**Cause** : Le trigger `handle_new_user()` n'existe pas ou est désactivé.

**Solution** :
1. Vérifier que la migration `03_auth_admin.sql` a été exécutée
2. Aller dans **Supabase Dashboard** > **Database** > **Triggers**
3. Vérifier que le trigger `on_auth_user_created` existe

---

## 📚 Ressources

- [Supabase Auth with Google](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 2.0 Setup](https://developers.google.com/identity/protocols/oauth2)
- [Next.js 15 Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

---

## ✅ Checklist finale

- [ ] Projet Google Cloud créé
- [ ] Google+ API activée
- [ ] OAuth client ID créé (Web application)
- [ ] Authorized redirect URIs configurées dans Google Cloud
- [ ] Google OAuth activé dans Supabase Dashboard
- [ ] Client ID et Secret ajoutés dans Supabase
- [ ] Variable `NEXT_PUBLIC_SITE_URL` ajoutée au .env.local
- [ ] Route `/auth/callback` créée dans Next.js
- [ ] Bouton "Continuer avec Google" visible sur `/login`
- [ ] Test de connexion réussi en local
- [ ] URLs de production ajoutées (si applicable)
