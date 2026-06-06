"use client";

import { Icon } from "@iconify/react";

const holdings = [
  { symbol: "BTC", name: "Bitcoin",  qty: "0.24 BTC",  value: "$1,892.25",  pnl: "+$240.50",  pct: "+14.6%", up: true  },
  { symbol: "ETH", name: "Ethereum", qty: "1.80 ETH",  value: "$387.47",    pnl: "-$42.10",   pct: "-9.8%",  up: false },
  { symbol: "BNB", name: "BNB",      qty: "3.10 BNB",  value: "$571.28",    pnl: "+$88.00",   pct: "+18.2%", up: true  },
  { symbol: "LTC", name: "Litecoin", qty: "12.5 LTC",  value: "$1,892.25",  pnl: "+$120.00",  pct: "+6.7%",  up: true  },
  { symbol: "NGN", name: "Naira",    qty: "50,000 NGN", value: "$33.80",    pnl: "-$2.10",    pct: "-5.8%",  up: false },
];

const symbolColors: Record<string, string> = {
  BTC: "#F7931A", ETH: "#627EEA", BNB: "#F0B90B",
  NGN: "#008751", LTC: "#BFBBBB",
};

const totalValue = "$4,776.05";

export default function MyStocksScreen() {
  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm" style={{ color: "#9aa3b0" }}>Your holdings</p>
          <h1 className="text-2xl font-bold text-white mt-0.5">My Stocks</h1>
        </div>
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
          style={{ background: "rgba(0,212,161,0.12)", color: "#00d4a1" }}
        >
          <Icon icon="mdi:trending-up" width={14} />
          Portfolio Up
        </div>
      </div>

      {/* Portfolio total */}
      <div
        className="rounded-2xl p-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #151d2d 0%, #1b2a40 100%)", border: "1px solid #252f45" }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{ background: "radial-gradient(circle at 80% 50%, #00d4a1, transparent 60%)" }}
        />
        <p className="text-sm mb-1 relative z-10" style={{ color: "#9aa3b0" }}>Total Portfolio Value</p>
        <p className="text-4xl font-extrabold text-white mb-1 relative z-10">{totalValue}</p>
        <div className="flex items-center gap-2 relative z-10">
          <Icon icon="mdi:trending-up" width={14} style={{ color: "#4CAF50" }} />
          <span className="text-sm font-semibold" style={{ color: "#4CAF50" }}>+$446.40 (9.3%) all time</span>
        </div>
      </div>

      {/* Donut chart placeholder */}
      <div
        className="rounded-2xl p-5 flex items-center gap-6"
        style={{ background: "#151d2d", border: "1px solid #1d2639" }}
      >
        {/* Simple donut */}
        <svg viewBox="0 0 80 80" className="w-20 h-20 shrink-0">
          <circle cx="40" cy="40" r="30" fill="none" stroke="#1d2639" strokeWidth="12" />
          <circle cx="40" cy="40" r="30" fill="none" stroke="#00d4a1" strokeWidth="12"
            strokeDasharray="94 100" strokeDashoffset="25" strokeLinecap="round" />
          <circle cx="40" cy="40" r="30" fill="none" stroke="#F7931A" strokeWidth="12"
            strokeDasharray="40 100" strokeDashoffset="-69" strokeLinecap="round" />
          <text x="40" y="44" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">100%</text>
        </svg>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
          {holdings.slice(0, 4).map((h) => (
            <div key={h.symbol} className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: symbolColors[h.symbol] || "#00d4a1" }}
              />
              <span className="text-xs" style={{ color: "#9aa3b0" }}>{h.symbol}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop table header */}
      <div
        className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr] px-4 py-2 rounded-xl text-xs font-semibold"
        style={{ color: "#6b7785", background: "#151d2d" }}
      >
        <span>Asset</span>
        <span className="text-right">Value</span>
        <span className="text-right">P&amp;L</span>
        <span className="text-right">Change</span>
      </div>

      {/* Holdings list */}
      <div className="space-y-2">
        {holdings.map((h, i) => (
          <div
            key={i}
            className="flex items-center justify-between px-4 py-4 rounded-xl
              md:grid md:grid-cols-[2fr_1fr_1fr_1fr]"
            style={{ background: "#151d2d", border: "1px solid #1d2639" }}
          >
            {/* Asset */}
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{
                  background: `${symbolColors[h.symbol] || "#00d4a1"}22`,
                  color: symbolColors[h.symbol] || "#00d4a1",
                }}
              >
                {h.symbol[0]}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{h.symbol}</p>
                <p className="text-xs" style={{ color: "#9aa3b0" }}>{h.qty}</p>
              </div>
            </div>

            {/* Value */}
            <div className="text-right">
              <p className="text-sm font-semibold text-white">{h.value}</p>
            </div>

            {/* PnL — desktop */}
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold" style={{ color: h.up ? "#4CAF50" : "#F44336" }}>{h.pnl}</p>
            </div>

            {/* Change */}
            <div className="text-right">
              <span
                className="text-xs font-bold px-2 py-1 rounded-full"
                style={{
                  background: h.up ? "rgba(76,175,80,0.12)" : "rgba(244,67,54,0.12)",
                  color: h.up ? "#4CAF50" : "#F44336",
                }}
              >
                {h.pct}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
