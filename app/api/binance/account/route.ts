import { NextResponse } from "next/server";
import { getAccountBalances, getTickerPrices, getTicker24hr, getOpenOrders, getOpenOrderList, getOrder, getRecentSnapshotCoins } from "@/lib/binance";
import type { PortfolioAsset, PortfolioSummary } from "@/lib/types";

export const runtime = "edge";

export async function GET() {
  try {
    const [balances, prices, tickers24h, openOrders, orderLists, snapshotCoins] = await Promise.all([
      getAccountBalances(),
      getTickerPrices(),
      getTicker24hr(),
      getOpenOrders(),
      getOpenOrderList(),
      getRecentSnapshotCoins(30).catch(() => [] as string[]),
    ]);

    // Merge any missing OCO/OTO/OTOCO order legs into openOrders
    const knownOrderIds = new Set(openOrders.map((o) => o.orderId));
    const missingOrders: { symbol: string; orderId: number }[] = [];
    for (const list of orderLists) {
      for (const o of list.orders) {
        if (!knownOrderIds.has(o.orderId)) {
          missingOrders.push(o);
        }
      }
    }
    if (missingOrders.length > 0) {
      const fetched = await Promise.all(
        missingOrders.map((o) => getOrder(o.symbol, o.orderId).catch(() => null))
      );
      for (const order of fetched) {
        if (order) openOrders.push(order);
      }
    }

    // Build 24h change map
    const changeMap = new Map<string, number>();
    for (const t of tickers24h) {
      changeMap.set(t.symbol, t.priceChangePercent);
    }

    const btcPrice = prices.get("BTCUSDT") ?? 0;

    // Build TP/SL maps from open orders
    // For stop-type orders (TAKE_PROFIT*, STOP_LOSS*): stopPrice is the trigger
    // For limit-type orders (LIMIT, LIMIT_MAKER): price is the target
    // For unknown types: compare order price to current market price to determine TP vs SL
    const tpMap = new Map<string, number>();
    const slMap = new Map<string, number>();
    const quoteRegex = /(?:USDT|BUSD|USDC|FDUSD|BTC|BNB|TRY|EUR)$/;

    for (const order of openOrders) {
      if (order.side !== "SELL") continue;
      const base = order.symbol.replace(quoteRegex, "");
      if (!base || base === order.symbol) continue;

      const stopPrice = parseFloat(order.stopPrice);
      const limitPrice = parseFloat(order.price);

      // Determine effective price based on order type
      let effectivePrice: number;
      if (order.type.startsWith("TAKE_PROFIT") || order.type.startsWith("STOP_LOSS")) {
        effectivePrice = stopPrice > 0 ? stopPrice : limitPrice;
      } else {
        effectivePrice = limitPrice > 0 ? limitPrice : stopPrice;
      }
      if (effectivePrice <= 0) continue;

      // Determine TP vs SL
      let isTP: boolean;
      if (order.type.startsWith("TAKE_PROFIT")) {
        isTP = true;
      } else if (order.type.startsWith("STOP_LOSS")) {
        isTP = false;
      } else if (order.type === "LIMIT_MAKER") {
        // LIMIT_MAKER sell is always above market (Binance enforces this)
        isTP = true;
      } else {
        // For LIMIT or any unknown type: compare to current market price
        const currentPrice = prices.get(order.symbol) ?? 0;
        isTP = currentPrice > 0 ? effectivePrice > currentPrice : true;
      }

      if (isTP) {
        const existing = tpMap.get(base);
        if (!existing || effectivePrice < existing) tpMap.set(base, effectivePrice);
      } else {
        const existing = slMap.get(base);
        if (!existing || effectivePrice > existing) slMap.set(base, effectivePrice);
      }
    }

    const assets: PortfolioAsset[] = [];

    for (const b of balances) {
      const quantity = b.free + b.locked;
      if (quantity <= 0) continue;

      let price = 0;
      let change24h = 0;

      if (b.asset === "USDT") {
        price = 1;
        change24h = 0;
      } else if (b.asset === "USDC" || b.asset === "BUSD" || b.asset === "FDUSD") {
        price = prices.get(`${b.asset}USDT`) ?? 1;
        change24h = changeMap.get(`${b.asset}USDT`) ?? 0;
      } else {
        const usdtPair = `${b.asset}USDT`;
        const btcPair = `${b.asset}BTC`;

        if (prices.has(usdtPair)) {
          price = prices.get(usdtPair)!;
          change24h = changeMap.get(usdtPair) ?? 0;
        } else if (prices.has(btcPair) && btcPrice > 0) {
          price = prices.get(btcPair)! * btcPrice;
          change24h = changeMap.get(btcPair) ?? 0;
        }
      }

      const value = quantity * price;
      if (value < 1) continue; // Skip dust

      assets.push({
        coin: b.asset,
        quantity,
        price,
        value,
        change24h,
        tp: tpMap.get(b.asset) ?? null,
        sl: slMap.get(b.asset) ?? null,
      });
    }

    // Sort by value descending
    assets.sort((a, b) => b.value - a.value);

    // All coins with any balance (including dust) + recently held coins from snapshots
    const allCoins: string[] = [];
    const allCoinsSet = new Set<string>();
    const stablecoins = new Set(["USDT", "USDC", "BUSD", "FDUSD"]);
    for (const b of balances) {
      const quantity = b.free + b.locked;
      if (quantity > 0 && !stablecoins.has(b.asset)) {
        allCoins.push(b.asset);
        allCoinsSet.add(b.asset);
      }
    }
    // Add coins from recent snapshots (catches TP/SL sold coins)
    for (const coin of snapshotCoins) {
      if (!allCoinsSet.has(coin)) {
        allCoins.push(coin);
      }
    }

    const totalValue = assets.reduce((sum, a) => sum + a.value, 0);

    // Compute weighted 24h change
    let change24hValue = 0;
    for (const a of assets) {
      // Approximate: yesterday's value = today's value / (1 + change%)
      if (a.change24h !== 0 && a.coin !== "USDT") {
        const yesterdayValue = a.value / (1 + a.change24h / 100);
        change24hValue += a.value - yesterdayValue;
      }
    }

    const yesterdayTotal = totalValue - change24hValue;
    const change24hPercent = yesterdayTotal > 0 ? (change24hValue / yesterdayTotal) * 100 : 0;

    const summary: PortfolioSummary = {
      totalValue,
      change24hValue,
      change24hPercent,
      assetCount: assets.length,
    };

    return NextResponse.json(
      { summary, assets, allCoins },
      {
        headers: {
          "Cache-Control": "s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (error) {
    console.error("Binance account error:", error);
    return NextResponse.json(
      { error: "Failed to fetch account data" },
      { status: 500 }
    );
  }
}
