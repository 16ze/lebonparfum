# 🔍 Debug : Pourquoi je ne reçois pas d'email de confirmation Supabase ?

## 📧 **Problème**

Lorsque tu crées un compte via le formulaire, tu ne reçois pas d'email de confirmation.

---

## 🧐 **Diagnostic**

### **1. Vérifier la configuration Supabase**

Va dans ton **Supabase Dashboard** :

1. **Authentication** > **Providers**
2. **Vérifie ces paramètres :**
   - ✅ **Enable email signup** : ACTIVÉ
   - ✅ **Confirm email** : ACTIVÉ ✅ ou DÉSACTIVÉ ❌ ?

**Si "Confirm email" est ACTIVÉ :**

- Les utilisateurs **doivent** confirmer leur email avant de pouvoir se connecter
- Supabase envoie un email avec un lien de confirmation
- **MAIS** : En mode développement local, Supabase n'envoie **PAS** d'email vers de vraies adresses

**Si "Confirm email" est DÉSACTIVÉ :**

- Les utilisateurs peuvent se connecter immédiatement
- Aucun email n'est envoyé

---

### **2. Mode Développement vs Production**

#### **🏠 En LOCAL (Développement)**

Supabase **n'envoie PAS** d'emails à de vraies adresses.

**Solution 1 : Désactiver la confirmation d'email (Recommandé pour dev)**

1. Va dans **Supabase Dashboard**
2. **Authentication** > **Providers** > **Email**
3. **Désactive** "Confirm email"
4. **Save**

Maintenant, quand tu crées un compte, tu peux te connecter immédiatement sans email.

**Solution 2 : Utiliser Inbucket (Si tu utilises Supabase CLI local)**

Si tu as Supabase CLI installé en local :

- Les emails sont capturés par **Inbucket** (outil de test)
- Tu peux voir les emails à : `http://localhost:54324` (port par défaut)

#### **🌐 En PRODUCTION**

Supabase **envoie** de vrais emails.

**Configuration requise :**

1. **Supabase Dashboard** > **Authentication** > **Email Templates**
2. Vérifie que le **Site URL** est correct :

   - **Settings** > **API** > **Configuration**
   - **Site URL** : `https://ton-site.com`
   - **Redirect URLs** : `https://ton-site.com/auth/callback`

3. **Activer SMTP personnalisé (Optionnel mais recommandé)**
   - Par défaut, Supabase utilise son propre SMTP (limité)
   - Pour un meilleur taux de délivrabilité, configure ton propre SMTP :
     - **Settings** > **Auth** > **SMTP Settings**
     - Configure avec SendGrid, Mailgun, ou Postmark

---

### **3. Vérifier si le compte est bien créé**

Même si tu ne reçois pas d'email, vérifie si le compte a été créé :

1. Va dans **Supabase Dashboard**
2. **Authentication** > **Users**
3. Cherche l'email que tu as utilisé
4. Si l'utilisateur existe :
   - **Statut** : `Waiting for verification` ou `Confirmed` ?
   - Si `Waiting for verification`, tu peux **confirmer manuellement** en cliquant sur l'utilisateur > **Confirm email**

---

### **4. Vérifier la table `profiles`**

Il y a une erreur dans les logs :

```
❌ Erreur récupération profil: Cannot coerce the result to a single JSON object
```

Cela signifie que :

- Soit il y a **plusieurs profils** avec le même `user_id`
- Soit il y a **0 profil** créé

**Vérification :**

1. Va dans **Supabase Dashboard** > **Table Editor** > `profiles`
2. Cherche les profils avec l'email que tu as utilisé
3. **Si tu vois plusieurs lignes avec le même `id`** :
   - Supprime les doublons (garde une seule ligne)
4. **Si tu ne vois aucun profil** :
   - Le trigger `handle_new_user()` n'a pas fonctionné

**Pour réparer le trigger :**

Va dans **SQL Editor** et exécute :

```sql
-- Supprimer l'ancien trigger s'il existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recréer la fonction
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Utilisateur')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recréer le trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

## ✅ **Solution Rapide (Pour Dev)**

1. **Désactive la confirmation d'email dans Supabase Dashboard**

   - Authentication > Providers > Email > **Désactive "Confirm email"**
   - Save

2. **Supprime les utilisateurs de test existants**

   - Authentication > Users > Supprime les comptes de test

3. **Réessaie de créer un compte**
   - Tu devrais pouvoir te connecter immédiatement sans email

---

## 🚀 **Solution pour Production**

1. **Active la confirmation d'email**
2. **Configure un SMTP personnalisé** (SendGrid, Mailgun, etc.)
3. **Vérifie le Site URL et les Redirect URLs**
4. **Teste avec un vrai email**

---

## 📝 **Commandes utiles**

### Vérifier les utilisateurs créés dans Supabase

```sql
-- Dans SQL Editor (Supabase Dashboard)
SELECT id, email, email_confirmed_at, created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;
```

### Vérifier les profils créés

```sql
SELECT id, email, full_name, is_admin, created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 10;
```

### Confirmer manuellement un utilisateur

```sql
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'ton-email@example.com';
```

---

## 🎯 **Prochaines étapes**

1. Va dans Supabase Dashboard et vérifie **"Confirm email"**
2. Si ACTIVÉ → Désactive-le pour le développement
3. Supprime les utilisateurs de test
4. Réessaie de créer un compte
5. Vérifie que le compte apparaît dans **Authentication > Users**
6. Vérifie que le profil apparaît dans **Table Editor > profiles**

Si ça ne fonctionne toujours pas, partage-moi :

- Le statut de "Confirm email" (Activé ou Désactivé)
- Les logs du terminal après avoir créé un compte
- Le contenu de la table `auth.users` pour cet utilisateur
