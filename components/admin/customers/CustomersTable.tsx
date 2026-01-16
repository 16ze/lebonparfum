"use client";

import { Download } from "lucide-react";
import { useState } from "react";

/**
 * CustomersTable - Tableau des clients avec export CSV
 *
 * Design Byredo : Minimaliste, noir & blanc
 */

interface Customer {
  email: string;
  name: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
  totalSpent: number; // en centimes
  orderCount: number;
  lastOrderDate: string | null;
}

interface CustomersTableProps {
  customers: Customer[];
}

export default function CustomersTable({ customers }: CustomersTableProps) {
  const [isExporting, setIsExporting] = useState(false);

  /**
   * Fonction d'export CSV
   */
  const handleExportCSV = () => {
    setIsExporting(true);

    try {
      // En-têtes CSV
      const headers = [
        "Email",
        "Nom",
        "Téléphone",
        "Ville",
        "Pays",
        "Nombre de commandes",
        "Total dépensé (€)",
        "Dernière commande",
        "Statut",
      ];

      // Convertir les données en lignes CSV
      const rows = customers.map((customer) => {
        const totalSpentEuros = (customer.totalSpent / 100).toFixed(2);
        const lastOrderDate = customer.lastOrderDate
          ? new Date(customer.lastOrderDate).toLocaleDateString("fr-FR")
          : "N/A";
        const status = getCustomerStatus(customer.totalSpent);

        return [
          customer.email,
          customer.name || "N/A",
          customer.phone || "N/A",
          customer.city || "N/A",
          customer.country || "N/A",
          customer.orderCount.toString(),
          totalSpentEuros,
          lastOrderDate,
          status,
        ];
      });

      // Créer le contenu CSV
      const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
        ),
      ].join("\n");

      // Créer un Blob et télécharger
      const blob = new Blob(["\uFEFF" + csvContent], {
        type: "text/csv;charset=utf-8;",
      }); // BOM UTF-8 pour Excel
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `clients_the_parfumeriee_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("❌ Erreur export CSV:", error);
      alert("Erreur lors de l'export CSV");
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Détermine le statut du client selon son LTV
   */
  const getCustomerStatus = (totalSpent: number): string => {
    const totalEuros = totalSpent / 100;
    if (totalEuros >= 200) return "VIP";
    if (totalEuros >= 100) return "Fidèle";
    if (totalEuros >= 50) return "Régulier";
    return "Nouveau";
  };

  /**
   * Formate un montant en euros
   */
  const formatPrice = (cents: number): string => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(cents / 100);
  };

  /**
   * Formate une date
   */
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  /**
   * Badge de statut avec couleur
   */
  const StatusBadge = ({ status }: { status: string }) => {
    const colors: Record<string, string> = {
      VIP: "bg-black text-white",
      Fidèle: "bg-gray-900 text-white",
      Régulier: "bg-gray-800 text-white",
      Nouveau: "bg-gray-100 text-black",
    };

    return (
      <span
        className={`px-2 py-1 text-xs uppercase tracking-wider font-bold ${
          colors[status] || "bg-gray-100 text-black"
        }`}
      >
        {status}
      </span>
    );
  };

  if (customers.length === 0) {
    return (
      <div className="p-4 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl md:text-3xl uppercase tracking-widest font-bold">
            Base Clients
          </h1>
        </div>
        <div className="border border-black/10 p-8 text-center">
          <p className="text-sm uppercase tracking-widest text-gray-500">
            Aucun client trouvé
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header avec titre et bouton export */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl uppercase tracking-widest font-bold">
          Base Clients
        </h1>
        <button
          onClick={handleExportCSV}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white text-xs uppercase tracking-widest font-bold hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={16} strokeWidth={1.5} />
          {isExporting ? "Export..." : "Exporter CSV"}
        </button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="border border-black/10 p-4">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">
            Total Clients
          </p>
          <p className="text-2xl font-bold">{customers.length}</p>
        </div>
        <div className="border border-black/10 p-4">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">
            Clients VIP
          </p>
          <p className="text-2xl font-bold">
            {customers.filter((c) => c.totalSpent >= 20000).length}
          </p>
        </div>
        <div className="border border-black/10 p-4">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">
            CA Total
          </p>
          <p className="text-2xl font-bold">
            {formatPrice(
              customers.reduce((sum, c) => sum + c.totalSpent, 0)
            )}
          </p>
        </div>
        <div className="border border-black/10 p-4">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">
            Panier Moyen
          </p>
          <p className="text-2xl font-bold">
            {formatPrice(
              customers.reduce((sum, c) => sum + c.totalSpent, 0) /
                customers.length
            )}
          </p>
        </div>
      </div>

      {/* Tableau des clients */}
      <div className="border border-black/10 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-black text-white">
            <tr>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-widest font-bold">
                Client
              </th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-widest font-bold">
                Localisation
              </th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-widest font-bold">
                Contact
              </th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-widest font-bold">
                Commandes
              </th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-widest font-bold">
                Total Dépensé
              </th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-widest font-bold">
                Statut
              </th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer, index) => (
              <tr
                key={customer.email}
                className={`border-b border-black/10 ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                <td className="px-4 py-3">
                  <div>
                    <p className="font-semibold text-sm">
                      {customer.name || "Sans nom"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {customer.email}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  {customer.city && customer.country
                    ? `${customer.city}, ${customer.country}`
                    : customer.city || customer.country || "N/A"}
                </td>
                <td className="px-4 py-3 text-sm">
                  {customer.phone || "N/A"}
                </td>
                <td className="px-4 py-3 text-sm font-semibold">
                  {customer.orderCount}
                </td>
                <td className="px-4 py-3 text-sm font-bold">
                  {formatPrice(customer.totalSpent)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={getCustomerStatus(customer.totalSpent)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer avec total */}
      <div className="mt-4 text-right">
        <p className="text-xs uppercase tracking-widest text-gray-500">
          {customers.length} client{customers.length > 1 ? "s" : ""} au total
        </p>
      </div>
    </div>
  );
}
