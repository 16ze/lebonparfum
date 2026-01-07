"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { validateEmail, validatePassword } from "@/lib/validators";

/**
 * Server Action: Login utilisateur
 *
 * @param email - Email de l'utilisateur
 * @param password - Mot de passe
 * @returns Objet avec success, isAdmin et error
 */
export async function loginAction(email: string, password: string) {
  try {
    // Validation basique
    if (!validateEmail(email)) {
      return {
        success: false,
        isAdmin: false,
        error: "Email invalide",
      };
    }

    if (!password || password.length === 0) {
      return {
        success: false,
        isAdmin: false,
        error: "Mot de passe requis",
      };
    }

    const supabase = await createClient();

    // Tentative de connexion
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("❌ Erreur login Supabase:", error.message);
      return {
        success: false,
        isAdmin: false,
        error: "Email ou mot de passe incorrect",
      };
    }

    if (!data.user) {
      return {
        success: false,
        isAdmin: false,
        error: "Erreur lors de la connexion",
      };
    }

    // Récupérer le profil pour vérifier is_admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", data.user.id)
      .single();

    if (profileError) {
      console.error("❌ Erreur récupération profil:", profileError.message);
      return {
        success: false,
        isAdmin: false,
        error: "Erreur lors de la récupération du profil",
      };
    }

    return {
      success: true,
      isAdmin: profile?.is_admin || false,
      error: null,
    };
  } catch (error) {
    console.error("❌ Erreur inattendue login:", error);
    return {
      success: false,
      isAdmin: false,
      error: "Erreur inattendue lors de la connexion",
    };
  }
}

/**
 * Server Action: Créer un compte utilisateur
 *
 * @param email - Email du nouvel utilisateur
 * @param password - Mot de passe
 * @param fullName - Nom complet
 * @returns Objet avec success et error
 */
export async function signupAction(
  email: string,
  password: string,
  fullName: string
) {
  try {
    // Validations
    if (!validateEmail(email)) {
      return {
        success: false,
        error: "Email invalide",
      };
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return {
        success: false,
        error: passwordValidation.errors.join(", "),
      };
    }

    if (!fullName || fullName.trim().length === 0) {
      return {
        success: false,
        error: "Le nom complet est requis",
      };
    }

    const supabase = await createClient();

    // Création du compte Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName.trim(),
        },
      },
    });

    if (error) {
      console.error("❌ Erreur signup Supabase:", error.message);

      // Messages d'erreur personnalisés
      if (error.message.includes("already registered")) {
        return {
          success: false,
          error: "Cet email est déjà utilisé",
        };
      }

      return {
        success: false,
        error: error.message,
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: "Erreur lors de la création du compte",
      };
    }

    // Créer le profil manuellement (plus fiable que le trigger)
    // Attendre un peu que l'utilisateur soit bien créé dans auth.users
    await new Promise((resolve) => setTimeout(resolve, 100));

    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: data.user.id,
        email: data.user.email!,
        full_name: fullName.trim(),
        is_admin: false,
      });

    if (profileError) {
      // Si le profil existe déjà (par exemple via le trigger), ignorer l'erreur
      if (!profileError.message.includes("duplicate key")) {
        console.error("❌ Erreur création profil:", profileError.message);
        // Ne pas échouer le signup si le profil existe déjà
      }
    }

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error("❌ Erreur inattendue signup:", error);
    return {
      success: false,
      error: "Erreur inattendue lors de la création du compte",
    };
  }
}

/**
 * Server Action: Connexion avec Google OAuth
 *
 * Initialise le flow OAuth avec Google
 * Redirige vers la page de consentement Google
 */
export async function loginWithGoogleAction() {
  try {
    const supabase = await createClient();

    // Récupérer l'URL de callback (origin + /auth/callback?next=/)
    // On redirige vers la home page après connexion Google
    const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const redirectTo = `${origin}/auth/callback?next=/`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      console.error("❌ Erreur OAuth Google:", error.message);
      return {
        success: false,
        url: null,
        error: error.message,
      };
    }

    // Retourner l'URL de redirection vers Google
    return {
      success: true,
      url: data.url,
      error: null,
    };
  } catch (error) {
    console.error("❌ Erreur inattendue Google OAuth:", error);
    return {
      success: false,
      url: null,
      error: "Erreur lors de la connexion avec Google",
    };
  }
}

/**
 * Server Action: Demander un reset de mot de passe
 *
 * @param email - Email de l'utilisateur
 * @returns Objet avec success et error
 */
export async function forgotPasswordAction(email: string) {
  try {
    if (!validateEmail(email)) {
      return {
        success: false,
        error: "Email invalide",
      };
    }

    const supabase = await createClient();

    // Récupérer l'URL de callback
    const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const redirectTo = `${origin}/auth/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      console.error("❌ Erreur reset password Supabase:", error.message);
      return {
        success: false,
        error: error.message,
      };
    }

    // Retourner success même si l'email n'existe pas (sécurité)
    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error("❌ Erreur inattendue forgot password:", error);
    return {
      success: false,
      error: "Erreur lors de l'envoi de l'email",
    };
  }
}

/**
 * Server Action: Réinitialiser le mot de passe
 *
 * @param password - Nouveau mot de passe
 * @returns Objet avec success et error
 */
export async function resetPasswordAction(password: string) {
  try {
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return {
        success: false,
        error: passwordValidation.errors.join(", "),
      };
    }

    const supabase = await createClient();

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      console.error("❌ Erreur update password Supabase:", error.message);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error("❌ Erreur inattendue reset password:", error);
    return {
      success: false,
      error: "Erreur lors de la réinitialisation du mot de passe",
    };
  }
}

/**
 * Server Action: Déconnexion utilisateur
 *
 * Déconnecte l'utilisateur et redirige vers la home
 */
export async function logoutAction() {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("❌ Erreur logout Supabase:", error.message);
    }
  } catch (error) {
    console.error("❌ Erreur inattendue logout:", error);
  }

  // Rediriger vers la home dans tous les cas
  redirect("/");
}
