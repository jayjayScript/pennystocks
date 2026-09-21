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

export default function PortfolioStockDetail() {
  const params = useParams<{ symbol: string }>();
  const router = useRouter();
  const decodedSymbol = decodeURIComponent(params.symbol).toUpperCase();

  const { data: purchasesData, isLoading: purchasesLoading } = useQuery({
    queryKey: ["my-stock-purchases"],
    queryFn: () => stocksApi.mine(),
  });

  const { data: stocksData, isLoading: stocksLoading } = useStocks(1, 50);

  const [buyOpen, setBuyOpen] = useState(false);
  const [sellOpen, setSellOpen] = useState(false);

  const isLoading = purchasesLoading || stocksLoading;

  const userPurchases = (purchasesData ?? []).filter(
    (p) =>
      p.stockAcronym.toUpperCase() === decodedSymbol &&
      (p.remainingQuantity ?? p.quantity) > 0 &&
      p.status !== "closed"
  );

  const totalShares = userPurchases.reduce(
    (sum, p) => sum + (p.remainingQuantity ?? p.quantity),
    0
  );

  const firstPurchase = userPurchases[0];
  const liveStock = (stocksData?.data ?? []).find(
    (s) => s.acronym.toUpperCase() === decodedSymbol
  );

  if (isLoading) {
    return (
      <div className="p-8 text-center text-white">
        <Icon icon="mdi:loading" width={40} className="mx-auto mb-3 animate-spin" style={{ color: "#00d4a1" }} />
        <p className="text-sm" style={{ color: "#9aa3b0" }}>Loading asset details...</p>
      </div>
    );
  }

  if (!firstPurchase || totalShares <= 0) {
    return (
      <div className="p-8 text-center text-white">
        <h1 className="text-2xl font-bold">Asset Not Found</h1>
        <p className="mt-2 text-penny-text-muted">You do not hold this asset in your portfolio.</p>
        <Link href="/dashboard/portfolio" className="text-penny-accent mt-4 inline-block hover:underline">
          Return to Portfolio
        </Link>
      </div>
    );
  }

  const currentPrice = liveStock?.lastPrice ?? firstPurchase.pricePerShare;
  const totalValue = totalShares * currentPrice;
  const isUp = liveStock ? liveStock.rateOfChange >= 0 : true;
  const rateOfChangeStr = liveStock
    ? `${liveStock.rateOfChange >= 0 ? "+" : ""}${liveStock.rateOfChange.toFixed(2)}%`
    : "+0.00%";
  const change24hStr = liveStock
    ? `${liveStock.change24h >= 0 ? "+" : ""}${liveStock.change24h.toFixed(2)}`
    : "0.00";

  const charCode = decodedSymbol.charCodeAt(0) || 0;
  const bgColor = ACCENT_PALETTE[charCode % ACCENT_PALETTE.length];

  const asset = {
    purchaseId: firstPurchase._id,
    stockId: typeof firstPurchase.stockId === "string" ? firstPurchase.stockId : firstPurchase.stockId?._id ?? liveStock?._id,
    _id: typeof firstPurchase.stockId === "string" ? firstPurchase.stockId : firstPurchase.stockId?._id ?? liveStock?._id,
    symbol: decodedSymbol,
    name: firstPurchase.stockName || liveStock?.name || decodedSymbol,
    amount: `${totalShares} ${totalShares === 1 ? "share" : "shares"}`,
    availableShares: totalShares,
    value: `$${totalValue.toFixed(2)}`,
    price: `$${currentPrice.toFixed(2)}`,
    change: change24hStr,
    pct: rateOfChangeStr,
    up: isUp,
    bgColor,
    icon: "mdi:chart-line",
    description:`${firstPurchase.stockName} is an active stock listed in the marketplace.`,
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Back Navigation */}
      <div>
        <Link
          href="/dashboard/portfolio"
          className="inline-flex items-center gap-2 text-sm text-penny-text-muted hover:text-white transition-colors"
        >
          <Icon icon="mdi:arrow-left" width={18} />
          Back to Portfolio
        </Link>
      </div>

      {/* Header Info */}
      <Card variant="default" className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4 relative z-10">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0"
            style={{ background: asset.bgColor, color: asset.bgColor.replace("0.15)", "1)") }}
          >
            {asset.symbol[0]}
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
          <p className="text-sm text-penny-text-muted mb-1">Your Holdings</p>
          <p className="text-xl font-bold text-white">{asset.amount}</p>
        </Card>
        <Card variant="surface" padding="sm">
          <p className="text-sm text-penny-text-muted mb-1">Total Value</p>
          <p className="text-xl font-bold text-penny-accent">{asset.value}</p>
        </Card>
      </div>

      {/* Chart preview */}
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
          <span className="text-white text-xs font-medium">{asset.pct} 24h</span>
        </div>
      </Card>

      {/* Description & Trade */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card variant="default" className="md:col-span-2">
          <h2 className="text-xl font-bold text-white mb-4">About {asset.name}</h2>
          <p className="text-penny-text-muted leading-relaxed text-sm">
            {asset.description}
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
      <SellModal asset={asset} isOpen={sellOpen} onClose={() => setSellOpen(false)} onSuccess={() => router.push("/dashboard/portfolio")} />
    </div>
  );
}
