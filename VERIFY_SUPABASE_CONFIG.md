# 🔍 Vérification Configuration Supabase

## Problème probable : Email Confirmation activée

### ✅ Solution : Désactiver la confirmation d'email (pour le développement)

1. **Va dans Supabase Dashboard**
   - Ouvre ton projet Supabase
   - Va dans **Authentication** > **Settings** > **Email Auth**

2. **Désactive "Confirm email"**
   - Cherche l'option **"Confirm email"**
   - **Désactive-la** (Toggle OFF)
   - Clique sur **Save**

3. **Vérifie aussi ces paramètres :**
   - **Enable email signup** : ✅ ACTIVÉ
   - **Confirm email** : ❌ DÉSACTIVÉ (pour dev)
   - **Secure email change** : Ton choix
   - **Enable email OTP** : Optionnel

### 🔍 Autres causes possibles :

#### 1. Politique RLS trop stricte
Vérifie dans **SQL Editor** :
```sql
-- Vérifier les policies sur profiles
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

#### 2. Trigger non créé
Vérifie si le trigger existe :
```sql
-- Vérifier le trigger
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

Si le trigger n'existe pas, exécute :
```sql
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### 📱 Test après correction

1. Essaie de créer un compte avec :
   - Email : test@example.com
   - Mot de passe : Test1234!
   - Nom : Test User

2. Vérifie dans **Authentication > Users** que l'utilisateur apparaît

3. Vérifie dans **Table Editor > profiles** que le profil a été créé

