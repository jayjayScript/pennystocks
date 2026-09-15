"use client";
import styles from "./AssetChart.module.css";

import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type ChartDataPoint = { time: string; fullDate: string; price: number };

function generateMockHistory(basePrice: number, points = 24): ChartDataPoint[] {
  const now = Date.now();
  return Array.from({ length: points }, (_, i) => {
    const date = new Date(now - (points - i) * 3600000);
    const noise = (Math.random() - 0.5) * basePrice * 0.02;
    const trend = (i / points) * basePrice * 0.05;
    return {
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      fullDate: date.toLocaleString(),
      price: +(basePrice + trend + noise).toFixed(2),
    };
  });
}

function formatUSD(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export default function AssetChart({ symbol, color = "#00d4a1", basePrice = 100 }: {
  symbol: string;
  color?: string;
  basePrice?: number;
  refreshIntervalMs?: number;
}) {
  const data = useMemo(() => generateMockHistory(basePrice), [basePrice]);

  const minPrice = Math.min(...data.map((d) => d.price));
  const maxPrice = Math.max(...data.map((d) => d.price));
  const padding = (maxPrice - minPrice) * 0.1;

  return (
    <div className={`${styles.glassCard} ${styles.loaded} w-full h-full min-h-[300px]`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`colorPrice-${symbol}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="time" hide />
          <YAxis domain={[minPrice - padding, maxPrice + padding]} hide />
          <Tooltip
            contentStyle={{ backgroundColor: "#151d2d", border: "1px solid #252f45", borderRadius: "12px", color: "#fff", fontWeight: "bold" }}
            itemStyle={{ color }}
            formatter={(value) => value !== undefined ? [formatUSD(value as number), "Price"] : ["", "Price"]}
            labelFormatter={(_label, payload) => (payload?.[0]?.payload as ChartDataPoint | undefined)?.fullDate ?? String(_label)}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={3}
            fillOpacity={1}
            fill={`url(#colorPrice-${symbol})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
