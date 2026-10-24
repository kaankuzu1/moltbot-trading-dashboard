"use client";

import { useId } from "react";
import { AreaChart, Area, YAxis, ResponsiveContainer } from "recharts";

interface SparklineProps {
  data: number[];
}

export function Sparkline({ data }: SparklineProps) {
  const gradientId = useId();

  if (!data || data.length < 2) return <span className="text-muted-foreground">—</span>;

  const uptrend = data[data.length - 1] >= data[0];
  const color = uptrend ? "#16a34a" : "#dc2626";
  const chartData = data.map((v) => ({ v }));

  const min = Math.min(...data);
  const max = Math.max(...data);
  const mid = (min + max) / 2;
  const pad = Math.max((max - min) * 0.1, mid * 0.001);

  return (
    <div className="inline-block h-[32px] w-[80px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis domain={[min - pad, max + pad]} hide />
          <Area
            type="linear"
            dataKey="v"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
