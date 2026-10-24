import { NextRequest, NextResponse } from "next/server";
import { getMyTrades } from "@/lib/binance";
import type { RecentTrade } from "@/lib/types";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const symbolsParam = req.nextUrl.searchParams.get("symbols");
    if (!symbolsParam) {
      return NextResponse.json({ error: "symbols required" }, { status: 400 });
    }

    const symbols = symbolsParam.split(",");
    const oneMonthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    const results = await Promise.allSettled(
      symbols.map((s) => getMyTrades(`${s}USDT`, 50, oneMonthAgo))
    );

    const trades: RecentTrade[] = [];
    symbols.forEach((symbol, i) => {
      const result = results[i];
      if (result.status === "fulfilled") {
        for (const t of result.value) {
          trades.push({
            symbol: t.symbol,
            coin: symbol,
            side: t.isBuyer ? "BUY" : "SELL",
            price: parseFloat(t.price),
            qty: parseFloat(t.qty),
            quoteQty: parseFloat(t.quoteQty),
            time: t.time,
            commission: parseFloat(t.commission),
            commissionAsset: t.commissionAsset,
          });
        }
      }
    });

    trades.sort((a, b) => b.time - a.time);

    return NextResponse.json(
      { trades },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30" } }
    );
  } catch (err) {
    console.error("Trades API error:", err);
    return NextResponse.json({ error: "Islem verisi alinamadi" }, { status: 500 });
  }
}
