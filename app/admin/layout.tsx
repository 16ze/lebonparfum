import AuthGuard from "@/components/auth/AuthGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";

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
          {/* Header secondaire (optionnel) */}
          <div className="border-b border-black/10 bg-white">
            <div className="px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xs uppercase tracking-widest text-gray-400">
                    Espace Administration
                  </h2>
                </div>
              </div>
            </div>
          </div>

          {/* Contenu de la page */}
          <div className="p-8">{children}</div>
        </main>
      </div>
    </AuthGuard>
  );
}
