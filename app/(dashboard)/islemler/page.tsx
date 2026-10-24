"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { usePortfolio, useRecentTrades } from "@/lib/hooks/use-binance";
import { useRevalidationFade } from "@/lib/hooks/use-revalidation-fade";
import { useManualRefresh } from "@/lib/contexts/manual-refresh-context";
import { useWallet } from "@/lib/wallet-context";
import { formatCurrency, formatPrice, formatNumber } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import type { RecentTrade } from "@/lib/types";

function tradeKey(t: RecentTrade): string {
  return `${t.symbol}-${t.time}-${t.qty}-${t.price}`;
}

function formatTradeDate(timestamp: number): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(timestamp));
}

function TradeRow({
  trade,
  applyWallet,
  isNew,
  showEntrance,
  index,
}: {
  trade: RecentTrade;
  applyWallet: (v: number) => number;
  isNew: boolean;
  showEntrance: boolean;
  index: number;
}) {
  const isBuy = trade.side === "BUY";

  const entranceClass = showEntrance ? "animate-fade-slide-up" : "";
  const entranceStyle = showEntrance
    ? { animationDelay: `${index * 50}ms` }
    : undefined;

  const newTradeClass = isNew
    ? `animate-slide-down ${isBuy ? "animate-glow-emerald" : "animate-glow-red"}`
    : "";

  return (
    <div
      className={`bg-muted/30 ${
        isBuy ? "border-l-4 border-l-emerald-500" : "border-l-4 border-l-red-500"
      } transition-colors duration-200 hover:bg-muted/60 ${entranceClass} ${newTradeClass}`}
      style={entranceStyle}
    >
      <div className="flex items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3">
        {/* Left: side tag + coin + date */}
        <div className="flex items-center gap-2 sm:gap-3">
          <span
            className={`inline-flex w-[42px] items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white ${
              isBuy ? "bg-emerald-500" : "bg-red-500"
            }`}
          >
            {isBuy ? "AL" : "SAT"}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-tight text-foreground">{trade.coin}</span>
              <span className="text-[10px] text-muted-foreground">/USDT</span>
            </div>
            <div className="whitespace-nowrap text-[11px] tabular-nums text-muted-foreground">
              {formatTradeDate(trade.time)}
            </div>
          </div>
        </div>

        {/* Right: price, qty, total */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="hidden text-right sm:block">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Miktar</div>
            <div className="text-xs tabular-nums font-medium text-foreground">
              {formatNumber(trade.qty, trade.qty < 1 ? 6 : 2)}
            </div>
          </div>
          <div className="hidden text-right sm:block">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Fiyat</div>
            <div className="text-xs tabular-nums font-medium text-foreground">
              {formatPrice(trade.price)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Toplam</div>
            <div className="text-sm tabular-nums font-bold text-foreground">
              {formatCurrency(applyWallet(trade.quoteQty))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function IslemlerPage() {
  const { data: portfolio, isLoading: portfolioLoading, isValidating: portfolioValidating } = usePortfolio();
  const { applyWallet } = useWallet();

  const topSymbols = useMemo(() => {
    if (!portfolio) return null;
    // Use allCoins (includes dust + snapshot coins) so all traded coins appear
    if (portfolio.allCoins && portfolio.allCoins.length > 0) {
      return portfolio.allCoins;
    }
    // Fallback: all assets by value
    if (!portfolio.assets) return null;
    return portfolio.assets
      .sort((a, b) => b.value - a.value)
      .map((a) => a.coin);
  }, [portfolio]);

  const { data: tradesData, isLoading: tradesLoading, isValidating: tradesValidating } = useRecentTrades(topSymbols);
  const { isManualRefresh } = useManualRefresh();
  const isLoading = portfolioLoading || tradesLoading;
  const revalidationClass = useRevalidationFade((portfolioValidating || tradesValidating) && !isLoading, isManualRefresh);

  // Track known trade keys to detect new ones
  const knownKeysRef = useRef<Set<string>>(new Set());
  const isFirstLoad = useRef(true);
  const [newKeys, setNewKeys] = useState<Set<string>>(new Set());

  // Staggered entrance animation (only on first load)
  const hasMounted = useRef(false);
  const [showEntrance, setShowEntrance] = useState(false);

  useEffect(() => {
    if (!tradesData?.trades) return;

    const currentKeys = new Set(tradesData.trades.map(tradeKey));

    if (isFirstLoad.current) {
      // First load — mark all as known, trigger entrance animation
      knownKeysRef.current = currentKeys;
      isFirstLoad.current = false;

      if (!hasMounted.current) {
        hasMounted.current = true;
        setShowEntrance(true);
        // Turn off entrance animation after all items have animated
        const totalDuration = tradesData.trades.length * 50 + 400;
        const timer = setTimeout(() => setShowEntrance(false), totalDuration);
        return () => clearTimeout(timer);
      }
      return;
    }

    // Find keys that weren't in the previous set
    const fresh = new Set<string>();
    for (const k of currentKeys) {
      if (!knownKeysRef.current.has(k)) {
        fresh.add(k);
      }
    }

    if (fresh.size > 0) {
      setNewKeys(fresh);
      // Clear animation class after glow finishes
      const timer = setTimeout(() => setNewKeys(new Set()), 2000);
      knownKeysRef.current = currentKeys;
      return () => clearTimeout(timer);
    }

    knownKeysRef.current = currentKeys;
  }, [tradesData]);

  const buyCount = tradesData?.trades.filter((t) => t.side === "BUY").length ?? 0;
  const sellCount = tradesData?.trades.filter((t) => t.side === "SELL").length ?? 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Islemler</h1>
        <p className="text-sm text-muted-foreground">Son alinan ve satilan islemler</p>
      </div>

      {isLoading ? (
        <div className="space-y-0">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-[60px] rounded-none first:rounded-t-lg last:rounded-b-lg" />
          ))}
        </div>
      ) : tradesData && tradesData.trades.length > 0 ? (
        <>
          {/* Summary bar */}
          <div className="flex items-center gap-4 text-xs">
            <span className="text-muted-foreground">
              Toplam <span className="font-bold text-foreground">{tradesData.trades.length}</span> islem
            </span>
            <span className="text-emerald-600 dark:text-emerald-400">
              <span className="font-bold">{buyCount}</span> Alis
            </span>
            <span className="text-red-600 dark:text-red-400">
              <span className="font-bold">{sellCount}</span> Satis
            </span>
          </div>

          {/* Trade list — stacked blocks */}
          <div className={`overflow-hidden rounded-2xl border border-border divide-y divide-border ${revalidationClass}`}>
            {tradesData.trades.map((trade, i) => (
              <TradeRow
                key={`${trade.symbol}-${trade.time}-${i}`}
                trade={trade}
                applyWallet={applyWallet}
                isNew={newKeys.has(tradeKey(trade))}
                showEntrance={showEntrance}
                index={i}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed">
          <p className="text-muted-foreground">Henuz islem yok</p>
        </div>
      )}
    </div>
  );
}
