import { NextResponse } from "next/server";
import { getTickerPrices } from "@/lib/binance";

export const runtime = "edge";

export async function GET() {
  try {
    const [prices, fngRes] = await Promise.all([
      getTickerPrices(),
      fetch("https://api.alternative.me/fng/?limit=1").then((r) => r.json()),
    ]);

    const btcPrice = prices.get("BTCUSDT") ?? 0;

    const fngData = fngRes?.data?.[0];
    const fearGreed = {
      value: fngData ? parseInt(fngData.value, 10) : 0,
      classification: fngData?.value_classification ?? "Unknown",
    };

    return NextResponse.json(
      { btcPrice, fearGreed },
      {
        headers: {
          "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("Market data error:", error);
    return NextResponse.json(
      { error: "Failed to fetch market data" },
      { status: 500 }
    );
  }
}
