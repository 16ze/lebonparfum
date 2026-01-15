"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, ShoppingBag, Settings, LogOut, X, Menu, FolderTree, Tag, AlertTriangle } from "lucide-react";
import { logoutAction } from "@/app/login/actions";
import { clsx } from "clsx";
import { useState, useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * AdminSidebar - Navigation latérale pour l'admin
 *
 * Design Byredo :
 * - Fond noir
 * - Texte blanc
 * - Border-l blanc sur l'item actif
 * - Icons Lucide React (stroke width fin)
 * - RESPONSIVE : Drawer sur mobile, sidebar fixe sur desktop
 */

const navigation = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: Home,
  },
  {
    name: "Produits",
    href: "/admin/products",
    icon: Package,
  },
  {
    name: "Alertes Stock",
    href: "/admin/stock-alerts",
    icon: AlertTriangle,
  },
  {
    name: "Catégories",
    href: "/admin/categories",
    icon: FolderTree,
  },
  {
    name: "Tags",
    href: "/admin/tags",
    icon: Tag,
  },
  {
    name: "Commandes",
    href: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    name: "Paramètres",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Toggle sidebar sur mobile
  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  // Animation GSAP pour le drawer mobile
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (!isMobile) return; // Pas d'animation sur desktop

    const ctx = gsap.context(() => {
      if (isOpen) {
        // Ouvrir : slide depuis la gauche
        gsap.fromTo(
          sidebarRef.current,
          { x: "-100%", visibility: "visible" },
          { x: 0, duration: 0.4, ease: "power3.out" }
        );
        if (overlayRef.current) {
          gsap.to(overlayRef.current, {
            opacity: 1,
            visibility: "visible",
            duration: 0.3,
          });
        }
      } else {
        // Fermer : slide vers la gauche
        gsap.to(sidebarRef.current, {
          x: "-100%",
          duration: 0.3,
          ease: "power2.in",
          onComplete: () => {
            if (sidebarRef.current) {
              sidebarRef.current.style.visibility = "hidden";
            }
          },
        });
        if (overlayRef.current) {
          gsap.to(overlayRef.current, {
            opacity: 0,
            visibility: "hidden",
            duration: 0.2,
          });
        }
      }
    });

    return () => ctx.revert();
  }, [isOpen]);

  // Fermer la sidebar lors de la navigation sur mobile
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile && isOpen) {
      closeSidebar();
    }
  }, [pathname]);

  const handleLogout = async () => {
    await logoutAction();
  };

  return (
    <>
      {/* Bouton Menu sur mobile */}
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-black text-white flex items-center justify-center rounded-sm shadow-lg"
        aria-label="Ouvrir le menu"
      >
        <Menu className="w-5 h-5" strokeWidth={1.5} />
      </button>

      {/* Overlay sur mobile */}
      <div
        ref={overlayRef}
        className="md:hidden fixed inset-0 bg-black/60 z-[40] opacity-0 invisible"
        onClick={closeSidebar}
        style={{ visibility: isOpen ? "visible" : "hidden" }}
      />

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={clsx(
          "bg-black text-white flex flex-col h-screen",
          // Desktop : toujours visible, fixe à gauche
          "md:fixed md:left-0 md:top-0 md:w-64 md:z-30 md:visible",
          // Mobile : drawer
          "fixed left-0 top-0 w-64 z-[50]"
        )}
        style={{
          // Sur desktop, toujours visible. Sur mobile, géré par l'animation GSAP
          visibility: typeof window !== "undefined" && window.innerWidth >= 768 ? "visible" : undefined,
        }}
      >
        {/* Header avec bouton fermer sur mobile */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h1 className="text-xl uppercase tracking-widest font-bold">
              THE PARFUMERIEE
            </h1>
            <p className="text-xs uppercase tracking-widest text-white/50 mt-1">
              Administration
            </p>
          </div>
          {/* Bouton fermer sur mobile */}
          <button
            onClick={closeSidebar}
            className="md:hidden w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded transition-colors"
            aria-label="Fermer le menu"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => {
                  // Fermer la sidebar sur mobile après clic
                  if (window.innerWidth < 768) {
                    closeSidebar();
                  }
                }}
                className={clsx(
                  "flex items-center gap-3 px-6 py-3 text-sm uppercase tracking-wider transition-colors",
                  isActive
                    ? "bg-white/5 border-l-2 border-white text-white"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className="w-5 h-5" strokeWidth={1.5} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bouton Déconnexion */}
        <div className="p-6 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-sm uppercase tracking-wider text-white/60 hover:text-white transition-colors w-full"
          >
            <LogOut className="w-5 h-5" strokeWidth={1.5} />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
}
