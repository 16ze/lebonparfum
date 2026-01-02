"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, ShoppingBag, Settings, LogOut } from "lucide-react";
import { logoutAction } from "@/app/login/actions";
import { clsx } from "clsx";

/**
 * AdminSidebar - Navigation latérale pour l'admin
 *
 * Design Byredo :
 * - Fond noir
 * - Texte blanc
 * - Border-l blanc sur l'item actif
 * - Icons Lucide React (stroke width fin)
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

  const handleLogout = async () => {
    await logoutAction();
  };

  return (
    <aside className="w-64 bg-black text-white flex flex-col h-screen fixed left-0 top-0">
      {/* Logo / Titre */}
      <div className="p-6 border-b border-white/10">
        <h1 className="text-xl uppercase tracking-widest font-bold">
          Le Bon Parfum
        </h1>
        <p className="text-xs uppercase tracking-widest text-white/50 mt-1">
          Administration
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
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
  );
}
