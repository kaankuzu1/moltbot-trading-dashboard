import { NextResponse } from "next/server";
import { getDepositHistory, getWithdrawHistory, getTickerPrices } from "@/lib/binance";
import type { CapitalFlowData } from "@/lib/types";

export const runtime = "edge";

const STABLECOINS = new Set(["USDT", "USDC", "BUSD", "FDUSD", "DAI", "TUSD"]);

export async function GET() {
  try {
    const [deposits, withdrawals, prices] = await Promise.all([
      getDepositHistory(),
      getWithdrawHistory(),
      getTickerPrices(),
    ]);

    function toUsd(amount: number, coin: string): number {
      if (STABLECOINS.has(coin)) return amount;
      const usdtPrice = prices.get(`${coin}USDT`);
      if (usdtPrice) return amount * usdtPrice;
      const btcPrice = prices.get(`${coin}BTC`);
      const btcUsdt = prices.get("BTCUSDT");
      if (btcPrice && btcUsdt) return amount * btcPrice * btcUsdt;
      return 0;
    }

    // Filter successful deposits (status=1) and completed withdrawals (status=6)
    const successDeposits = deposits.filter((d) => d.status === 1);
    const completedWithdrawals = withdrawals.filter((w) => w.status === 6);

    let totalDeposits = 0;
    for (const d of successDeposits) {
      totalDeposits += toUsd(parseFloat(d.amount), d.coin);
    }

    let totalWithdrawals = 0;
    for (const w of completedWithdrawals) {
      totalWithdrawals += toUsd(parseFloat(w.amount), w.coin);
    }

    const data: CapitalFlowData = {
      totalDeposits,
      totalWithdrawals,
      netFlow: totalDeposits - totalWithdrawals,
      depositCount: successDeposits.length,
      withdrawalCount: completedWithdrawals.length,
    };

    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=1800" },
    });
  } catch (err) {
    console.error("Capital flow API error:", err);
    return NextResponse.json({ error: "Para akisi verisi alinamadi" }, { status: 500 });
  }
}
