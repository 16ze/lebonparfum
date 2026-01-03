# 🔍 DEBUG AUTHENTIFICATION

## 🐛 Erreur Actuelle

```
TypeError: FetchEvent.respondWith received an error: TypeError: Load failed
```

## 📋 Checklist de Diagnostic

### 1. ✅ Vérifier les Variables d'Environnement

Dans `.env.local`, vérifie que tu as bien :
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Test** :
```bash
cd /Users/bryandev/Documents/lebonparfum
cat .env.local | grep SUPABASE
```

---

### 2. ✅ Vérifier la Connexion Supabase

Ouvre la console du navigateur (F12) et tape :
```javascript
console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
```

---

### 3. 🔍 Tester la Requête Directement

Dans la console navigateur, teste manuellement :

```javascript
// Test 1: Vérifier que fetch fonctionne
fetch('/login', { method: 'POST' })
  .then(r => console.log('✅ Fetch OK:', r.status))
  .catch(e => console.error('❌ Fetch ERROR:', e));

// Test 2: Tester signUp directement via Supabase
const { createClient } = await import('@supabase/supabase-js');
const supabase = createClient(
  'TON_SUPABASE_URL',
  'TON_SUPABASE_ANON_KEY'
);

const result = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'Test1234!',
  options: {
    data: { full_name: 'Test User' }
  }
});
console.log('Résultat signup:', result);
```

---

### 4. 🧪 Vérifier Supabase Dashboard

1. Va sur https://supabase.com/dashboard
2. Sélectionne ton projet
3. Va dans **Authentication > Policies**
4. Vérifie que les RLS sont bien configurées pour la table `profiles`

---

### 5. 🔍 Logs du Terminal Next.js

Cherche dans les logs du serveur (`/terminals/31.txt`) :
- Des erreurs `Supabase`
- Des erreurs `Auth`
- Des codes 500

---

### 6. 🌐 Tester en Mode Incognito

1. Ouvre une fenêtre privée/incognito
2. Va sur `http://localhost:3000/login`
3. Essaie de créer un compte
4. Regarde la console (F12)

---

### 7. 🔒 Vérifier CORS / Headers

Dans DevTools > Network :
1. Essaie de créer un compte
2. Clique sur la requête `/login` qui échoue
3. Regarde :
   - **Status** : 200 ? 500 ? Failed ?
   - **Headers** : CORS errors ?
   - **Response** : Message d'erreur ?

---

## 🚀 Solutions Possibles

### Solution 1 : Cache Navigateur
```bash
# Vider le cache Next.js
rm -rf .next

# Redémarrer le serveur
npm run dev
```

Puis dans le navigateur : `Cmd + Shift + R` (Mac) ou `Ctrl + Shift + R` (Win)

---

### Solution 2 : Variables d'Environnement Manquantes

Copie `.env.local.example` en `.env.local` et remplis les valeurs.

---

### Solution 3 : Problème Network/DNS

Si tu es derrière un VPN ou proxy, désactive-le temporairement.

---

### Solution 4 : Problème de CORS Supabase

Va dans Supabase Dashboard > Settings > API > CORS :
- Ajoute `http://localhost:3000`
- Ajoute ton domaine de production

---

## 📊 Logs Attendus (Success)

Quand ça marche, tu dois voir dans la console :

```
✅ Compte créé avec succès
✅ localStorage vidé avec succès (si connexion après achat)
```

Et dans les logs serveur (`/terminals/31.txt`) :
```
POST /login 200 in 300ms
```

---

## ⚠️ Erreurs Courantes

| Erreur | Cause | Solution |
|--------|-------|----------|
| `Load failed` | Requête réseau bloquée | Vérifier CORS, VPN, Firewall |
| `Email already registered` | Compte existe déjà | Utiliser un autre email |
| `Invalid email or password` | Credentials incorrects | Vérifier saisie |
| `Erreur récupération profil` | Table `profiles` manquante | Vérifier migration Supabase |

---

## 🛠️ Test Complet

Exécute ce script dans la console navigateur (F12) :

```javascript
// Test complet d'authentification
async function testAuth() {
  console.log('🧪 TEST AUTH - Début');
  
  try {
    // 1. Test variables d'env
    console.log('1️⃣ Variables d'env:', {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    });
    
    // 2. Test fetch basique
    const testFetch = await fetch('/api/health').catch(e => e);
    console.log('2️⃣ Fetch test:', testFetch);
    
    // 3. Test localStorage
    localStorage.setItem('test', '123');
    console.log('3️⃣ localStorage:', localStorage.getItem('test'));
    localStorage.removeItem('test');
    
    // 4. Test console errors
    console.log('4️⃣ Pas d\'erreurs console :', window.console.error.length || 0);
    
    console.log('✅ TEST AUTH - Terminé sans erreurs');
  } catch (error) {
    console.error('❌ TEST AUTH - Erreur:', error);
  }
}

testAuth();
```

