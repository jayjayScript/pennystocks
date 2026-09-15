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

type Stock = {
  symbol: string;
  name: string;
  price: string;
  change: string;
  pct: string;
  up: boolean;
  bgColor: string;
  icon?: string;
  description?: string;
};

const MOCK_STOCKS: Stock[] = [
  { symbol: "AAPL",  name: "Apple Inc.",           price: "$175.20", change: "2.85",  pct: "+1.65%",  up: true,  bgColor: "rgba(120,120,120,0.15)", description: "Apple Inc. designs, manufactures and markets consumer electronics, computer software, and online services. The company's best-known hardware products include the iPhone, iPad, Mac, and Apple Watch." },
  { symbol: "TSLA",  name: "Tesla Inc.",           price: "$228.50", change: "-4.10", pct: "-1.76%",  up: false, bgColor: "rgba(204,0,0,0.15)",     description: "Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, energy generation and storage systems, and provides services related to its products." },
  { symbol: "NVDA",  name: "NVIDIA Corporation",   price: "$485.10", change: "18.40", pct: "+3.95%",  up: true,  bgColor: "rgba(118,185,0,0.15)",   description: "NVIDIA Corporation provides graphics, and compute and networking solutions in the United States, Taiwan, China, and internationally. The company's GPU products are used in gaming, professional visualization, data center, and automotive markets." },
  { symbol: "AMZN",  name: "Amazon.com Inc.",      price: "$192.75", change: "3.25",  pct: "+1.71%",  up: true,  bgColor: "rgba(255,153,0,0.15)",   description: "Amazon.com, Inc. engages in the retail sale of consumer products and subscriptions in North America and internationally. It operates through three segments: North America, International, and Amazon Web Services (AWS)." },
  { symbol: "MSFT",  name: "Microsoft Corporation",price: "$415.60", change: "-2.10", pct: "-0.50%",  up: false, bgColor: "rgba(0,120,212,0.15)",   description: "Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide. The company operates through three segments: Productivity and Business Processes, Intelligent Cloud, and More Personal Computing." },
  { symbol: "GOOGL", name: "Alphabet Inc.",        price: "$176.30", change: "4.80",  pct: "+2.80%",  up: true,  bgColor: "rgba(66,133,244,0.15)",  description: "Alphabet Inc. provides various products and platforms in the United States, Europe, the Middle East, Africa, the Asia-Pacific, Canada, and Latin America. It operates through Google Services, Google Cloud, and Other Bets segments." },
];

export default function MarketplaceStockDetail() {
  const params = useParams<{ symbol: string }>();
  const decodedSymbol = decodeURIComponent(params.symbol).toUpperCase();

  const stock = MOCK_STOCKS.find((a) => a.symbol === decodedSymbol);
  const [buyOpen, setBuyOpen] = useState(false);

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
            {stock.description}
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
