"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";


/** Generate deterministic-looking simulated OHLC price data for the given symbol */
function generatePriceData(symbol: string, basePrice: number): DataPoint[] {
  const seed = symbol.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const points: DataPoint[] = [];
  let price = basePrice * 0.9;

  const hours = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
    "22:00",
  ];

  hours.forEach((time, i) => {
    const noise = Math.sin(seed + i * 1.7) * basePrice * 0.025;
    const trend = (i / hours.length) * basePrice * 0.12;
    price = basePrice * 0.9 + trend + noise;
    points.push({ time, price: parseFloat(price.toFixed(2)) });
  });

  return points;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-penny-surface-2 border border-penny-border-subtle rounded-xl px-3 py-2 text-xs shadow-lg">
        <p className="text-penny-text-muted mb-1">{label}</p>
        <p className="text-white font-bold">
          $
          {payload[0].value.toLocaleString(undefined, {
            minimumFractionDigits: 2,
          })}
        </p>
      </div>
    );
  }
  return null;
};

export default function StockPriceChart({ symbol, up, basePrice }: StockPriceChartProps) {
  const data = generatePriceData(symbol, basePrice);
  const strokeColor = up
    ? "var(--penny-accent)"
    : "var(--penny-error, #ef4444)";
  const gradientId = `grad-${symbol}`;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{ top: 16, right: 16, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={strokeColor} stopOpacity={0.25} />
            <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.06)"
          vertical={false}
        />

        <XAxis
          dataKey="time"
          tick={{ fill: "var(--penny-text-muted, #9ca3af)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          interval={2}
        />

        <YAxis
          domain={["auto", "auto"]}
          tick={{ fill: "var(--penny-text-muted, #9ca3af)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) =>
            `$${Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
          }
          width={72}
        />

        <Tooltip content={<CustomTooltip />} />

        <Area
          type="monotone"
          dataKey="price"
          stroke={strokeColor}
          strokeWidth={2.5}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={{ r: 5, fill: strokeColor, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
