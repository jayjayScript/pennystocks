"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Icon } from "@iconify/react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import StockPriceChart from "./StockPriceChart";
import BuyModal from "@/components/modals/BuyModal";
import { useStocks } from "@/hooks/queries";

const ACCENT_PALETTE = [
  "rgba(0,212,161,0.15)",
  "rgba(245,197,24,0.15)",
  "rgba(66,133,244,0.15)",
  "rgba(244,67,54,0.15)",
  "rgba(118,185,0,0.15)",
  "rgba(255,153,0,0.15)",
  "rgba(120,120,212,0.15)",
  "rgba(204,0,0,0.15)",
];

export default function MarketplaceStockDetail() {
  const params = useParams<{ symbol: string }>();
  const decodedSymbol = decodeURIComponent(params.symbol).toUpperCase();
  const [buyOpen, setBuyOpen] = useState(false);

  const { data: stocksData, isLoading } = useStocks(1, 50);
  const apiStock = (stocksData?.data ?? []).find(
    (s) => s.acronym.toUpperCase() === decodedSymbol
  );

  const stock = apiStock
    ? {
        _id: apiStock._id,
        symbol: apiStock.acronym,
        name: apiStock.name,
        price: `$${apiStock.lastPrice.toFixed(2)}`,
        change: `${apiStock.change24h >= 0 ? "+" : ""}${apiStock.change24h.toFixed(2)}`,
        pct: `${apiStock.rateOfChange >= 0 ? "+" : ""}${apiStock.rateOfChange.toFixed(2)}%`,
        up: apiStock.rateOfChange >= 0,
        bgColor: ACCENT_PALETTE[Math.abs(apiStock.acronym.charCodeAt(0)) % ACCENT_PALETTE.length],
        category: apiStock.category,
        exchange: apiStock.exchange,
      }
    : null;

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <Icon icon="mdi:loading" width={40} className="mx-auto mb-3 animate-spin" style={{ color: "#00d4a1" }} />
        <p className="text-white">Loading…</p>
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="p-8 text-center text-white">
        <h1 className="text-2xl font-bold">Stock Not Found</h1>
        <Link href="/dashboard/marketplace" className="text-penny-accent mt-4 inline-block hover:underline">
          Return to Market Place
        </Link>
      </div>
    );
  }

  const basePrice = parseFloat(stock.price.replace(/[$,]/g, "")) || 100;
  const adminImages: { src: string; caption: string }[] = [];

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Back Navigation */}
      <div>
        <Link href="/dashboard/marketplace" className="inline-flex items-center gap-2 text-sm text-penny-text-muted hover:text-white transition-colors">
          <Icon icon="mdi:arrow-left" width={18} />
          Back to Market Place
        </Link>
      </div>

      {/* Header Info */}
      <Card variant="default" className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4 relative z-10">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0"
            style={{ background: stock.bgColor, color: stock.bgColor.replace("0.15)", "1)") }}
          >
            {stock.symbol[0]}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">{stock.name}</h1>
            <p className="text-penny-text-muted text-lg">{stock.symbol}</p>
          </div>
        </div>

        <div className="text-left md:text-right relative z-10">
          <p className="text-3xl font-bold text-white">{stock.price}</p>
          <div className="flex items-center md:justify-end gap-2 mt-1">
            <span className="text-penny-text-muted font-medium text-sm">24h Change:</span>
            <Badge variant={stock.up ? "success" : "danger"} size="md">
              {stock.pct} ({stock.change})
            </Badge>
          </div>
        </div>
      </Card>

      {/* Price Chart & Market Stats */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Interactive Chart */}
        <Card padding="none" variant="default" className="lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <div>
              <h2 className="text-white font-semibold text-base">Price Chart</h2>
              <p className="text-penny-text-muted text-xs mt-0.5">Today · Simulated intraday data</p>
            </div>
            <Badge variant={stock.up ? "success" : "danger"} size="sm">{stock.pct}</Badge>
          </div>
          <div className="h-64 w-full px-1 pb-4">
            <StockPriceChart symbol={stock.symbol} up={stock.up} basePrice={basePrice} />
          </div>
        </Card>

        {/* Admin Image Gallery */}
        <Card variant="default">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Media &amp; Updates</h2>
            <span className="text-xs text-penny-text-disabled bg-penny-surface-2 border border-penny-border-subtle px-2.5 py-1 rounded-full">Admin uploads</span>
          </div>

          {adminImages.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {adminImages.map((img, i) => (
                <div key={i} className="relative group rounded-xl overflow-hidden border border-penny-border-subtle aspect-video bg-penny-surface-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.src} alt={img.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-penny-border-subtle rounded-2xl gap-3">
              <div className="w-14 h-14 rounded-2xl bg-penny-surface-2 flex items-center justify-center">
                <Icon icon="mdi:image-plus-outline" width={28} className="text-penny-text-muted" />
              </div>
              <p className="text-penny-text-muted text-sm font-medium">No images uploaded yet</p>
              <p className="text-penny-text-disabled text-xs text-center max-w-xs">
                Admins can upload charts, announcements and media for this asset from the admin panel.
              </p>
            </div>
          )}
        </Card>

        {/* Market Stats */}
        <Card variant="default" className="flex flex-col gap-4">
          <h3 className="text-white font-semibold text-lg border-b border-penny-border-default pb-2">Market Stats</h3>
          <div className="flex justify-between items-center"><span className="text-penny-text-muted text-sm">Market Cap</span><span className="text-white font-medium text-sm">$1.2T</span></div>
          <div className="flex justify-between items-center"><span className="text-penny-text-muted text-sm">Volume (24h)</span><span className="text-white font-medium text-sm">$34.5B</span></div>
          <div className="flex justify-between items-center"><span className="text-penny-text-muted text-sm">Circulating Supply</span><span className="text-white font-medium text-sm">19.5M {stock.symbol}</span></div>
          <div className="flex justify-between items-center"><span className="text-penny-text-muted text-sm">All Time High</span><span className="text-white font-medium text-sm">$73,750.00</span></div>
        </Card>
      </div>

      {/* About & Trade */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card variant="default" className="md:col-span-2">
          <h2 className="text-xl font-bold text-white mb-4">About {stock.name}</h2>
          <p className="text-penny-text-muted leading-relaxed text-sm">
            {stock.category ? `${stock.category} · ` : ""}{stock.exchange ? `Listed on ${stock.exchange}` : "Listed stock"}
            <br /><br />
            <strong className="text-white">Project Overview:</strong> This asset has shown significant resilience over the past few quarters, maintaining strong support levels despite broader market volatility. Integration with multiple decentralized finance protocols continues to drive fundamental value.
          </p>
        </Card>

        {/* Trade card */}
        <Card variant="default" className="flex flex-col justify-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-penny-accent opacity-5 rounded-full blur-3xl -mr-10 -mt-10" />
          <h3 className="text-lg font-semibold text-white mb-2 relative z-10">Ready to Trade?</h3>
          <p className="text-sm text-penny-text-muted mb-6 px-2 relative z-10">Invest in {stock.name} today to diversify your portfolio.</p>

          <div className="relative z-10 w-full mb-4">
            <Button variant="primary" size="lg" fullWidth icon="mdi:arrow-down" className="cursor-pointer" onClick={() => setBuyOpen(true)}>
              Buy {stock.symbol}
            </Button>
          </div>

          <p className="text-xs text-center text-penny-text-disabled relative z-10">Estimated execution: Instant · Fee: 0.1%</p>
        </Card>
      </div>

      <BuyModal stock={stock} isOpen={buyOpen} onClose={() => setBuyOpen(false)} />
    </div>
  );
}
