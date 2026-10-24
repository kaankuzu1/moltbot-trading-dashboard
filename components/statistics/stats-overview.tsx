"use client";

import { Info } from "lucide-react";
import type { PortfolioSummary, MarketData } from "@/lib/types";
import { useWallet } from "@/lib/wallet-context";
import { formatCurrency, formatNumber } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SlotValue } from "@/components/ui/slot-value";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface StatsOverviewProps {
  summary: PortfolioSummary;
  market: MarketData;
}

interface KpiCardProps {
  title: string;
  value: string;
  subValue?: string;
  colorClass?: string;
  tooltip: string;
  badge?: { text: string; className: string };
}

function KpiCard({ title, value, subValue, colorClass, tooltip, badge }: KpiCardProps) {
  return (
    <Card>
      <CardContent className="pt-0">
        <div className="flex items-center gap-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3.5 w-3.5 shrink-0 cursor-help text-muted-foreground/50" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[220px]">
              {tooltip}
            </TooltipContent>
          </Tooltip>
        </div>
        {badge ? (
          <div className="flex items-center gap-2">
            <SlotValue value={value} className={`text-xl font-bold tracking-tight sm:text-2xl ${colorClass ?? ""}`} />
            <Badge className={`whitespace-nowrap ${badge.className}`}>{badge.text}</Badge>
          </div>
        ) : (
          <SlotValue value={value} className={`text-xl font-bold tracking-tight sm:text-2xl ${colorClass ?? ""}`} />
        )}
        {subValue && (
          <SlotValue value={subValue} className={`text-sm ${colorClass ?? "text-muted-foreground"}`} />
        )}
      </CardContent>
    </Card>
  );
}

function fearGreedColor(value: number): string {
  if (value <= 25) return "bg-red-600 text-white hover:bg-red-700";
  if (value <= 45) return "bg-orange-500 text-white hover:bg-orange-600";
  if (value <= 55) return "bg-yellow-500 text-black hover:bg-yellow-600";
  if (value <= 75) return "bg-lime-500 text-black hover:bg-lime-600";
  return "bg-green-600 text-white hover:bg-green-700";
}

export function StatsOverview({ summary, market }: StatsOverviewProps) {
  const { applyWallet } = useWallet();

  const currentBalance = applyWallet(summary.totalValue);
  const change24h = applyWallet(summary.change24hValue);
  const changePositive = change24h >= 0;

  const cards: KpiCardProps[] = [
    {
      title: "Guncel Bakiye",
      value: formatCurrency(currentBalance),
      tooltip: "Portfoydeki anlik toplam deger",
    },
    {
      title: "24s Degisim",
      value: `${changePositive ? "+" : ""}${formatCurrency(change24h)}`,
      subValue: `${changePositive ? "+" : ""}${formatNumber(summary.change24hPercent)}%`,
      colorClass: changePositive ? "text-emerald-500" : "text-red-500",
      tooltip: "Son 24 saatteki portfolyo deger degisimi",
    },
    {
      title: "Toplam Varlik",
      value: String(summary.assetCount),
      tooltip: "Portfoydeki toplam coin sayisi ($1 ustu)",
    },
    {
      title: "BTC Fiyati",
      value: formatCurrency(market.btcPrice),
      tooltip: "Bitcoin guncel fiyati (Binance)",
    },
    {
      title: "Fear & Greed",
      value: String(market.fearGreed.value),
      tooltip: "Kripto piyasasi korku ve acgozluluk endeksi (0-100)",
      badge: {
        text: market.fearGreed.classification,
        className: fearGreedColor(market.fearGreed.value),
      },
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
      {cards.map((card, index) => (
        <div
          key={card.title}
          className={index === cards.length - 1 && cards.length % 2 !== 0 ? "col-span-2 md:col-span-1" : ""}
        >
          <KpiCard {...card} />
        </div>
      ))}
    </div>
  );
}
