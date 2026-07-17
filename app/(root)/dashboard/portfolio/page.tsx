"use client";

import { usePortfolio } from "@/context/PortfolioContext";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";

const symbolColors: Record<string, string> = {
  BTC: "#F7931A",
  ETH: "#627EEA",
  BNB: "#F0B90B",
  SOL: "#14F195",
  LTC: "#BFBBBB",
  NGN: "#008751",
  USD: "#4CAF50",
};

export default function PortfolioIndexPage() {
  const { accountBalance, portfolio } = usePortfolio();

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  const totalInvested = portfolio.reduce((sum, asset) => {
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
          <p className="text-xl font-bold" style={{ color: "#00d4a1" }}>{formatCurrency(accountBalance)}</p>
        </div>
      </div>

      {/* Assets Grid */}
      {portfolio.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ background: "#151d2d", border: "1px dashed #252f45" }}>
          <Icon icon="mdi:briefcase-off" width={48} className="mx-auto mb-3" style={{ color: "#6b7785" }} />
          <p className="text-white font-semibold mb-1">No assets yet</p>
          <p className="text-sm mb-4" style={{ color: "#6b7785" }}>Start trading to build your portfolio</p>
          <Link href="/dashboard/marketplace" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: "#00d4a1", color: "#0d1624" }}>
            Browse Marketplace
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {portfolio.map((asset, index) => {
            const color = symbolColors[asset.symbol] || "#00d4a1";

            return (
              <Link key={index} href={`/dashboard/portfolio/${asset.symbol}`}>
                <Card variant="surface" className="hover:border-penny-accent/50 transition-all cursor-pointer h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: asset.bgColor || `${color}22` }}>
                        {asset.icon ? (
                          <Icon icon={asset.icon} width={24} style={{ color: color }} />
                        ) : (
                          <span className="text-lg font-bold" style={{ color }}>{asset.symbol[0]}</span>
                        )}
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
                        <p className="text-sm font-medium" style={{ color: "#9aa3b0" }}>{asset.amount} {asset.symbol}</p>
                      </div>
                      <p className="text-lg font-bold text-white">{asset.value}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}