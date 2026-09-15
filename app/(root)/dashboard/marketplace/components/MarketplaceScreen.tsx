"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";
import Link from "next/link";

import CopyTradingCarousel from "./CopyTradingCarousel";
import BuyModal from "@/components/modals/BuyModal";

type Stock = {
  id: string;
  symbol: string;
  name: string;
  price: string;
  change: string;
  pct: string;
  up: boolean;
  bgColor: string;
  description?: string;
};

const MOCK_STOCKS: Stock[] = [
  { id: "1", symbol: "AAPL",  name: "Apple Inc.",          price: "$175.20", change: "2.85",  pct: "+1.65%",  up: true,  bgColor: "rgba(120,120,120,0.15)", description: "Apple Inc. designs, manufactures and markets consumer electronics." },
  { id: "2", symbol: "TSLA",  name: "Tesla Inc.",           price: "$228.50", change: "-4.10", pct: "-1.76%",  up: false, bgColor: "rgba(204,0,0,0.15)",     description: "Tesla designs and manufactures electric vehicles and clean energy products." },
  { id: "3", symbol: "NVDA",  name: "NVIDIA Corporation",   price: "$485.10", change: "18.40", pct: "+3.95%",  up: true,  bgColor: "rgba(118,185,0,0.15)",   description: "NVIDIA is a global leader in visual computing and AI hardware." },
  { id: "4", symbol: "AMZN",  name: "Amazon.com Inc.",      price: "$192.75", change: "3.25",  pct: "+1.71%",  up: true,  bgColor: "rgba(255,153,0,0.15)",   description: "Amazon is the world's largest e-commerce and cloud computing company." },
  { id: "5", symbol: "MSFT",  name: "Microsoft Corporation",price: "$415.60", change: "-2.10", pct: "-0.50%",  up: false, bgColor: "rgba(0,120,212,0.15)",   description: "Microsoft develops, licenses, and supports a wide range of software products." },
  { id: "6", symbol: "GOOGL", name: "Alphabet Inc.",        price: "$176.30", change: "4.80",  pct: "+2.80%",  up: true,  bgColor: "rgba(66,133,244,0.15)",  description: "Alphabet is the parent company of Google and its various subsidiaries." },
];

export default function MarketplaceScreen() {
  const [search, setSearch] = useState("");
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [buyOpen, setBuyOpen] = useState(false);

  const filtered = MOCK_STOCKS.filter(
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
      {/* ── Carousel section */}
      <div className="pt-5 md:pt-8 w-full overflow-hidden mb-6">
        <CopyTradingCarousel />
      </div>

      {/* ── Search bar */}
      <div className="px-4 sm:px-6 md:px-8 mt-6 max-w-7xl mx-auto w-full">
        <div className="relative">
          <Icon icon="mdi:magnify" width={22} className="absolute left-4 top-1/2 -translate-y-1/2 text-penny-text-muted" />
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

      {/* ── Desktop table header */}
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

      {/* ── Asset list */}
      <div className="px-4 sm:px-6 md:px-8 mt-3 space-y-3 max-w-7xl mx-auto w-full">
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Icon icon="mdi:chart-line-variant" width={48} className="mx-auto mb-3" style={{ color: "#6b7785" }} />
            <p className="text-white font-semibold mb-1">No Results</p>
            <p className="text-sm max-w-sm mx-auto" style={{ color: "#6b7785" }}>Try a different search term.</p>
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
            {/* LEFT – Avatar + Name */}
            <Link href={`/dashboard/marketplace/${asset.symbol}`} className="flex items-center gap-4 min-w-0 flex-1">
              <div
                className="w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center text-lg font-extrabold"
                style={{ background: asset.bgColor, color: asset.bgColor.replace("0.15)", "1)") }}
              >
                {asset.symbol[0]}
              </div>
              <div className="min-w-0">
                <p className="text-[15px] font-bold text-white leading-tight truncate">{asset.symbol}</p>
                <p className="text-[13px] leading-snug truncate mt-0.5" style={{ color: "#9aa3b0" }}>{asset.name}</p>
              </div>
            </Link>

            {/* Mobile: price + pct */}
            <div className="flex flex-col items-end shrink-0 ml-3 md:hidden">
              <p className="text-[15px] font-bold text-white leading-tight">{asset.price}</p>
              <span
                className="mt-1 text-[12px] font-bold px-2.5 py-0.5 rounded-full"
                style={{ background: asset.up ? "rgba(76,175,80,0.15)" : "rgba(244,67,54,0.15)", color: asset.up ? "#4CAF50" : "#F44336" }}
              >
                {asset.pct}
              </span>
            </div>

            {/* Desktop columns */}
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold text-white">{asset.price}</p>
            </div>
            <div className="hidden md:block text-right">
              <p className="text-sm" style={{ color: "#9aa3b0" }}>{asset.change}</p>
            </div>
            <div className="hidden md:block text-right">
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: asset.up ? "rgba(76,175,80,0.12)" : "rgba(244,67,54,0.12)", color: asset.up ? "#4CAF50" : "#F44336" }}
              >
                {asset.pct}
              </span>
            </div>
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

      {/* ── Buy Modal */}
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
