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
 * - Écoute des changements d'état d'authentification
 * - Rafraîchissement automatique de la session
 */

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthDrawerOpen: boolean;
  openAuthDrawer: () => void;
  closeAuthDrawer: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthDrawerOpen, setIsAuthDrawerOpen] = useState(false);

  /**
   * Récupérer l'utilisateur connecté au montage du composant
   */
  useEffect(() => {
    const supabase = createClient();

    // Récupération initiale de l'utilisateur
    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error("❌ Erreur lors de la récupération de l'utilisateur:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    getUser();

    // Écouter les changements d'authentification (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("🔐 État d'authentification changé:", _event);
      setUser(session?.user ?? null);
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
   * Rafraîchir manuellement l'utilisateur
   * Utile après un login/signup pour mettre à jour l'état immédiatement
   */
  const refreshUser = async () => {
    const supabase = createClient();
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
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

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthDrawerOpen,
        openAuthDrawer,
        closeAuthDrawer,
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

