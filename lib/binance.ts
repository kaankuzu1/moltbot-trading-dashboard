const BASE_URL = "https://api.binance.com";
const API_KEY = process.env.BINANCE_API_KEY ?? "";
const API_SECRET = process.env.BINANCE_API_SECRET ?? "";

function toHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex;
}

async function signQuery(params: Record<string, string | number>): Promise<string> {
  const query = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString();

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(API_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = toHex(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(query))
  );

  return `${query}&signature=${signature}`;
}

async function fetchSigned(path: string, extraParams: Record<string, string | number> = {}) {
  const params = { ...extraParams, timestamp: Date.now() };
  const qs = await signQuery(params);
  const res = await fetch(`${BASE_URL}${path}?${qs}`, {
    headers: { "X-MBX-APIKEY": API_KEY },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Binance API error ${res.status}: ${body}`);
  }
  return res.json();
}

async function fetchPublic(path: string, params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  const url = qs ? `${BASE_URL}${path}?${qs}` : `${BASE_URL}${path}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Binance API error ${res.status}`);
  }
  return res.json();
}

export interface BinanceBalance {
  asset: string;
  free: number;
  locked: number;
}

export async function getAccountBalances(): Promise<BinanceBalance[]> {
  const data = await fetchSigned("/api/v3/account");
  return (data.balances as { asset: string; free: string; locked: string }[])
    .map((b) => ({
      asset: b.asset,
      free: parseFloat(b.free),
      locked: parseFloat(b.locked),
    }))
    .filter((b) => b.free + b.locked > 0);
}

export async function getTickerPrices(): Promise<Map<string, number>> {
  const data: { symbol: string; price: string }[] = await fetchPublic("/api/v3/ticker/price");
  const map = new Map<string, number>();
  for (const t of data) {
    map.set(t.symbol, parseFloat(t.price));
  }
  return map;
}

export interface Ticker24hr {
  symbol: string;
  priceChangePercent: number;
  lastPrice: number;
}

export async function getTicker24hr(symbols?: string[]): Promise<Ticker24hr[]> {
  let data: { symbol: string; priceChangePercent: string; lastPrice: string }[];
  if (symbols && symbols.length > 0) {
    data = await fetchPublic("/api/v3/ticker/24hr", {
      symbols: JSON.stringify(symbols),
    });
  } else {
    data = await fetchPublic("/api/v3/ticker/24hr");
  }
  return data.map((t) => ({
    symbol: t.symbol,
    priceChangePercent: parseFloat(t.priceChangePercent),
    lastPrice: parseFloat(t.lastPrice),
  }));
}

export interface OpenOrder {
  symbol: string;
  orderId: number;
  price: string;
  origQty: string;
  type: string;
  side: string;
  stopPrice: string;
}

export async function getOpenOrders(): Promise<OpenOrder[]> {
  return fetchSigned("/api/v3/openOrders");
}

export async function getOpenOrderList(): Promise<
  { orderListId: number; orders: { symbol: string; orderId: number }[] }[]
> {
  return fetchSigned("/api/v3/openOrderList");
}

export async function getOrder(symbol: string, orderId: number): Promise<OpenOrder> {
  return fetchSigned("/api/v3/order", { symbol, orderId });
}

export interface DailySnapshot {
  updateTime: number;
  totalAssetOfBtc: number;
}

export async function getDailySnapshots(days = 30): Promise<DailySnapshot[]> {
  const data = await fetchSigned("/sapi/v1/accountSnapshot", {
    type: "SPOT",
    limit: Math.min(days, 30),
  });
  if (data.code !== 200) {
    throw new Error(`Binance snapshot error: ${data.msg}`);
  }
  return (data.snapshotVos as { updateTime: number; data: { totalAssetOfBtc: string } }[]).map(
    (s) => ({
      updateTime: s.updateTime,
      totalAssetOfBtc: parseFloat(s.data.totalAssetOfBtc),
    })
  );
}

export async function getKlines(
  symbol: string,
  interval: string,
  limit: number
): Promise<number[]> {
  const data = await fetchPublic("/api/v3/klines", {
    symbol,
    interval,
    limit: String(limit),
  });
  // Each kline is an array; index 4 is the close price
  return (data as string[][]).map((k) => parseFloat(k[4]));
}

export interface TimestampedKline {
  time: number;
  close: number;
}

export async function getKlinesWithTimestamps(
  symbol: string,
  interval: string,
  limit: number
): Promise<TimestampedKline[]> {
  const data = await fetchPublic("/api/v3/klines", {
    symbol,
    interval,
    limit: String(limit),
  });
  // Index 0 is open time, index 4 is close price
  return (data as (string | number)[][]).map((k) => ({
    time: k[0] as number,
    close: parseFloat(k[4] as string),
  }));
}

export async function getMyTrades(
  symbol: string,
  limit: number,
  startTime?: number
): Promise<
  {
    symbol: string;
    price: string;
    qty: string;
    quoteQty: string;
    commission: string;
    commissionAsset: string;
    time: number;
    isBuyer: boolean;
  }[]
> {
  const params: Record<string, string | number> = { symbol, limit };
  if (startTime) params.startTime = startTime;
  return fetchSigned("/api/v3/myTrades", params);
}

export async function getRecentSnapshotCoins(days = 5): Promise<string[]> {
  const data = await fetchSigned("/sapi/v1/accountSnapshot", {
    type: "SPOT",
    limit: Math.min(days, 30),
  });
  if (data.code !== 200) return [];
  const stablecoins = new Set(["USDT", "USDC", "BUSD", "FDUSD"]);
  const coins = new Set<string>();
  for (const snap of (data.snapshotVos as { data: { balances: { asset: string; free: string; locked: string }[] } }[])) {
    for (const b of snap.data.balances) {
      if (parseFloat(b.free) + parseFloat(b.locked) > 0 && !stablecoins.has(b.asset)) {
        coins.add(b.asset);
      }
    }
  }
  return [...coins];
}

export async function getDepositHistory(): Promise<
  { amount: string; coin: string; status: number; insertTime: number }[]
> {
  return fetchSigned("/sapi/v1/capital/deposit/hisrec");
}

export async function getWithdrawHistory(): Promise<
  { amount: string; coin: string; status: number; completeTime: string }[]
> {
  const data = await fetchSigned("/sapi/v1/capital/withdraw/history");
  return data;
}
