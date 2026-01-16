import SmoothScroll from "@/components/SmoothScroll";
import AuthDrawer from "@/components/auth/AuthDrawer";
import CartDrawer from "@/components/cart/CartDrawer";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import CookieConsent from "@/components/layout/CookieConsent";
import MenuOverlayWrapper from "@/components/layout/MenuOverlayWrapper";
import SkipLinks from "@/components/layout/SkipLinks";
import SearchOverlayWrapper from "@/components/layout/SearchOverlayWrapper";
import ProfileDrawer from "@/components/profile/ProfileDrawer";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { CheckoutProvider } from "@/context/CheckoutContext";
import { MenuProvider } from "@/context/MenuContext";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { DEFAULT_METADATA } from "@/lib/metadata";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = DEFAULT_METADATA;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="antialiased font-sans bg-white text-black">
        <SkipLinks />
        <AuthProvider>
          <CartProvider>
            <CheckoutProvider>
              <MenuProvider>
                <SmoothScroll>
                  <ConditionalLayout>
                    <MenuOverlayWrapper />
                    <SearchOverlayWrapper />
                    <AuthDrawer />
                    <ProfileDrawer />
                    <CartDrawer />
                    {children}
                  </ConditionalLayout>
                </SmoothScroll>
              </MenuProvider>
            </CheckoutProvider>
          </CartProvider>
        </AuthProvider>
        <CookieConsent />
      </body>
    </html>
  );
}
