"use client";

import React from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { useQuery } from "@tanstack/react-query";
import { stocksApi } from "@/lib/api/backend";
import { useStocks } from "@/hooks/queries";
import { usePortfolio } from "@/context/PortfolioContext";

const ACCENT_PALETTE = [
  "rgba(0,212,161,0.15)",
  "rgba(245,197,24,0.15)",
  "rgba(66,133,244,0.15)",
  "rgba(244,67,54,0.15)",
  "rgba(118,185,0,0.15)",
  "rgba(255,153,0,0.15)",
  "rgba(120,120,212,0.15)",
];

export default function PortfolioIndexPage() {
  const { accountBalance } = usePortfolio();
  const { data: purchasesData, isLoading: purchasesLoading } = useQuery({
    queryKey: ["my-stock-purchases"],
    queryFn: () => stocksApi.mine(),
  });

  const { data: stocksData, isLoading: stocksLoading } = useStocks(1, 50);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  const openPurchases = (purchasesData ?? []).filter(
    (p) => (p.remainingQuantity ?? p.quantity) > 0 && p.status !== "closed"
  );

  const liveStocks = stocksData?.data ?? [];

  // Group holdings by stock ticker
  const holdingsMap = new Map<
    string,
    {
      symbol: string;
      name: string;
      shares: number;
      avgBuyPrice: number;
    }
  >();

  for (const p of openPurchases) {
    const sym = p.stockAcronym.toUpperCase();
    const qty = p.remainingQuantity ?? p.quantity;
    const existing = holdingsMap.get(sym);
    if (existing) {
      existing.shares += qty;
    } else {
      holdingsMap.set(sym, {
        symbol: sym,
        name: p.stockName,
        shares: qty,
        avgBuyPrice: p.pricePerShare,
      });
    }
  }

  const holdings = Array.from(holdingsMap.values()).map((h, idx) => {
    const live = liveStocks.find((s) => s.acronym.toUpperCase() === h.symbol);
    const currentPrice = live?.lastPrice ?? h.avgBuyPrice;
    const value = h.shares * currentPrice;
    const up = live ? live.rateOfChange >= 0 : true;
    const pct = live ? `${live.rateOfChange >= 0 ? "+" : ""}${live.rateOfChange.toFixed(2)}%` : "0.00%";
    const bgColor = ACCENT_PALETTE[idx % ACCENT_PALETTE.length];

    return {
      symbol: h.symbol,
      name: h.name,
      shares: h.shares,
      amount: `${h.shares} ${h.shares === 1 ? "share" : "shares"}`,
      valueNum: value,
      value: formatCurrency(value),
      bgColor,
      up,
      pct,
    };
  });

  const totalHoldingsValue = holdings.reduce((sum, item) => sum + item.valueNum, 0);
  const isLoading = purchasesLoading || stocksLoading;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(0,212,161,0.1)" }}
          >
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
          <p className="text-xs mb-1" style={{ color: "#6b7785" }}>Total Portfolio Value</p>
          <p className="text-xl font-bold text-white">
            {isLoading ? "—" : formatCurrency(totalHoldingsValue)}
          </p>
        </div>
        <div className="rounded-xl p-4" style={{ background: "#151d2d", border: "1px solid #252f45" }}>
          <p className="text-xs mb-1" style={{ color: "#6b7785" }}>Cash Balance</p>
          <p className="text-xl font-bold" style={{ color: "#00d4a1" }}>
            {formatCurrency(accountBalance)}
          </p>
        </div>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="py-20 text-center">
          <Icon icon="mdi:loading" width={36} className="mx-auto animate-spin mb-3" style={{ color: "#00d4a1" }} />
          <p className="text-sm" style={{ color: "#9aa3b0" }}>Loading your portfolio...</p>
        </div>
      ) : holdings.length === 0 ? (
        <div
          className="rounded-2xl p-10 text-center"
          style={{ background: "#151d2d", border: "1px solid #252f45" }}
        >
          <Icon icon="mdi:chart-line-variant" width={48} className="mx-auto" style={{ color: "#6b7785" }} />
          <h3 className="text-lg font-bold text-white mt-3">No Assets in Your Portfolio</h3>
          <p className="text-xs mt-1 max-w-sm mx-auto" style={{ color: "#9aa3b0" }}>
            You don&apos;t have any open stock holdings. Browse available stocks in the marketplace to start trading.
          </p>
          <Link
            href="/dashboard/marketplace"
            className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-xl text-xs font-bold"
            style={{ background: "#00d4a1", color: "#0d1624" }}
          >
            <Icon icon="mdi:magnify" width={16} />
            Explore Marketplace
          </Link>
        </div>
      ) : (
        /* Assets Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {holdings.map((asset) => (
            <Link key={asset.symbol} href={`/dashboard/portfolio/${asset.symbol}`}>
              <Card variant="surface" className="hover:border-penny-accent/50 transition-all cursor-pointer h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base"
                      style={{
                        background: asset.bgColor,
                        color: asset.bgColor.replace("0.15)", "1)"),
                      }}
                    >
                      {asset.symbol[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{asset.name}</h3>
                      <p className="text-sm" style={{ color: "#6b7785" }}>{asset.symbol}</p>
                    </div>
                  </div>
                  <span
                    className="text-xs font-semibold px-2 py-1 rounded-full"
                    style={{
                      background: asset.up ? "rgba(76,175,80,0.12)" : "rgba(244,67,54,0.12)",
                      color: asset.up ? "#4CAF50" : "#F44336",
                    }}
                  >
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
          ))}
        </div>
      )}
    </div>
  );
}