"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";
import Link from "next/link";

import { useStocks } from "@/hooks/queries";
import CopyTradingCarousel from "./CopyTradingCarousel";
import BuyModal from "@/components/modals/BuyModal";
import { useStockRequests } from "@/context/StockRequestContext";

export default function MarketplaceScreen() {
  const [search, setSearch] = useState("");
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [buyOpen, setBuyOpen] = useState(false);
  const { stockRequests } = useStockRequests();

  // Only fetch approved stocks (isApproved === true)
  const { data: stocksData, isLoading: stocksLoading, error: stocksError } = useStocks(1, 100);

  // API stocks — only approved ones appear in marketplace
  const apiApprovedStocks: Stock[] = (stocksData?.data ?? [])
    .filter((s) => s.isApproved === true)
    .map((s) => ({
      id: s._id,
      symbol: s.acronym,
      name: s.name,
      price: new Intl.NumberFormat("en-US", { style: "currency", currency: s.currency || "USD" }).format(s.lastPrice),
      change: s.change24h.toFixed(2),
      pct: `${s.rateOfChange >= 0 ? "+" : ""}${s.rateOfChange.toFixed(2)}%`,
      up: s.rateOfChange >= 0,
      bgColor: "rgba(0, 212, 161, 0.1)",
    }));

  // User's own approved proposals (from local context)
  const myApprovedStocks: Stock[] = stockRequests
    .filter((r) => r.status === "approved")
    .map((r, i) => ({
      id: `approved-${r.id ?? i}`,
      symbol: r.ticker,
      name: r.name,
      price: `$${r.initialPrice.toFixed(2)}`,
      change: "0.00",
      pct: "+0.00%",
      up: true,
      bgColor: "rgba(0, 212, 161, 0.1)",
      description: r.description,
    }));

  const allMarketAssets = [...apiApprovedStocks, ...myApprovedStocks];

  const filtered = allMarketAssets.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.symbol.toLowerCase().includes(search.toLowerCase()),
  );

  const openBuy = (asset: Stock) => {
    setSelectedStock(asset);
    setBuyOpen(true);
  };

  return (
    <div className="w-full min-h-screen pb-10 overflow-x-hidden">
      {/* ── Carousel section – needs to bleed edge-to-edge ── */}
      <div className="pt-5 md:pt-8 w-full overflow-hidden mb-6">
        <CopyTradingCarousel />
      </div>

      {/* ── Search bar ── */}
      <div className="px-4 sm:px-6 md:px-8 mt-6 max-w-7xl mx-auto w-full">
        <div className="relative">
          <Icon
            icon="mdi:magnify"
            width={22}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-penny-text-muted"
          />
          <input
            type="text"
            placeholder="Search assets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-penny-surface-2 border border-penny-border-subtle rounded-2xl
              py-3.5 pl-12 pr-4 text-base text-white
              focus:outline-none focus:border-penny-accent transition-colors
              placeholder:text-penny-text-disabled"
          />
        </div>
      </div>

      {/* ── Desktop table header ── */}
      <div className="px-4 sm:px-6 md:px-8 mt-4 max-w-7xl mx-auto w-full">
        <div
          className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr] items-center px-5 py-3 rounded-xl text-xs font-semibold tracking-wide"
          style={{ color: "#6b7785", background: "#151d2d" }}
        >
          <span>Name</span>
          <span className="text-right">Last Price</span>
          <span className="text-right">24h Change</span>
          <span className="text-right">Status</span>
          <span className="text-right">Action</span>
        </div>
      </div>

      {/* ── Asset list ── */}
      <div className="px-4 sm:px-6 md:px-8 mt-3 space-y-3 max-w-7xl mx-auto w-full">
        {stocksLoading && (
          <p className="text-sm text-penny-text-muted py-8 text-center">Loading assets...</p>
        )}
        {stocksError && (
          <p className="text-sm text-red-400">Failed to load assets. Please try again.</p>
        )}
        {!stocksLoading && !stocksError && filtered.length === 0 && (
          <div className="text-center py-16">
            <Icon icon="mdi:chart-line-variant" width={48} className="mx-auto mb-3" style={{ color: "#6b7785" }} />
            <p className="text-white font-semibold mb-1">No Listed Assets Yet</p>
            <p className="text-sm max-w-sm mx-auto" style={{ color: "#6b7785" }}>
              Stocks must be approved by the admin before they appear in the marketplace.
            </p>
          </div>
        )}
        {filtered.map((asset, i) => (
          <div
            key={i}
            className="flex items-center justify-between
              md:grid md:grid-cols-[2fr_1fr_1fr_1fr_1fr]
              px-4 py-4 md:px-5 md:py-4 rounded-2xl
              transition-all duration-150 hover:border-penny-border-default"
            style={{ background: "#151d2d", border: "1px solid #1d2639" }}
          >
            {/* LEFT – Avatar + Name (navigates to detail) */}
            <Link
              href={`/dashboard/marketplace/${asset.symbol}`}
              className="flex items-center gap-4 min-w-0 flex-1"
            >
              <div
                className="w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center text-lg font-extrabold"
                style={{
                  background: asset.bgColor || "rgba(0,212,161,0.1)",
                  color: asset.bgColor
                    ? asset.bgColor.replace("0.1)", "1)")
                    : "var(--penny-accent)",
                }}
              >
                {asset.symbol[0]}
              </div>

              <div className="min-w-0">
                <p className="text-[15px] font-bold text-white leading-tight truncate">
                  {asset.symbol}
                </p>
                <p
                  className="text-[13px] leading-snug truncate mt-0.5"
                  style={{ color: "#9aa3b0" }}
                >
                  {asset.name}
                </p>
              </div>
            </Link>

            {/* RIGHT – mobile only: price stacked above pct */}
            <div className="flex flex-col items-end shrink-0 ml-3 md:hidden">
              <p className="text-[15px] font-bold text-white leading-tight">
                {asset.price}
              </p>
              <span
                className="mt-1 text-[12px] font-bold px-2.5 py-0.5 rounded-full"
                style={{
                  background: asset.up
                    ? "rgba(76,175,80,0.15)"
                    : "rgba(244,67,54,0.15)",
                  color: asset.up ? "#4CAF50" : "#F44336",
                }}
              >
                {asset.pct}
              </span>
            </div>

            {/* Desktop columns */}
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold text-white">{asset.price}</p>
            </div>

            <div className="hidden md:block text-right">
              <p className="text-sm" style={{ color: "#9aa3b0" }}>
                {asset.change}
              </p>
            </div>

            <div className="hidden md:block text-right">
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{
                  background: asset.up
                    ? "rgba(76,175,80,0.12)"
                    : "rgba(244,67,54,0.12)",
                  color: asset.up ? "#4CAF50" : "#F44336",
                }}
              >
                {asset.pct}
              </span>
            </div>

            {/* Trade button — stops propagation so row link doesn't fire */}
            <div className="hidden md:flex justify-end">
              <button
                onClick={() => openBuy(asset)}
                className="px-5 py-2 rounded-xl text-xs font-bold transition-all duration-150 hover:opacity-90 active:scale-95 hover:-translate-y-0.5"
                style={{ background: "#00d4a1", color: "#0d1624" }}
              >
                Trade
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Buy Modal ── */}
      {selectedStock && (
        <BuyModal
          stock={selectedStock}
          isOpen={buyOpen}
          onClose={() => setBuyOpen(false)}
        />
      )}
    </div>
  );
}
