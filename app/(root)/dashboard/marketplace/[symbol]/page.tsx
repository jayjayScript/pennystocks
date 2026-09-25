"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Icon } from "@iconify/react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
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
      description: apiStock.description,
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

      {/* About & Trade */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card variant="default" className="md:col-span-2">
          <h2 className="text-xl font-bold text-white mb-4">About {stock.name}</h2>
          <p className="text-penny-text-muted leading-relaxed text-sm">
            {stock.category ? `${stock.category} · ` : ""}{stock.exchange ? `Listed on ${stock.exchange}` : "Listed stock"}
            <br /><br />
            {stock.description || `No additional information has been provided for ${stock.name} yet.`}
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
