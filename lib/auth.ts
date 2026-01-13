import { createClient } from "@/utils/supabase/server";

/**
 * Helpers d'authentification pour les Server Actions
 */

interface AuthResult {
  isAuthenticated: boolean;
  isAdmin: boolean;
  userId: string | null;
  error: string | null;
}

/**
 * Vérifie si l'utilisateur actuel est authentifié et admin
 *
 * Utilisation dans les Server Actions :
 * ```typescript
 * const auth = await checkIsAdmin();
 * if (!auth.isAdmin) {
 *   return { success: false, error: auth.error || "Accès refusé" };
 * }
 * ```
 *
 * @returns Objet avec isAdmin, isAuthenticated, userId, error
 */
export async function checkIsAdmin(): Promise<AuthResult> {
  try {
    const supabase = await createClient();

    // Vérifier l'authentification
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        isAuthenticated: false,
        isAdmin: false,
        userId: null,
        error: "Non authentifié. Veuillez vous connecter.",
      };
    }

    // Vérifier le rôle admin dans la table profiles
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("❌ Erreur récupération profil:", profileError);
      return {
        isAuthenticated: true,
        isAdmin: false,
        userId: user.id,
        error: "Erreur lors de la vérification des permissions.",
      };
    }

    if (!profile || !profile.is_admin) {
      return {
        isAuthenticated: true,
        isAdmin: false,
        userId: user.id,
        error: "Accès refusé. Droits administrateur requis.",
      };
    }

    // Succès : utilisateur authentifié ET admin
    return {
      isAuthenticated: true,
      isAdmin: true,
      userId: user.id,
      error: null,
    };
  } catch (error) {
    console.error("❌ Erreur checkIsAdmin:", error);
    return {
      isAuthenticated: false,
      isAdmin: false,
      userId: null,
      error: "Erreur serveur lors de la vérification des permissions.",
    };
  }
}

/**
 * Vérifie uniquement si l'utilisateur est authentifié (pas besoin d'être admin)
 *
 * @returns Objet avec isAuthenticated, userId, error
 */
export async function checkIsAuthenticated(): Promise<Omit<AuthResult, "isAdmin">> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        isAuthenticated: false,
        userId: null,
        error: "Non authentifié. Veuillez vous connecter.",
      };
    }

    return {
      isAuthenticated: true,
      userId: user.id,
      error: null,
    };
  } catch (error) {
    console.error("❌ Erreur checkIsAuthenticated:", error);
    return {
      isAuthenticated: false,
      userId: null,
      error: "Erreur serveur lors de la vérification d'authentification.",
    };
  }
}
