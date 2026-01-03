import SmoothScroll from "@/components/SmoothScroll";
import AuthDrawer from "@/components/auth/AuthDrawer";
import CartDrawer from "@/components/cart/CartDrawer";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import MenuOverlayWrapper from "@/components/layout/MenuOverlayWrapper";
import SearchOverlayWrapper from "@/components/layout/SearchOverlayWrapper";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { CheckoutProvider } from "@/context/CheckoutContext";
import { MenuProvider } from "@/context/MenuContext";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LE BON PARFUM - Parfums de Niche & Dupes de Luxe",
  description: "Revendeur de parfums de niche et dupes de luxe",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="antialiased font-sans bg-white text-black">
        <AuthProvider>
          <CartProvider>
            <CheckoutProvider>
              <MenuProvider>
                <SmoothScroll>
                  <ConditionalLayout>
                    <MenuOverlayWrapper />
                    <SearchOverlayWrapper />
                    <AuthDrawer />
                    <CartDrawer />
                    {children}
                  </ConditionalLayout>
                </SmoothScroll>
              </MenuProvider>
            </CheckoutProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
