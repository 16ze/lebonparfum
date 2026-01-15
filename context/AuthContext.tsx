"use client";

import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

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
  setIsLoggingOut: (value: boolean) => void;
  isLoggingOut: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // États UI
  const [isAuthDrawerOpen, setIsAuthDrawerOpen] = useState(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);
  const [currentProfileView, setCurrentProfileView] = useState<ProfileView>("profile");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Fonction dédiée pour vérifier le rôle admin
  // Utilise l'EMAIL comme identifiant unique (compatible avec Google OAuth et mot de passe)
  const checkAdminRole = useCallback(async (email: string | undefined) => {
    if (!email) {
      console.log("⚠️ [AUTH] Pas d'email fourni - isAdmin = false");
      setIsAdmin(false);
      return;
    }
    
    console.log("🕵️‍♂️ [AUTH] Vérification rôle DB pour l'email :", email);
    
    const supabase = createClient();
    // On interroge la DB pour savoir si cet email a les droits admin
    // maybeSingle() évite l'erreur si pas de profil trouvé
    const { data, error } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      console.error("❌ [AUTH] Erreur lecture profil :", error.message);
      console.error("❌ [AUTH] Détails erreur :", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      setIsAdmin(false);
      return;
    }

    // La vérité vient uniquement de la DB
    const dbIsAdmin = data?.is_admin === true;
    console.log("✅ [AUTH] Statut Admin DB :", dbIsAdmin, "(is_admin dans DB:", data?.is_admin, ")");
    
    setIsAdmin(dbIsAdmin);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    
    // 1. Initialisation
    const initAuth = async () => {
      console.log("🚀 [AUTH] Initialisation de l'authentification...");
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        console.log("👤 [AUTH] Utilisateur trouvé :", user.email);
        await checkAdminRole(user.email);
      } else {
        console.log("⚠️ [AUTH] Aucun utilisateur connecté");
        setIsAdmin(false);
      }
      setIsLoading(false);
    };

    initAuth();

    // 2. Écoute temps réel
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔔 [AUTH] Changement état :", event, "session:", session ? "présente" : "null");
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      // Si déconnexion, nettoyer immédiatement l'état
      if (event === "SIGNED_OUT") {
        console.log("🔒 [AUTH] ========== SIGNED_OUT DÉTECTÉ ==========");
        setUser(null);
        setIsAdmin(false);
        setIsProfileDrawerOpen(false);
        setIsProfileExpanded(false);
        setIsLoading(false);
        setIsLoggingOut(false);
        setIsAuthDrawerOpen(true);
        console.log("✅ [AUTH] État nettoyé - AuthDrawer ouvert");
        console.log("🔒 [AUTH] ========== FIN SIGNED_OUT ==========");
        return;
      }

      if (currentUser) {
        console.log("👤 [AUTH] Utilisateur connecté :", currentUser.email);
        await checkAdminRole(currentUser.email);
      } else {
        console.log("⚠️ [AUTH] Aucun utilisateur dans la session");
        setIsAdmin(false);
      }
      
      setIsLoading(false);

      // Si l'utilisateur se connecte, fermer l'AuthDrawer
      if (event === "SIGNED_IN") {
        setIsAuthDrawerOpen(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [checkAdminRole]);

  // Refresh manuel
  const refreshUser = async () => {
    console.log("🔄 [AUTH] Refresh manuel de l'utilisateur...");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      console.log("👤 [AUTH] Utilisateur trouvé lors du refresh :", user.email);
      await checkAdminRole(user.email);
    } else {
      console.log("⚠️ [AUTH] Aucun utilisateur lors du refresh");
      setIsAdmin(false);
    }
  };

  // Fonctions UI (Drawers)
  const openAuthDrawer = () => {
    console.log("🔓 [AUTH] Ouverture de l'AuthDrawer");
    setIsAuthDrawerOpen(true);
  };

  const closeAuthDrawer = () => {
    console.log("🔒 [AUTH] Fermeture de l'AuthDrawer");
    setIsAuthDrawerOpen(false);
  };

  const openProfileDrawer = (view: ProfileView = "profile") => {
    // CRITIQUE : Ne pas ouvrir le drawer pendant la déconnexion
    if (isLoggingOut) {
      console.log("🚫 [AUTH] Ouverture du ProfileDrawer bloquée - Déconnexion en cours");
      return;
    }
    
    console.log("👤 [AUTH] Ouverture du ProfileDrawer -", view);
    setCurrentProfileView(view);
    setIsProfileDrawerOpen(true);
    setIsProfileExpanded(false);
  };

  const closeProfileDrawer = () => {
    console.log("👤 [AUTH] Fermeture du ProfileDrawer");
    setIsProfileDrawerOpen(false);
    setIsProfileExpanded(false);
  };

  const toggleExpand = () => {
    console.log("🔲 [AUTH] Toggle expand:", !isProfileExpanded);
    setIsProfileExpanded(!isProfileExpanded);
  };

  const setProfileView = (view: ProfileView) => {
    console.log("👤 [AUTH] Changement de vue:", view);
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
        setIsLoggingOut,
        isLoggingOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
