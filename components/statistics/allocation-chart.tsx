"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWallet } from "@/lib/wallet-context";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { PortfolioAsset } from "@/lib/types";

interface AllocationChartProps {
  assets: PortfolioAsset[];
  totalValue: number;
}

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--muted-foreground)",
];

interface ChartEntry {
  name: string;
  value: number;
  percentage: number;
}

export function AllocationChart({ assets, totalValue }: AllocationChartProps) {
  const { applyWallet } = useWallet();

  const data = useMemo(() => {
    const sorted = [...assets].sort((a, b) => b.value - a.value);
    const top5 = sorted.slice(0, 5);
    const rest = sorted.slice(5);

    const entries: ChartEntry[] = top5.map((a) => ({
      name: a.coin,
      value: applyWallet(a.value),
      percentage: totalValue > 0 ? (a.value / totalValue) * 100 : 0,
    }));

    if (rest.length > 0) {
      const restValue = rest.reduce((sum, a) => sum + a.value, 0);
      entries.push({
        name: "Diger",
        value: applyWallet(restValue),
        percentage: totalValue > 0 ? (restValue / totalValue) * 100 : 0,
      });
    }

    return entries;
  }, [assets, totalValue, applyWallet]);

  const walletTotal = applyWallet(totalValue);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Portfolyo Dagilimi</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-[250px] sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius="55%"
                outerRadius="80%"
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload as ChartEntry;
                  return (
                    <div className="rounded-lg border bg-background px-3 py-2 shadow-md">
                      <p className="font-semibold">{d.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(d.value)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        %{formatNumber(d.percentage)}
                      </p>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Toplam</p>
              <p className="text-sm font-bold sm:text-base">{formatCurrency(walletTotal)}</p>
            </div>
          </div>
        </div>
        {/* Legend */}
        <div className="mt-2 flex flex-wrap justify-center gap-x-2 gap-y-1 sm:gap-x-4">
          {data.map((entry, index) => (
            <div key={entry.name} className="flex items-center gap-1.5 text-xs">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span>{entry.name}</span>
              <span className="text-muted-foreground">%{formatNumber(entry.percentage)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
