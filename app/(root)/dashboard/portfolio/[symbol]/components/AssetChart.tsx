"use client";
import styles from "./AssetChart.module.css";

import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { fetchTopAssets, fetchAssetHistory } from "@/lib/api/coincap";
import { Icon } from "@iconify/react";
import { formatUSD } from "@/context/PortfolioContext";

type ChartDataPoint = {
  time: string;
  fullDate: string;
  price: number;
};

export default function AssetChart({ symbol, color = "#00d4a1", refreshIntervalMs = 0 }: { symbol: string; color?: string; refreshIntervalMs?: number }) {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    async function loadData() {
      try {
        setError(null);
        setIsLoading(true);
        // Find the CoinGecko id for this symbol
        const assets = await fetchTopAssets(200);
        const asset = assets.find((a) => a.symbol.toUpperCase() === symbol.toUpperCase());
        if (!asset) {
          throw new Error('Asset not found');
        }
        // Fetch 1 day of hourly history
        const prices = await fetchAssetHistory(asset.id, 1);
        const chartData = prices.map(([timestamp, price]: [number, number]) => {
          const date = new Date(timestamp);
          return {
            time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            fullDate: date.toLocaleString(),
            price,
          };
        });
        setData(chartData);
        setIsLoaded(true);
      } catch (e) {
  const errorMessage = e instanceof Error ? e.message : 'Failed to load chart data';
  setError(errorMessage);
} finally {
  setIsLoading(false);
}
    }
    loadData();
    if (refreshIntervalMs > 0) {
      intervalId = setInterval(loadData, refreshIntervalMs);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [symbol, refreshIntervalMs]);

  if (isLoading) {
    return (
      <div className={`${styles.glassCard} w-full h-full flex flex-col items-center justify-center text-penny-text-muted`}> 
        <Icon icon="mdi:loading" width={40} className="animate-spin mb-3" />
        <p className="text-sm">Loading chart data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.glassCard} w-full h-full flex flex-col items-center justify-center text-penny-text-muted`}> 
        <p className="text-sm text-red-400">{error}</p>
        <button
          className="mt-2 px-4 py-2 bg-penny-primary text-white rounded hover:bg-penny-primary-dark transition cursor-pointer"
          onClick={() => {
            setIsLoaded(false);
            setData([]);
            setError(null);
            // trigger reload by changing symbol (noop) – call loadData directly
          }}
        >Retry</button>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`${styles.glassCard} w-full h-full flex items-center justify-center text-penny-text-muted`}> 
        <p className="text-sm">No chart data available for {symbol}</p>
      </div>
    );
  }

  const minPrice = Math.min(...data.map((d) => d.price));
  const maxPrice = Math.max(...data.map((d) => d.price));
  const padding = (maxPrice - minPrice) * 0.1;

  return (
    <div className={`${styles.glassCard} ${isLoaded ? styles.loaded : ''} w-full h-full min-h-[300px]`}>
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
            contentStyle={{
              backgroundColor: "#151d2d",
              border: "1px solid #252f45",
              borderRadius: "12px",
              color: "#fff",
              fontWeight: "bold",
            }}
            itemStyle={{ color }}
            formatter={(value) => value !== undefined ? [formatUSD(value as number), "Price"] : ["", "Price"]}
            labelFormatter={(_label, payload) =>
                (payload?.[0]?.payload as ChartDataPoint | undefined)?.fullDate ?? String(_label)
              }
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
