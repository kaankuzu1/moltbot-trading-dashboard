"use client";

import { useId } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { formatPrice } from "@/lib/format";

const SHORT_DAYS = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

interface AssetCardSparklineProps {
  data: { time: number; close: number }[];
  color: string;
}

export function AssetCardSparkline({ data, color }: AssetCardSparklineProps) {
  const gradientId = useId();

  if (!data || data.length < 2) {
    return (
      <div className="flex h-[120px] items-center justify-center sm:h-[140px]">
        <span className="text-sm text-muted-foreground">—</span>
      </div>
    );
  }

  const chartData = data.map((d) => ({ timestamp: d.time, v: d.close }));
  const values = data.map((d) => d.close);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const mid = (min + max) / 2;
  const pad = Math.max((max - min) * 0.1, mid * 0.001);

  const ticks = chartData.map((d) => d.timestamp);

  return (
    <div className="h-[120px] sm:h-[140px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ bottom: 0, left: 0, right: 0, top: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="timestamp"
            type="number"
            scale="time"
            domain={["dataMin", "dataMax"]}
            ticks={ticks}
            tickFormatter={(ts) => SHORT_DAYS[new Date(ts).getUTCDay()]}
            tickLine={false}
            axisLine={false}
            tickMargin={4}
            tick={{ fontSize: 10 }}
            className="[&_text]:fill-muted-foreground"
          />
          <YAxis domain={[min - pad, max + pad]} hide />
          <Tooltip
            cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: "4 4" }}
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              return (
                <div className="rounded-lg border bg-background px-2.5 py-1.5 shadow-md">
                  <span className="font-mono text-xs font-semibold">
                    {formatPrice(payload[0].value as number)}
                  </span>
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={2.5}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ r: 4, fill: color, stroke: "var(--background)", strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
