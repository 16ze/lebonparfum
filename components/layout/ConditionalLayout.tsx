"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";

/**
 * ConditionalLayout - Affiche Header et Footer sauf sur certaines routes
 *
 * Routes sans Header/Footer :
 * - /checkout (page de paiement distraction-free)
 */
export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Routes où on ne veut pas afficher Header et Footer
  const hiddenRoutes = ["/checkout"];
  const shouldHideLayout = hiddenRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (shouldHideLayout) {
    // Sur checkout, on affiche juste les enfants (pas de Header/Footer)
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

