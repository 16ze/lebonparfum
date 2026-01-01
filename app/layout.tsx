import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MenuOverlay from "@/components/layout/MenuOverlay";
import { MenuProvider } from "@/context/MenuContext";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HÉRITAGE - Parfums de Niche",
  description: "Revendeur de parfums de niche",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="antialiased font-sans bg-white text-black">
        <MenuProvider>
          <SmoothScroll>
            <Header />
            <MenuOverlay />
            {children}
            <Footer />
          </SmoothScroll>
        </MenuProvider>
      </body>
    </html>
  );
}
