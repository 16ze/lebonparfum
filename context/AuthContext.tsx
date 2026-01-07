"use client";

import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

/**
 * AuthContext - Gestion de l'authentification côté client
 *
 * Fonctionnalités :
 * - Récupération de l'utilisateur connecté
 * - Gestion de l'overlay d'authentification (AuthDrawer)
 * - Gestion de l'overlay de profil (ProfileDrawer)
 * - Écoute des changements d'état d'authentification
 * - Rafraîchissement automatique de la session
 */

type ProfileView = "profile" | "orders" | "wishlist" | "dashboard" | "products" | "settings";

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  isAuthDrawerOpen: boolean;
  openAuthDrawer: () => void;
  closeAuthDrawer: () => void;
  isProfileDrawerOpen: boolean;
  isProfileExpanded: boolean;
  currentProfileView: ProfileView;
  openProfileDrawer: (view?: ProfileView) => void;
  closeProfileDrawer: () => void;
  toggleExpand: () => void;
  setProfileView: (view: ProfileView) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthDrawerOpen, setIsAuthDrawerOpen] = useState(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);
  const [currentProfileView, setCurrentProfileView] = useState<ProfileView>("profile");

  /**
   * Récupérer l'utilisateur connecté au montage du composant
   */
  useEffect(() => {
    const supabase = createClient();

    // Récupération initiale de l'utilisateur et statut admin
    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);

        // Si utilisateur connecté, récupérer le statut admin
        if (user) {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("is_admin")
            .eq("id", user.id)
            .single();
          
          if (profileError) {
            console.error("❌ Erreur récupération profil pour isAdmin:", profileError);
            setIsAdmin(false);
          } else {
            console.log("✅ Statut admin récupéré:", profile?.is_admin, "pour user:", user.email);
            setIsAdmin(profile?.is_admin || false);
          }
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("❌ Erreur lors de la récupération de l'utilisateur:", error);
        setUser(null);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    getUser();

    // Écouter les changements d'authentification (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("🔐 État d'authentification changé:", _event);
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      // Si utilisateur connecté, récupérer le statut admin
      if (currentUser) {
        try {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("is_admin")
            .eq("id", currentUser.id)
            .single();
          
          if (profileError) {
            console.error("❌ Erreur récupération profil pour isAdmin:", profileError);
            setIsAdmin(false);
          } else {
            console.log("✅ Statut admin mis à jour:", profile?.is_admin, "pour user:", currentUser.email);
            setIsAdmin(profile?.is_admin || false);
          }
        } catch (error) {
          console.error("❌ Erreur récupération profil:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }

      setIsLoading(false);

      // Si l'utilisateur se connecte, fermer l'AuthDrawer
      if (_event === "SIGNED_IN") {
        setIsAuthDrawerOpen(false);
      }
    });

    // Cleanup : se désabonner lors du démontage
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Rafraîchir manuellement l'utilisateur et statut admin
   * Utile après un login/signup pour mettre à jour l'état immédiatement
   */
  const refreshUser = async () => {
    const supabase = createClient();
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      // Récupérer le statut admin
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();
        
        if (profileError) {
          console.error("❌ Erreur récupération profil dans refreshUser:", profileError);
          setIsAdmin(false);
        } else {
          console.log("✅ Statut admin rafraîchi:", profile?.is_admin);
          setIsAdmin(profile?.is_admin || false);
        }
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error("❌ Erreur lors du rafraîchissement de l'utilisateur:", error);
    }
  };

  /**
   * Ouvrir l'overlay d'authentification
   */
  const openAuthDrawer = () => {
    console.log("🔓 Ouverture de l'AuthDrawer");
    setIsAuthDrawerOpen(true);
  };

  /**
   * Fermer l'overlay d'authentification
   */
  const closeAuthDrawer = () => {
    console.log("🔒 Fermeture de l'AuthDrawer");
    setIsAuthDrawerOpen(false);
  };

  /**
   * Ouvrir le ProfileDrawer
   * @param view - Vue à afficher (profile, orders, wishlist)
   */
  const openProfileDrawer = (view: ProfileView = "profile") => {
    console.log("👤 Ouverture du ProfileDrawer -", view);
    setCurrentProfileView(view);
    setIsProfileDrawerOpen(true);
    setIsProfileExpanded(false); // Toujours ouvrir en mode normal
  };

  /**
   * Fermer le ProfileDrawer
   */
  const closeProfileDrawer = () => {
    console.log("👤 Fermeture du ProfileDrawer");
    setIsProfileDrawerOpen(false);
    setIsProfileExpanded(false);
  };

  /**
   * Toggle entre mode normal et plein écran
   */
  const toggleExpand = () => {
    console.log("🔲 Toggle expand:", !isProfileExpanded);
    setIsProfileExpanded(!isProfileExpanded);
  };

  /**
   * Changer la vue du profil
   */
  const setProfileView = (view: ProfileView) => {
    console.log("👤 Changement de vue:", view);
    setCurrentProfileView(view);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isLoading,
        isAuthDrawerOpen,
        openAuthDrawer,
        closeAuthDrawer,
        isProfileDrawerOpen,
        isProfileExpanded,
        currentProfileView,
        openProfileDrawer,
        closeProfileDrawer,
        toggleExpand,
        setProfileView,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook personnalisé pour utiliser le AuthContext
 * Vérifie que le contexte est utilisé à l'intérieur d'un AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

