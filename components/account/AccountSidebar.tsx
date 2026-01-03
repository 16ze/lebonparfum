"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Package, LogOut, MapPin, Heart, Key } from "lucide-react";
import clsx from "clsx";
import { logoutAction } from "@/app/login/actions";

/**
 * AccountSidebar - Navigation de l'espace client
 *
 * Design Byredo Amélioré :
 * - Fond blanc, texte noir
 * - Bordure droite 1px
 * - Uppercase tracking-widest
 * - Active state avec bordure gauche noire épaisse
 * - Transitions fluides GSAP-style
 * - Hover states subtils
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
      description: "Informations personnelles",
    },
    {
      name: "Mes Commandes",
      href: "/account/orders",
      icon: Package,
      description: "Historique d'achats",
    },
    {
      name: "Mes Adresses",
      href: "/account/addresses",
      icon: MapPin,
      description: "Adresses de livraison",
    },
    {
      name: "Ma Wishlist",
      href: "/account/wishlist",
      icon: Heart,
      description: "Produits favoris",
    },
    {
      name: "Sécurité",
      href: "/account/security",
      icon: Key,
      description: "Mot de passe",
    },
  ];

  const handleLogout = async () => {
    await logoutAction();
  };

  return (
    <aside className="w-full md:w-80 bg-white border-b md:border-b-0 md:border-r border-black/10 md:min-h-screen md:sticky md:top-20">
      {/* Header User Info - Amélioré */}
      <div className="p-6 md:p-8 border-b border-black/10">
        <h2 className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-3">
          Mon Compte
        </h2>
        <div className="flex items-center gap-4">
          {/* Avatar Circle */}
          <div className="w-12 h-12 bg-black text-white flex items-center justify-center text-lg font-bold uppercase">
            {(user.full_name || user.email)?.[0] || "U"}
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm truncate">
              {user.full_name || "Utilisateur"}
            </p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation Links - Amélioré */}
      <nav className="p-4">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={clsx(
                    "group flex items-start gap-3 px-4 py-4 text-xs uppercase tracking-[0.15em] transition-all duration-300 border-l-2 relative overflow-hidden",
                    isActive
                      ? "border-black text-black font-bold bg-black/5"
                      : "border-transparent text-gray-500 hover:text-black hover:bg-black/[0.02] hover:border-gray-300"
                  )}
                >
                  {/* Icon */}
                  <Icon
                    size={18}
                    strokeWidth={isActive ? 2 : 1.5}
                    className="mt-0.5 transition-transform duration-300 group-hover:scale-110"
                  />

                  {/* Text */}
                  <div className="flex-1">
                    <span className="block">{item.name}</span>
                    <span className="text-[10px] normal-case tracking-normal text-gray-400 mt-1 block">
                      {item.description}
                    </span>
                  </div>
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

