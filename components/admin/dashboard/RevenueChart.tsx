"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

/**
 * RevenueChart - Graphique d'évolution du chiffre d'affaires
 *
 * Affiche une courbe des ventes sur les 30 derniers jours
 * Style Byredo: Minimaliste, courbe noire, axes fins
 */

interface RevenueData {
  date: string; // Format: "2024-01-15"
  revenue: number; // Montant en centimes
}

interface RevenueChartProps {
  data: RevenueData[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
  // Formater les données pour Recharts
  const chartData = data.map((item) => ({
    date: item.date,
    dateFormatted: format(new Date(item.date), "dd/MM", { locale: fr }),
    revenue: item.revenue / 100, // Convertir centimes en euros
  }));

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-black px-3 py-2 shadow-sm">
          <p className="text-xs uppercase tracking-wider font-medium mb-1">
            {format(new Date(data.date), "dd MMMM", { locale: fr })}
          </p>
          <p className="text-sm font-bold">
            {new Intl.NumberFormat("fr-FR", {
              style: "currency",
              currency: "EUR",
            }).format(data.revenue)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-black p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xs uppercase tracking-[0.2em] font-bold mb-1">
          Évolution des Ventes
        </h2>
        <p className="text-[10px] uppercase tracking-wider text-gray-500">
          30 derniers jours
        </p>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#000000" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#000000" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#f0f0f0"
            vertical={false}
          />
          <XAxis
            dataKey="dateFormatted"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#666666", fontSize: 10 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#666666", fontSize: 10 }}
            tickFormatter={(value) =>
              `${new Intl.NumberFormat("fr-FR").format(value)}€`
            }
            width={60}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#000000"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorRevenue)"
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Stats summary */}
      <div className="mt-6 pt-4 border-t border-gray-200 grid grid-cols-3 gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
            Total
          </p>
          <p className="text-sm font-bold">
            {new Intl.NumberFormat("fr-FR", {
              style: "currency",
              currency: "EUR",
            }).format(
              chartData.reduce((sum, item) => sum + item.revenue, 0)
            )}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
            Moyenne
          </p>
          <p className="text-sm font-bold">
            {new Intl.NumberFormat("fr-FR", {
              style: "currency",
              currency: "EUR",
            }).format(
              chartData.length > 0
                ? chartData.reduce((sum, item) => sum + item.revenue, 0) /
                    chartData.length
                : 0
            )}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
            Meilleur jour
          </p>
          <p className="text-sm font-bold">
            {new Intl.NumberFormat("fr-FR", {
              style: "currency",
              currency: "EUR",
            }).format(
              chartData.length > 0
                ? Math.max(...chartData.map((item) => item.revenue))
                : 0
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
