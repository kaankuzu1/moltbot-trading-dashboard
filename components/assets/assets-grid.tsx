"use client";

import { useState, useMemo, useEffect } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWallet } from "@/lib/wallet-context";
import { formatPrice, formatNumber, formatCurrency } from "@/lib/format";
import { AssetCardSparkline } from "@/components/assets/asset-card-sparkline";
import { SlotValue } from "@/components/ui/slot-value";
import type { PortfolioAsset } from "@/lib/types";

type SortKey = "coin" | "price" | "value" | "change24h";

const CHART_CSS_VARS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

/* Hex fallbacks for Recharts SVG rendering (oklch not universally supported in inline SVG attributes) */
const CHART_HEX_COLORS = [
  "#E85D2A", // chart-1: orange/coral
  "#3B6FD4", // chart-2: blue
  "#2A9D6E", // chart-3: green
  "#C4A820", // chart-4: yellow
  "#8B3DC4", // chart-5: purple
];

function coinColorIndex(coin: string): number {
  let hash = 0;
  for (let i = 0; i < coin.length; i++) {
    hash = coin.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 5;
}

/* CSS variable for DOM elements (dot, border) */
function coinColor(coin: string): string {
  return CHART_CSS_VARS[coinColorIndex(coin)];
}

/* Hex color for Recharts SVG rendering */
function coinHexColor(coin: string): string {
  return CHART_HEX_COLORS[coinColorIndex(coin)];
}

const SORT_OPTIONS = [
  { value: "value-desc", label: "Deger (Yuksek)" },
  { value: "value-asc", label: "Deger (Dusuk)" },
  { value: "change24h-desc", label: "24s Degisim (Yuksek)" },
  { value: "change24h-asc", label: "24s Degisim (Dusuk)" },
  { value: "price-desc", label: "Fiyat (Yuksek)" },
  { value: "price-asc", label: "Fiyat (Dusuk)" },
  { value: "coin-asc", label: "Coin (A-Z)" },
  { value: "coin-desc", label: "Coin (Z-A)" },
];

interface AssetsGridProps {
  assets: PortfolioAsset[];
  klines?: Record<string, { time: number; close: number }[]>;
  revalidationClass?: string;
}

export function AssetsGrid({ assets, klines, revalidationClass = "" }: AssetsGridProps) {
  const { applyWallet } = useWallet();
  const [sortValue, setSortValue] = useState("value-desc");
  const [hasAnimated, setHasAnimated] = useState(false);

  const sortKey = sortValue.split("-")[0] as SortKey;
  const sortDir = sortValue.split("-")[1] as "asc" | "desc";

  useEffect(() => {
    const timeout = setTimeout(
      () => setHasAnimated(true),
      assets.length * 60 + 400
    );
    return () => clearTimeout(timeout);
  }, [assets.length]);

  const sortedAssets = useMemo(() => {
    return [...assets].sort((a, b) => {
      if (sortKey === "coin") {
        return sortDir === "asc"
          ? a.coin.localeCompare(b.coin)
          : b.coin.localeCompare(a.coin);
      }
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      return sortDir === "asc"
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
  }, [assets, sortKey, sortDir]);

  if (assets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
        <p className="text-muted-foreground">Varlik bulunamadi</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{assets.length}</span>{" "}
          varlik
        </p>
        <Select value={sortValue} onValueChange={setSortValue}>
          <SelectTrigger className="w-[160px] sm:w-[200px]" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 ${revalidationClass}`}>
        {sortedAssets.map((asset, index) => {
          const changePositive = asset.change24h >= 0;
          const walletValue = applyWallet(asset.value);
          const walletQuantity = applyWallet(asset.quantity);
          const color = coinColor(asset.coin);
          const hexColor = coinHexColor(asset.coin);

          return (
            <div
              key={asset.coin}
              className={`group overflow-hidden rounded-2xl border border-l-4 bg-card transition-all hover:-translate-y-0.5 hover:shadow-md${
                !hasAnimated ? " animate-fade-slide-up" : ""
              }`}
              style={{
                borderLeftColor: color,
                ...(!hasAnimated
                  ? { animationDelay: `${index * 60}ms` }
                  : undefined),
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 pb-1 pt-4 sm:px-5">
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-lg font-bold tracking-tight">
                    {asset.coin}
                  </span>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                    changePositive
                      ? "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                      : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                  }`}
                >
                  {changePositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <SlotValue value={`${changePositive ? "+" : ""}${formatNumber(asset.change24h)}%`} />
                </span>
              </div>

              {/* Hero Sparkline */}
              <div className="px-1">
                <AssetCardSparkline
                  data={klines?.[asset.coin] ?? []}
                  color={hexColor}
                />

              </div>

              {/* Data Section */}
              <div className="space-y-2 px-4 pb-4 pt-2 sm:px-5">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  <div>
                    <p className="text-xs text-muted-foreground">Fiyat</p>
                    <SlotValue value={formatPrice(asset.price)} className="font-mono text-sm font-semibold" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Deger</p>
                    <SlotValue value={formatCurrency(walletValue)} className="font-mono text-sm font-semibold" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Miktar</p>
                    <SlotValue value={formatNumber(walletQuantity, walletQuantity < 1 ? 6 : 2)} className="font-mono text-sm" />
                  </div>
                </div>

                {/* TP / SL row — only show if at least one exists */}
                {(asset.tp || asset.sl) && (
                  <div className="flex gap-4 border-t pt-2">
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">TP</p>
                      <SlotValue value={asset.tp ? formatPrice(asset.tp) : "—"} className="font-mono text-sm font-medium text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">SL</p>
                      <SlotValue value={asset.sl ? formatPrice(asset.sl) : "—"} className="font-mono text-sm font-medium text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
