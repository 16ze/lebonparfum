import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";

/**
 * StockAlertsWidget - Widget des produits en alerte stock
 *
 * Liste compacte des produits critiques (stock < 5)
 * Style Byredo: Liste minimale avec badges colorés
 */

interface Product {
  id: string;
  name: string;
  slug: string;
  stock: number;
}

interface StockAlertsWidgetProps {
  products: Product[];
}

export default function StockAlertsWidget({ products }: StockAlertsWidgetProps) {
  return (
    <div className="bg-white border border-black h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-black flex items-center gap-2">
        <AlertTriangle size={16} className="text-orange-600" strokeWidth={2} />
        <h2 className="text-xs uppercase tracking-[0.2em] font-bold">
          Stocks Critiques
        </h2>
      </div>

      {/* Liste */}
      <div className="flex-1 overflow-y-auto">
        {products.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Aucune alerte
            </p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">
              Tous les stocks sont OK
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {products.map((product) => (
              <div
                key={product.id}
                className="px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate mb-1">
                      {product.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold border ${
                          product.stock === 0
                            ? "bg-red-50 text-red-600 border-red-200"
                            : "bg-orange-50 text-orange-600 border-orange-200"
                        }`}
                      >
                        {product.stock === 0
                          ? "Rupture"
                          : `${product.stock} restant${product.stock > 1 ? "s" : ""}`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer avec lien vers page complète */}
      {products.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-200">
          <Link
            href="/admin/stock-alerts"
            className="flex items-center justify-between text-xs uppercase tracking-wider font-medium hover:underline"
          >
            <span>Voir toutes les alertes</span>
            <ArrowRight size={12} strokeWidth={2} />
          </Link>
        </div>
      )}
    </div>
  );
}
