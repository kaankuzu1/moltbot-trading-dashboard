export interface BinanceBalance {
  asset: string;
  free: number;
  locked: number;
}

export interface PortfolioAsset {
  coin: string;
  quantity: number;
  price: number;
  value: number;
  change24h: number;
  tp?: number | null;
  sl?: number | null;
}

export interface PortfolioSummary {
  totalValue: number;
  change24hValue: number;
  change24hPercent: number;
  assetCount: number;
}

export interface FearGreedData {
  value: number;
  classification: string;
}

export interface MarketData {
  btcPrice: number;
  fearGreed: FearGreedData;
}

export interface HistorySnapshot {
  date: string;
  totalValue: number;
}

export interface RecentTrade {
  symbol: string;
  coin: string;
  side: "BUY" | "SELL";
  price: number;
  qty: number;
  quoteQty: number;
  time: number;
  commission: number;
  commissionAsset: string;
}

export interface CapitalFlowData {
  totalDeposits: number;
  totalWithdrawals: number;
  netFlow: number;
  depositCount: number;
  withdrawalCount: number;
}
