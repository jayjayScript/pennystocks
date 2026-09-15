"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import BuyModal from "@/components/modals/BuyModal";
import SellModal from "@/components/modals/SellModal";

type PortfolioAsset = {
  symbol: string;
  name: string;
  amount: string;
  value: string;
  price: string;
  change: string;
  pct: string;
  up: boolean;
  bgColor: string;
  icon: string;
  description?: string;
};

const MOCK_HOLDINGS: PortfolioAsset[] = [
  {
    symbol: "AAPL", name: "Apple Inc.", amount: "5 shares", value: "$875.50",
    price: "$175.10", change: "2.85", pct: "+2.1%", up: true,
    bgColor: "rgba(120,120,120,0.15)", icon: "mdi:apple",
    description: "Apple Inc. designs, manufactures, and markets consumer electronics including iPhone, Mac, iPad, and Apple Watch. The company also offers software services through the App Store, Apple Music, Apple TV+, and iCloud.",
  },
  {
    symbol: "BTC", name: "Bitcoin", amount: "0.02 BTC", value: "$1,240.00",
    price: "$62,000.00", change: "56.30", pct: "+4.7%", up: true,
    bgColor: "rgba(247,147,26,0.15)", icon: "mdi:bitcoin",
    description: "Bitcoin is the world's first and largest decentralized digital currency, enabling peer-to-peer transactions without intermediaries. It operates on a proof-of-work blockchain with a fixed maximum supply of 21 million coins.",
  },
  {
    symbol: "TSLA", name: "Tesla Inc.", amount: "3 shares", value: "$690.00",
    price: "$230.00", change: "-3.05", pct: "-1.3%", up: false,
    bgColor: "rgba(204,0,0,0.15)", icon: "mdi:car-electric",
    description: "Tesla designs and manufactures electric vehicles, battery energy storage, solar panels, and solar roof tiles. The company also develops AI-driven autonomous driving technology.",
  },
];

export default function PortfolioStockDetail() {
  const params  = useParams<{ symbol: string }>();
  const router  = useRouter();
  const decodedSymbol = decodeURIComponent(params.symbol).toUpperCase();
  const asset = MOCK_HOLDINGS.find((a) => a.symbol === decodedSymbol);

  const [buyOpen,  setBuyOpen]  = useState(false);
  const [sellOpen, setSellOpen] = useState(false);

  if (!asset) {
    return (
      <div className="p-8 text-center text-white">
        <h1 className="text-2xl font-bold">Asset Not Found</h1>
        <p className="mt-2 text-penny-text-muted">You do not hold this asset in your portfolio.</p>
        <Link href="/dashboard/overview" className="text-penny-accent mt-4 inline-block hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Back Navigation */}
      <div>
        <Link href="/dashboard/overview" className="inline-flex items-center gap-2 text-sm text-penny-text-muted hover:text-white transition-colors">
          <Icon icon="mdi:arrow-left" width={18} />
          Back to Overview
        </Link>
      </div>

      {/* Header Info */}
      <Card variant="default" className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4 relative z-10">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0"
            style={{ background: asset.bgColor, color: asset.bgColor.replace("0.15)", "1)") }}
          >
            <Icon icon={asset.icon} width={36} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">{asset.name}</h1>
            <p className="text-penny-text-muted text-lg">{asset.symbol}</p>
          </div>
        </div>

        <div className="text-left md:text-right relative z-10">
          <p className="text-3xl font-bold text-white">{asset.price}</p>
          <div className="flex items-center md:justify-end gap-2 mt-1">
            <span className="text-penny-text-muted font-medium text-sm">24h Change:</span>
            <Badge variant={asset.up ? "success" : "danger"} size="md">
              {asset.pct} ({asset.change})
            </Badge>
          </div>
        </div>
      </Card>

      {/* Holdings Overview */}
      <div className="grid grid-cols-2 gap-4">
        <Card variant="surface" padding="sm">
          <p className="text-sm text-penny-text-muted mb-1">Your Balance</p>
          <p className="text-xl font-bold text-white">{asset.amount}</p>
        </Card>
        <Card variant="surface" padding="sm">
          <p className="text-sm text-penny-text-muted mb-1">Total Value</p>
          <p className="text-xl font-bold text-penny-accent">{asset.value}</p>
        </Card>
      </div>

      {/* Chart placeholder */}
      <Card padding="none" variant="surface" className="h-64 md:h-80 flex items-center justify-center relative overflow-hidden flex-col group border-0">
        <Image
          src="/images/chart-preview.png"
          alt={`${asset.symbol} Performance Chart`}
          fill
          style={{ objectFit: "cover", opacity: 0.9 }}
          priority
          className="transition-opacity duration-300 group-hover:opacity-100"
        />
        <div className="absolute top-4 right-4 bg-penny-bg-base/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-penny-border-default flex items-center gap-2 z-10">
          <span className="w-2 h-2 rounded-full bg-penny-accent animate-pulse" />
          <span className="text-white text-xs font-medium">Your Performance: +14.5%</span>
        </div>
      </Card>

      {/* Description & Trade */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card variant="default" className="md:col-span-2">
          <h2 className="text-xl font-bold text-white mb-4">About {asset.name}</h2>
          <p className="text-penny-text-muted leading-relaxed text-sm">
            {asset.description}
            <br /><br />
            <strong className="text-white">Portfolio Insights:</strong> You first acquired this asset on October 14, 2025. Over the last 6 months, it has been your 2nd highest returning asset. We recommend holding based on current market sentiment indicators.
          </p>
        </Card>

        {/* Trade card */}
        <Card variant="default" className="flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-penny-accent opacity-5 rounded-full blur-3xl -mr-10 -mt-10" />
          <h3 className="text-lg font-semibold text-white mb-6 text-center z-10">Trade {asset.symbol}</h3>

          <div className="space-y-4 z-10 w-full mb-6">
            <Button className="cursor-pointer" variant="primary" size="lg" fullWidth icon="mdi:arrow-down" onClick={() => setBuyOpen(true)}>Buy</Button>
            <Button className="cursor-pointer" variant="danger" size="lg" fullWidth icon="mdi:arrow-up" onClick={() => setSellOpen(true)}>Sell</Button>
          </div>

          <p className="text-xs text-center text-penny-text-disabled mt-2 z-10">Estimated execution time: Instant</p>
        </Card>
      </div>

      <BuyModal stock={asset} isOpen={buyOpen} onClose={() => setBuyOpen(false)} />
      <SellModal asset={asset} isOpen={sellOpen} onClose={() => setSellOpen(false)} onSuccess={() => router.push("/dashboard/overview")} />
    </div>
  );
}
