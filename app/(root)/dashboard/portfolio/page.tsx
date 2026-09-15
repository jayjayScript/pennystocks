"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";

const MOCK_PORTFOLIO = [
  { symbol: "AAPL",  name: "Apple Inc.",           amount: "5 shares", value: "$875.50",   bgColor: "rgba(120,120,120,0.15)", icon: "mdi:apple",         up: true,  pct: "+2.1%",  change: "2.85" },
  { symbol: "BTC",   name: "Bitcoin",              amount: "0.02 BTC", value: "$1,240.00", bgColor: "rgba(247,147,26,0.15)",  icon: "mdi:bitcoin",       up: true,  pct: "+4.7%",  change: "56.30" },
  { symbol: "TSLA",  name: "Tesla Inc.",           amount: "3 shares", value: "$690.00",   bgColor: "rgba(204,0,0,0.15)",    icon: "mdi:car-electric",  up: false, pct: "-1.3%",  change: "-3.05" },
];

const MOCK_ACCOUNT_BALANCE = 12450.00;

const symbolColors: Record<string, string> = {
  AAPL: "#888888", BTC: "#F7931A", ETH: "#627EEA", BNB: "#F0B90B", SOL: "#14F195", TSLA: "#CC0000",
};

export default function PortfolioIndexPage() {
  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  const totalInvested = MOCK_PORTFOLIO.reduce((sum, asset) => {
    const value = parseFloat(asset.value.replace(/[$,]/g, "")) || 0;
    return sum + value;
  }, 0);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,212,161,0.1)" }}>
            <Icon icon="mdi:briefcase" width={22} style={{ color: "#00d4a1" }} />
          </div>
          <div>
            <p className="text-sm" style={{ color: "#6b7785" }}>Your portfolio</p>
            <h1 className="text-2xl font-bold text-white">All Assets</h1>
          </div>
        </div>
        <Link
          href="/dashboard/marketplace"
          className="px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2"
          style={{ background: "#00d4a1", color: "#0d1624" }}
        >
          <Icon icon="mdi:plus" width={16} />
          Buy
        </Link>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl p-4" style={{ background: "#151d2d", border: "1px solid #252f45" }}>
          <p className="text-xs mb-1" style={{ color: "#6b7785" }}>Total Value</p>
          <p className="text-xl font-bold text-white">{formatCurrency(totalInvested)}</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: "#151d2d", border: "1px solid #252f45" }}>
          <p className="text-xs mb-1" style={{ color: "#6b7785" }}>Cash Balance</p>
          <p className="text-xl font-bold" style={{ color: "#00d4a1" }}>{formatCurrency(MOCK_ACCOUNT_BALANCE)}</p>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {MOCK_PORTFOLIO.map((asset, index) => {
          const color = symbolColors[asset.symbol] || "#00d4a1";
          return (
            <Link key={index} href={`/dashboard/portfolio/${asset.symbol}`}>
              <Card variant="surface" className="hover:border-penny-accent/50 transition-all cursor-pointer h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: asset.bgColor }}>
                      <Icon icon={asset.icon} width={24} style={{ color }} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{asset.name}</h3>
                      <p className="text-sm" style={{ color: "#6b7785" }}>{asset.symbol}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold px-2 py-1 rounded-full" style={{ background: asset.up ? "rgba(76,175,80,0.12)" : "rgba(244,67,54,0.12)", color: asset.up ? "#4CAF50" : "#F44336" }}>
                    {asset.pct}
                  </span>
                </div>

                <div className="pt-3" style={{ borderTop: "1px solid #1d2639" }}>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs mb-1" style={{ color: "#6b7785" }}>Holdings</p>
                      <p className="text-sm font-medium" style={{ color: "#9aa3b0" }}>{asset.amount}</p>
                    </div>
                    <p className="text-lg font-bold text-white">{asset.value}</p>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}