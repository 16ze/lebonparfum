import SmoothScroll from "@/components/SmoothScroll";
import CartDrawer from "@/components/cart/CartDrawer";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import MenuOverlayWrapper from "@/components/layout/MenuOverlayWrapper";
import { CartProvider } from "@/context/CartContext";
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
        <CartProvider>
          <MenuProvider>
            <SmoothScroll>
              <Header />
              <MenuOverlayWrapper />
              <CartDrawer />
              {children}
              <Footer />
            </SmoothScroll>
          </MenuProvider>
        </CartProvider>
      </body>
    </html>
  );
}
