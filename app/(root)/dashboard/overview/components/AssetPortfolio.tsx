"use client";

import React from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { stocksApi } from "@/lib/api/backend";
import { useStocks } from "@/hooks/queries";

const ACCENT_PALETTE = [
  "rgba(0,212,161,0.15)",
  "rgba(245,197,24,0.15)",
  "rgba(66,133,244,0.15)",
  "rgba(244,67,54,0.15)",
  "rgba(118,185,0,0.15)",
  "rgba(255,153,0,0.15)",
  "rgba(120,120,212,0.15)",
];

function formatUSD(val: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);
}

export default function AssetPortfolio({ stocks: _stocks }: { stocks?: unknown[] }) {
  void _stocks;

  const { data: purchasesData, isLoading: purchasesLoading } = useQuery({
    queryKey: ["my-stock-purchases"],
    queryFn: () => stocksApi.mine(),
  });

  const { data: stocksData, isLoading: stocksLoading } = useStocks(1, 50);

  const openPurchases = (purchasesData ?? []).filter(
    (p) => (p.remainingQuantity ?? p.quantity) > 0 && p.status !== "closed"
  );

  const liveStocks = stocksData?.data ?? [];

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
    const bgColor = ACCENT_PALETTE[idx % ACCENT_PALETTE.length];

    return {
      symbol: h.symbol,
      name: h.name,
      amount: `${h.shares} ${h.shares === 1 ? "share" : "shares"}`,
      value: formatUSD(value),
      bgColor,
    };
  });

  const isLoading = purchasesLoading || stocksLoading;

  return (
    <div
      className="rounded-2xl p-6 bg-penny-bg-base border border-[#252f45] overflow-hidden flex flex-col h-full"
      style={{
        background: "linear-gradient(180deg, #111b2c 0%, #0d1624 100%)",
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full border border-[#252f45] flex items-center justify-center">
            <Icon icon="mdi:chart-line" className="text-white" width={20} />
          </div>
          <h2 className="text-xl font-semibold text-white">Asset Portfolio</h2>
        </div>
        <Link href="/dashboard/portfolio">
          <div className="p-2 rounded-full border border-[#252f45] flex items-center justify-center cursor-pointer hover:bg-white/5 transition-colors">
            <Icon
              icon="mdi:arrow-top-right"
              className="text-penny-text-muted"
              width={20}
            />
          </div>
        </Link>
      </div>

      <div
        className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar"
        style={{ maxHeight: "250px" }}
      >
        {isLoading ? (
          <div className="py-12 text-center text-xs text-penny-text-muted">
            <Icon icon="mdi:loading" width={24} className="mx-auto animate-spin mb-2" style={{ color: "#00d4a1" }} />
            Loading holdings...
          </div>
        ) : holdings.length === 0 ? (
          <div className="py-10 text-center text-penny-text-muted text-xs">
            <p className="font-semibold text-white">No active holdings</p>
            <p className="mt-1">Stocks you purchase will appear here.</p>
            <Link
              href="/dashboard/marketplace"
              className="inline-block mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#00d4a1]/10 text-[#00d4a1] border border-[#00d4a1]/20 hover:bg-[#00d4a1]/20 transition-colors"
            >
              Browse Stocks
            </Link>
          </div>
        ) : (
          holdings.map((asset) => (
            <Link
              href={`/dashboard/portfolio/${asset.symbol}`}
              key={asset.symbol}
              className="flex items-center justify-between group cursor-pointer hover:bg-white/5 p-2 -mx-2 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm shrink-0"
                  style={{
                    backgroundColor: asset.bgColor,
                    color: asset.bgColor.replace("0.15)", "1)"),
                  }}
                >
                  {asset.symbol[0]}
                </div>
                <div>
                  <p className="text-white font-medium">{asset.name}</p>
                  <p className="text-penny-text-muted text-sm">{asset.symbol}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-bold">{asset.amount}</p>
                <p className="text-penny-text-muted text-sm">{asset.value}</p>
              </div>
            </Link>
          ))
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}
