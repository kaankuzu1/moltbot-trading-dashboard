"use client";

import { useState, useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/format";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/lib/wallet-context";
import type { HistorySnapshot } from "@/lib/types";

interface BalanceChartProps {
  snapshots: HistorySnapshot[];
  currentValue?: number;
}

const SHORT_DAYS = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
const SHORT_MONTHS = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

function formatTickByRange(ts: number, rangeKey: string): string {
  const d = new Date(ts);
  if (rangeKey === "1w") {
    return SHORT_DAYS[d.getUTCDay()];
  }
  if (rangeKey === "2w") {
    return `${d.getUTCDate()} ${SHORT_MONTHS[d.getUTCMonth()]}`;
  }
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
}

const timeRanges = [
  { key: "1w", label: "1H", days: 7, tickInterval: 1 },
  { key: "2w", label: "2H", days: 14, tickInterval: 2 },
  { key: "1m", label: "1A", days: 30, tickInterval: 3 },
] as const;

type TimeRangeKey = (typeof timeRanges)[number]["key"];

const chartConfig = {
  value: {
    label: "Deger",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// "Nice numbers" algorithm for readable Y-axis ticks
function niceNum(range: number, round: boolean): number {
  const exponent = Math.floor(Math.log10(range));
  const fraction = range / Math.pow(10, exponent);
  let niceFraction: number;
  if (round) {
    if (fraction < 1.5) niceFraction = 1;
    else if (fraction < 3) niceFraction = 2;
    else if (fraction < 7) niceFraction = 5;
    else niceFraction = 10;
  } else {
    if (fraction <= 1) niceFraction = 1;
    else if (fraction <= 2) niceFraction = 2;
    else if (fraction <= 5) niceFraction = 5;
    else niceFraction = 10;
  }
  return niceFraction * Math.pow(10, exponent);
}

function niceScale(minVal: number, maxVal: number, maxTicks = 6): { min: number; max: number; tickSpacing: number; ticks: number[] } {
  const range = niceNum(maxVal - minVal || 1, false);
  const tickSpacing = niceNum(range / (maxTicks - 1), true);
  const niceMin = Math.floor(minVal / tickSpacing) * tickSpacing - tickSpacing;
  const niceMax = Math.ceil(maxVal / tickSpacing) * tickSpacing;
  const ticks: number[] = [];
  for (let v = niceMin; v <= niceMax + tickSpacing * 0.5; v += tickSpacing) {
    ticks.push(Math.round(v * 100) / 100);
  }
  return { min: niceMin, max: niceMax, tickSpacing, ticks };
}

function startOfDayUTC(date: Date): number {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d.getTime();
}

function fillMissingDays(snapshots: HistorySnapshot[]): { timestamp: number; value: number }[] {
  if (snapshots.length === 0) return [];

  const dayMap = new Map<number, number>();
  for (const s of snapshots) {
    const dayTs = startOfDayUTC(new Date(s.date));
    dayMap.set(dayTs, s.totalValue);
  }

  const sortedDays = Array.from(dayMap.keys()).sort((a, b) => a - b);
  const firstDay = sortedDays[0];
  const today = startOfDayUTC(new Date());
  const result: { timestamp: number; value: number }[] = [];

  let lastValue = dayMap.get(firstDay)!;
  for (let ts = firstDay; ts <= today; ts += ONE_DAY_MS) {
    if (dayMap.has(ts)) {
      lastValue = dayMap.get(ts)!;
    }
    result.push({ timestamp: ts, value: lastValue });
  }

  return result;
}

function generateTicks(startTs: number, endTs: number, intervalDays: number): number[] {
  const ticks: number[] = [];
  // Start from the end and work backwards so the last tick aligns with the end
  for (let ts = endTs; ts >= startTs; ts -= intervalDays * ONE_DAY_MS) {
    ticks.unshift(ts);
  }
  return ticks;
}

export function BalanceChart({ snapshots, currentValue }: BalanceChartProps) {
  const [selectedRange, setSelectedRange] = useState<TimeRangeKey>("1m");
  const { applyWallet } = useWallet();

  // Append today's real-time balance as the latest data point
  const allSnapshots = useMemo(() => {
    if (!snapshots || snapshots.length === 0) return [];
    if (currentValue == null) return snapshots;

    const todayUTC = new Date();
    todayUTC.setUTCHours(12, 0, 0, 0);
    return [...snapshots, { date: todayUTC.toISOString(), totalValue: currentValue }];
  }, [snapshots, currentValue]);

  const chartData = useMemo(() => {
    if (allSnapshots.length === 0) return [];

    const range = timeRanges.find((r) => r.key === selectedRange);
    if (!range) return [];

    const cutoffTs = startOfDayUTC(new Date()) - range.days * ONE_DAY_MS;
    const filtered = allSnapshots.filter((s) => new Date(s.date).getTime() >= cutoffTs);
    const filled = fillMissingDays(filtered);

    return filled.map((d) => ({
      timestamp: d.timestamp,
      value: applyWallet(d.value),
    }));
  }, [allSnapshots, selectedRange, applyWallet]);

  const tickArray = useMemo(() => {
    if (chartData.length === 0) return [];
    const range = timeRanges.find((r) => r.key === selectedRange);
    if (!range) return [];

    const startTs = chartData[0].timestamp;
    const endTs = chartData[chartData.length - 1].timestamp;
    return generateTicks(startTs, endTs, range.tickInterval);
  }, [chartData, selectedRange]);

  if (allSnapshots.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portfolyo Degeri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            Henuz veri yok
          </div>
        </CardContent>
      </Card>
    );
  }

  // Y-axis domain with nice round ticks
  const values = chartData.map((d) => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const nice = niceScale(minVal, maxVal);
  const yDomain: [number, number] = [nice.min, nice.max];
  const yTicks = nice.ticks;

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 space-y-0 pb-2 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-base sm:text-lg">Portfolyo Degeri</CardTitle>
        <div className="flex gap-1">
          {timeRanges.map((r) => (
            <Button
              key={r.key}
              variant={selectedRange === r.key ? "default" : "outline"}
              size="sm"
              className="h-7 px-2 text-xs sm:px-2.5"
              onClick={() => setSelectedRange(r.key)}
            >
              {r.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            Bu aralikta veri yok
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[220px] w-full sm:h-[300px]">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 5, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-value)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-value)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="timestamp"
                type="number"
                scale="time"
                domain={["dataMin", "dataMax"]}
                ticks={tickArray}
                tickFormatter={(ts) => formatTickByRange(ts, selectedRange)}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(v) => v >= 1000 ? `$${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k` : `$${v.toFixed(0)}`}
                width={50}
                domain={yDomain}
                ticks={yTicks}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(_, payload) => {
                      if (payload && payload.length > 0) {
                        const d = new Date(payload[0].payload.timestamp);
                        const day = String(d.getUTCDate()).padStart(2, "0");
                        const month = String(d.getUTCMonth() + 1).padStart(2, "0");
                        return `${day}/${month}`;
                      }
                      return "";
                    }}
                    formatter={(value) => formatCurrency(value as number)}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--color-value)"
                strokeWidth={2}
                fill="url(#valueGradient)"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
