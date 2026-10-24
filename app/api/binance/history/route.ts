import { NextResponse } from "next/server";
import { getDailySnapshots, getKlinesWithTimestamps, getTickerPrices } from "@/lib/binance";

export const runtime = "edge";

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setUTCHours(0, 0, 0, 0);
  return d.getTime();
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") ?? "30", 10);
    const clampedDays = Math.min(days, 30);

    const [snapshots, btcKlines, prices] = await Promise.all([
      getDailySnapshots(clampedDays),
      getKlinesWithTimestamps("BTCUSDT", "1d", clampedDays),
      getTickerPrices(),
    ]);

    // Build a map of day start → BTC close price
    const btcByDay = new Map<number, number>();
    for (const k of btcKlines) {
      btcByDay.set(startOfDay(k.time), k.close);
    }

    // Current BTC price as fallback (and for today's real-time data point)
    const currentBtcPrice = prices.get("BTCUSDT") ?? 0;

    const allPoints = snapshots.map((s) => {
      const dayKey = startOfDay(s.updateTime);
      const btcPrice = btcByDay.get(dayKey) ?? currentBtcPrice;
      return {
        date: new Date(s.updateTime).toISOString(),
        totalValue: s.totalAssetOfBtc * btcPrice,
      };
    });

    // Filter out anomalous snapshots caused by mid-rebalance captures.
    // If a snapshot drops more than 15% from the last good value, skip it.
    const result: typeof allPoints = [];
    let lastGoodValue = 0;
    for (const point of allPoints) {
      if (lastGoodValue > 0 && point.totalValue < lastGoodValue * 0.85) {
        continue; // skip anomaly
      }
      lastGoodValue = point.totalValue;
      result.push(point);
    }

    return NextResponse.json(
      { snapshots: result },
      {
        headers: {
          "Cache-Control": "s-maxage=3600, stale-while-revalidate=7200",
        },
      }
    );
  } catch (error) {
    console.error("History error:", error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}
