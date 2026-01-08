"use client";

import { useAuth } from "@/context/AuthContext";
import { usePathname, useSearchParams } from "next/navigation";
import Footer from "./Footer";
import Header from "./Header";

/**
 * ConditionalLayout - Affiche Header et Footer sauf sur certaines routes
 *
 * Routes sans Header/Footer :
 * - /checkout (page de paiement distraction-free)
 * - Toute page avec ?embed=true (iframe mode)
 * - ProfileDrawer ouvert (pour une expérience immersive)
 */
export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isProfileDrawerOpen, isProfileExpanded } = useAuth();
  const isEmbedMode = searchParams.get("embed") === "true";
  
  // Routes où on ne veut pas afficher Header et Footer
  const hiddenRoutes = ["/checkout", "/admin"];
  const shouldHideLayout = 
    hiddenRoutes.some((route) => pathname.startsWith(route)) || 
    isEmbedMode || // Masquer si mode embed
    (isProfileDrawerOpen && isProfileExpanded); // Masquer si ProfileDrawer est ouvert ET expanded

  if (shouldHideLayout) {
    // Sur checkout, mode embed ou ProfileDrawer ouvert, on affiche juste les enfants (pas de Header/Footer)
    return <>{children}</>;
  }

  // Sur les autres pages, on affiche Header et Footer
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}

