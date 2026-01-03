/**
 * Script de test pour vérifier l'inscription
 * 
 * Usage: npx tsx scripts/test-signup.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSignup() {
  console.log('🧪 Test de création de compte...\n');

  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'Test1234!';
  const testName = 'Test User';

  console.log('📧 Email:', testEmail);
  console.log('🔑 Password:', testPassword);
  console.log('👤 Nom:', testName);
  console.log('');

  // Test 1: Création du compte
  console.log('⏳ Étape 1: Création du compte...');
  const { data: signupData, error: signupError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: {
        full_name: testName,
      },
    },
  });

  if (signupError) {
    console.error('❌ Erreur signup:', signupError.message);
    return;
  }

  if (!signupData.user) {
    console.error('❌ Aucun utilisateur créé');
    return;
  }

  console.log('✅ Compte créé:', signupData.user.id);
  console.log('📧 Email confirmé:', signupData.user.email_confirmed_at ? 'Oui' : 'Non');
  console.log('');

  // Attendre un peu pour laisser le trigger créer le profil
  console.log('⏳ Attente de la création du profil (2s)...');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 2: Vérifier le profil
  console.log('⏳ Étape 2: Vérification du profil...');
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', signupData.user.id)
    .single();

  if (profileError) {
    console.error('❌ Erreur profil:', profileError.message);
    console.log('\n🔍 Cause possible:');
    console.log('   - Le trigger handle_new_user() n\'existe pas');
    console.log('   - Les RLS policies bloquent l\'insertion');
    console.log('\n💡 Solution: Exécute la migration 03_auth_admin.sql dans Supabase');
    return;
  }

  if (!profile) {
    console.error('❌ Profil non créé');
    return;
  }

  console.log('✅ Profil créé:', profile.id);
  console.log('📧 Email:', profile.email);
  console.log('👤 Nom:', profile.full_name);
  console.log('🔐 Admin:', profile.is_admin);
  console.log('');

  // Test 3: Connexion
  console.log('⏳ Étape 3: Test de connexion...');
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (loginError) {
    console.error('❌ Erreur login:', loginError.message);
    return;
  }

  console.log('✅ Connexion réussie');
  console.log('');

  // Nettoyage
  console.log('🧹 Nettoyage...');
  await supabase.auth.signOut();

  console.log('');
  console.log('🎉 TOUS LES TESTS PASSÉS !');
  console.log('✅ Le système d\'authentification fonctionne correctement');
}

testSignup().catch(console.error);

