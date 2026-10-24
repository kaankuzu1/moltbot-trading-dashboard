import { NextRequest, NextResponse } from "next/server";
import { getKlinesWithTimestamps } from "@/lib/binance";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const symbolsParam = req.nextUrl.searchParams.get("symbols");
    if (!symbolsParam) {
      return NextResponse.json({ error: "symbols required" }, { status: 400 });
    }

    const symbols = symbolsParam.split(",").slice(0, 20);

    const results = await Promise.allSettled(
      symbols.map((s) => getKlinesWithTimestamps(`${s}USDT`, "1d", 7))
    );

    const klines: Record<string, { time: number; close: number }[]> = {};
    symbols.forEach((symbol, i) => {
      const result = results[i];
      if (result.status === "fulfilled") {
        klines[symbol] = result.value;
      }
    });

    return NextResponse.json(
      { klines },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=1800" } }
    );
  } catch (err) {
    console.error("Klines API error:", err);
    return NextResponse.json({ error: "Kline verisi alinamadi" }, { status: 500 });
  }
}
