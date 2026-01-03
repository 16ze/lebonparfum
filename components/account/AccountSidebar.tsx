"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Package, LogOut, MapPin } from "lucide-react";
import clsx from "clsx";
import { logoutAction } from "@/app/login/actions";

/**
 * AccountSidebar - Navigation de l'espace client
 *
 * Design Byredo :
 * - Fond blanc, texte noir
 * - Bordure droite 1px
 * - Uppercase tracking-widest
 * - Active state avec bordure gauche noire épaisse
 */

interface AccountSidebarProps {
  user: {
    email: string;
    full_name: string | null;
  };
}

export default function AccountSidebar({ user }: AccountSidebarProps) {
  const pathname = usePathname();

  const navigation = [
    {
      name: "Mon Profil",
      href: "/account/profile",
      icon: User,
    },
    {
      name: "Mes Commandes",
      href: "/account/orders",
      icon: Package,
    },
    {
      name: "Mes Adresses",
      href: "/account/addresses",
      icon: MapPin,
    },
  ];

  const handleLogout = async () => {
    await logoutAction();
  };

  return (
    <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-black/10 md:min-h-screen">
      {/* Header User Info */}
      <div className="p-6 border-b border-black/10">
        <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-2">
          Mon Compte
        </h2>
        <p className="font-medium text-sm">{user.full_name || "Utilisateur"}</p>
        <p className="text-xs text-gray-500 mt-1">{user.email}</p>
      </div>

      {/* Navigation Links */}
      <nav className="p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-widest transition-all border-l-2",
                    isActive
                      ? "border-black text-black font-bold bg-black/5"
                      : "border-transparent text-gray-500 hover:text-black hover:border-gray-300"
                  )}
                >
                  <Icon size={16} strokeWidth={1.5} />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 mt-auto border-t border-black/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-widest text-red-600 hover:text-red-700 hover:bg-red-50 transition-all w-full"
        >
          <LogOut size={16} strokeWidth={1.5} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}

