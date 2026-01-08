import AuthGuard from "@/components/auth/AuthGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

/**
 * Layout Admin - Wrapper pour toutes les pages admin
 *
 * Structure :
 * - AuthGuard (requireAdmin=true) pour protéger les routes
 * - Sidebar fixe à gauche (256px)
 * - Zone de contenu à droite avec padding
 *
 * Design Byredo :
 * - Sidebar noire
 * - Contenu sur fond blanc
 * - Header interne masqué si ?embed=true (pour ProfileDrawer)
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requireAdmin={true}>
      <div className="flex min-h-screen bg-white">
        {/* Sidebar (drawer sur mobile, fixe sur desktop) */}
        <AdminSidebar />

        {/* Zone de contenu (responsive) */}
        <main className="flex-1 md:ml-64 w-full">
          {/* Header secondaire (masqué si embed=true) */}
          <AdminHeader />

          {/* Contenu de la page (padding responsive) */}
          <div className="p-4 md:p-8">{children}</div>
        </main>
      </div>
    </AuthGuard>
  );
}
