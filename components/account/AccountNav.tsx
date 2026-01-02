"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, Package, MapPin, LogOut } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

/**
 * Navigation Espace Client
 *
 * Liens :
 * - Mon profil
 * - Mes commandes
 * - Mes adresses
 * - Déconnexion
 *
 * Design Byredo : Navigation verticale minimaliste
 */

type AccountNavProps = {
  userName: string;
};

export default function AccountNav({ userName }: AccountNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const links = [
    {
      href: "/account/profile",
      label: "Mon Profil",
      icon: User,
    },
    {
      href: "/account/orders",
      label: "Mes Commandes",
      icon: Package,
    },
    {
      href: "/account/addresses",
      label: "Mes Adresses",
      icon: MapPin,
    },
  ];

  // Déconnexion
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="space-y-8">
      {/* Nom de l'utilisateur */}
      <div className="border-b border-black/10 pb-6">
        <h2 className="text-2xl uppercase tracking-widest font-bold">
          {userName}
        </h2>
        <p className="text-xs uppercase tracking-wider text-gray-500 mt-2">
          Espace Client
        </p>
      </div>

      {/* Liens de navigation */}
      <nav className="space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 text-sm uppercase tracking-wider transition-colors ${
                isActive
                  ? "bg-black text-white"
                  : "text-gray-700 hover:bg-black/5"
              }`}
            >
              <Icon className="w-4 h-4" strokeWidth={1.5} />
              {link.label}
            </Link>
          );
        })}

        {/* Bouton Déconnexion */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm uppercase tracking-wider text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" strokeWidth={1.5} />
          Déconnexion
        </button>
      </nav>
    </div>
  );
}

