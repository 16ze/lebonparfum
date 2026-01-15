import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import { AlertTriangle } from "lucide-react";
import StockQuickUpdateButton from "@/components/admin/StockQuickUpdateButton";
import { shimmer, toBase64 } from "@/lib/image-placeholders";

/**
 * Page Admin - Alertes Stock
 *
 * Vue de pilotage pour identifier et réapprovisionner rapidement
 * les produits en rupture ou stock faible
 *
 * Affiche:
 * - Produits en rupture de stock (stock = 0)
 * - Produits en stock faible (stock > 0 ET stock <= 5)
 * - Actions rapides pour modifier le stock (+5, +10, Custom)
 */

interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  price: number;
  stock: number;
  image_url: string | null;
  status: string;
}

export default async function StockAlertsPage() {
  const supabase = await createClient();

  // Vérifier authentification admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Vérifier rôle admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/");
  }

  // Récupérer les produits en alerte (stock < 5) et publiés
  const { data: alertProducts, error } = await supabase
    .from("products")
    .select("id, name, slug, brand, price, stock, image_url, status")
    .eq("status", "published")
    .lte("stock", 5)
    .order("stock", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("Erreur lors de la récupération des produits en alerte:", error);
  }

  const products = (alertProducts || []) as Product[];

  // Statistiques pour l'en-tête
  const outOfStock = products.filter((p) => p.stock === 0).length;
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length;

  return (
    <div className="p-4 md:p-8">
      {/* Header avec statistiques */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle size={32} className="text-orange-600" strokeWidth={1.5} />
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wide">
            Alertes Stock
          </h1>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="px-4 py-2 bg-red-50 border border-red-200">
            <span className="text-xs uppercase tracking-widest text-gray-500">Rupture</span>
            <p className="text-2xl font-bold text-red-600">{outOfStock}</p>
          </div>
          <div className="px-4 py-2 bg-orange-50 border border-orange-200">
            <span className="text-xs uppercase tracking-widest text-gray-500">Stock Faible</span>
            <p className="text-2xl font-bold text-orange-600">{lowStock}</p>
          </div>
          <div className="px-4 py-2 bg-gray-50 border border-gray-200">
            <span className="text-xs uppercase tracking-widest text-gray-500">Total Alertes</span>
            <p className="text-2xl font-bold text-gray-900">{products.length}</p>
          </div>
        </div>
      </div>

      {/* Message si aucune alerte */}
      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-500 uppercase tracking-wide">
            Aucun produit en alerte. Tous les stocks sont OK.
          </p>
        </div>
      ) : (
        // Tableau des produits en alerte
        <div className="bg-white border border-black">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-black">
                  <th className="text-left text-xs uppercase tracking-wider font-bold p-4">
                    Produit
                  </th>
                  <th className="text-left text-xs uppercase tracking-wider font-bold p-4">
                    Marque
                  </th>
                  <th className="text-left text-xs uppercase tracking-wider font-bold p-4">
                    Prix
                  </th>
                  <th className="text-center text-xs uppercase tracking-wider font-bold p-4">
                    Stock
                  </th>
                  <th className="text-center text-xs uppercase tracking-wider font-bold p-4">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    {/* Image + Nom */}
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 flex-shrink-0">
                          <Image
                            src={
                              product.image_url ||
                              "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800"
                            }
                            alt={product.name}
                            fill
                            className="object-cover"
                            placeholder="blur"
                            blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(64, 64))}`}
                            sizes="64px"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-xs text-gray-500 uppercase tracking-wider">
                            {product.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Marque */}
                    <td className="p-4 text-sm uppercase tracking-wide">
                      {product.brand}
                    </td>

                    {/* Prix */}
                    <td className="p-4 font-medium text-sm">
                      {new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                      }).format(Number(product.price) / 100)}
                    </td>

                    {/* Stock avec badge coloré */}
                    <td className="p-4 text-center">
                      <span
                        className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                          product.stock === 0
                            ? "bg-red-50 text-red-600 border border-red-200"
                            : "bg-orange-50 text-orange-600 border border-orange-200"
                        }`}
                      >
                        {product.stock === 0 ? "RUPTURE" : `${product.stock} restant${product.stock > 1 ? "s" : ""}`}
                      </span>
                    </td>

                    {/* Boutons d'action rapide */}
                    <td className="p-4">
                      <StockQuickUpdateButton
                        productId={product.id}
                        currentStock={product.stock}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden">
            {products.map((product) => (
              <div
                key={product.id}
                className="p-4 border-b border-gray-200 last:border-b-0"
              >
                {/* Image + Nom */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <Image
                      src={
                        product.image_url ||
                        "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800"
                      }
                      alt={product.name}
                      fill
                      className="object-cover"
                      placeholder="blur"
                      blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(80, 80))}`}
                      sizes="80px"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm mb-1">{product.name}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                      {product.brand}
                    </p>
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        product.stock === 0
                          ? "bg-red-50 text-red-600 border border-red-200"
                          : "bg-orange-50 text-orange-600 border border-orange-200"
                      }`}
                    >
                      {product.stock === 0 ? "RUPTURE" : `${product.stock} restant${product.stock > 1 ? "s" : ""}`}
                    </span>
                  </div>
                </div>

                {/* Prix */}
                <div className="text-sm font-medium mb-3">
                  {new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  }).format(Number(product.price) / 100)}
                </div>

                {/* Actions */}
                <StockQuickUpdateButton
                  productId={product.id}
                  currentStock={product.stock}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
