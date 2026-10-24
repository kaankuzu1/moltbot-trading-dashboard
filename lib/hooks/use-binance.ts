"use client";

import useSWR from "swr";
import type {
  PortfolioSummary,
  PortfolioAsset,
  MarketData,
  HistorySnapshot,
  RecentTrade,
  CapitalFlowData,
} from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function usePortfolio() {
  return useSWR<{ summary: PortfolioSummary; assets: PortfolioAsset[]; allCoins?: string[] }>(
    "/api/binance/account",
    fetcher,
    { refreshInterval: 60_000 }
  );
}

export function useMarket() {
  return useSWR<MarketData>(
    "/api/binance/market",
    fetcher,
    { refreshInterval: 300_000 }
  );
}

export function useHistory(days = 30) {
  return useSWR<{ snapshots: HistorySnapshot[] }>(
    `/api/binance/history?days=${days}`,
    fetcher,
    { refreshInterval: 3_600_000 }
  );
}

export function useKlines(symbols: string[] | null) {
  const key = symbols && symbols.length > 0
    ? `/api/binance/klines?symbols=${symbols.join(",")}`
    : null;
  return useSWR<{ klines: Record<string, { time: number; close: number }[]> }>(key, fetcher, {
    refreshInterval: 3_600_000,
  });
}

export function useRecentTrades(symbols: string[] | null) {
  const key = symbols && symbols.length > 0
    ? `/api/binance/trades?symbols=${symbols.join(",")}`
    : null;
  return useSWR<{ trades: RecentTrade[] }>(key, fetcher, {
    refreshInterval: 120_000,
  });
}

export function useCapitalFlow() {
  return useSWR<CapitalFlowData>(
    "/api/binance/capital-flow",
    fetcher,
    { refreshInterval: 3_600_000 }
  );
}
