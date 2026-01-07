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
        {/* Sidebar (fixe, 256px) */}
        <AdminSidebar />

        {/* Zone de contenu (décalée de 256px pour la sidebar) */}
        <main className="flex-1 ml-64">
          {/* Header secondaire (masqué si embed=true) */}
          <AdminHeader />

          {/* Contenu de la page */}
          <div className="p-8">{children}</div>
        </main>
      </div>
    </AuthGuard>
  );
}
