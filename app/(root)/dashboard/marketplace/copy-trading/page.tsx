"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaCarouselType } from "embla-carousel";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import TopUpWalletModal from "@/components/modals/TopUpWalletModal";
import AddFundsModal from "@/components/modals/AddFundsModal";
import WithdrawCopyWalletModal from "@/components/modals/WithdrawCopyWalletModal";
import { useCopyTrading as useCopyTradingQuery, useUserProfile } from "@/hooks/queries";
import { useCopyTrading } from "@/context/CopyTradingContext";
import { copyTradingApi } from "@/lib/api/backend";
import { flagFromCountryCode } from "@/lib/copyTradeMeta";
import type { CopyTrading, CopyTradePurchase } from "@/types/api";

function formatUSD(val: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(val);
}
const formatCopyUSD = formatUSD;

interface ActiveCopyTrade {
  id: string;
  setupId: string;
  setup: {
    traderNickname: string;
    coin: { symbol: string };
    leverage: number;
  };
  country?: string;
  winrate: number;
  investedAmount: number;
  pnl: number;
  pnlPercent: number;
}

// Country flag resolved from the backend `country` field (falls back to the globe).

function formatInitials(name?: string): string {
  if (!name) return "??";
  return (
    name
      .split(" ")
      .map((n) => n[0] ?? "")
      .join("")
      .substring(0, 2)
      .toUpperCase() || "??"
  );
}

function flagFor(country?: string): string {
  return flagFromCountryCode(country);
}

// ─── Shared trading-card atoms (mirrors the reference design) ───────────────────

function VerifiedBadge() {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full shrink-0"
      style={{ width: 15, height: 15, background: "#F5C518" }}
      title="Verified trader"
    >
      <Icon icon="mdi:check-bold" width={10} style={{ color: "#0d1624" }} />
    </span>
  );
}

function TraderAvatar({
  country,
  label,
}: {
  country?: string;
  label: string;
}) {
  return (
    <div className="relative shrink-0">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-base font-extrabold text-white shadow-inner"
        style={{ background: "#1d2639", border: "1px solid #2d3a52" }}
      >
        {label}
      </div>
      <span
        className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-lg flex items-center justify-center text-[13px]"
        style={{ background: "#0d1624", border: "1px solid #2d3a52" }}
      >
        {flagFor(country)}
      </span>
    </div>
  );
}

function CoinPill({ symbol, live }: { symbol: string; live?: boolean }) {
  const dotColor = live ? "#F5C518" : "#00d4a1";
  return (
    <span
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold text-white"
      style={{ background: "#0d1624", border: "1px solid #252f45" }}
    >
      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: dotColor }} />
      {symbol}/USDT
    </span>
  );
}

/** A green/red rounded mini-pill showing a single trade's % result. */
function TradePill({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span
      className="text-[8px] font-bold px-2 py-1 rounded-md text-center"
      style={{
        background: up ? "rgba(0,212,161,0.10)" : "rgba(244,67,54,0.10)",
        color: up ? "#00d4a1" : "#F44336",
        border: `1px solid ${up ? "rgba(0,212,161,0.35)" : "rgba(244,67,54,0.35)"}`,
      }}
    >
      {up ? "+" : ""}
      {value.toFixed(1)}%
    </span>
  );
}

export default function CopyTradingDetailPage() {
  const queryClient = useQueryClient();
  const { copyWalletBalance } = useCopyTrading();
  const { data: profile } = useUserProfile();

  const { data: rawSetups, isLoading: isSetupsLoading } = useCopyTradingQuery();
  const { data: rawPurchases, isLoading: isPurchasesLoading } = useQuery({
    queryKey: ["my-copy-trades"],
    queryFn: () => copyTradingApi.mine(),
  });

  // const [pausedTradeIds, setPausedTradeIds] = useState<string[]>([]);

  const activeSetups: CopyTrading[] = useMemo(
    () => (rawSetups ?? []).filter((s) => s.isActive !== false),
    [rawSetups],
  );

  const myPurchases: CopyTradePurchase[] = useMemo(
    () => rawPurchases ?? [],
    [rawPurchases],
  );

  const activeCopyTrades: ActiveCopyTrade[] = useMemo(() => {
    return myPurchases
      .filter((p) => p.status !== "liquidated")
      .map((p) => {
        const setupId =
          typeof p.copyTradingId === "string"
            ? p.copyTradingId
            : (p.copyTradingId?._id ?? p._id);
        const pnl = p.pnl ?? 0;
        const invested = p.amountInvested ?? 0;
        const pnlPercent = invested > 0 ? (pnl / invested) * 100 : 0;

        return {
          id: p._id,
          setupId,
          setup: {
            traderNickname: p.traderName || "Trader",
            coin: { symbol: p.currency || "USD" },
            leverage: p.leverage || 1,
          },
          investedAmount: invested,
          pnl,
          pnlPercent,
          country: activeSetups.find((s) => s._id === setupId)?.country,
          winrate: p.winrate ?? 0,
        };
      });
  }, [myPurchases, activeSetups]);

  const isLoading = isSetupsLoading || isPurchasesLoading;

  const buyCopyTrade = useCallback(
    async (setupId: string, amountInvested: number) => {
      const setup = activeSetups.find((s) => s._id === setupId);
      if (!setup) return { success: false, message: "Trader not found" };
      if (!amountInvested || amountInvested <= 0) {
        return { success: false, message: "Enter a valid amount to invest." };
      }
      if (copyWalletBalance < amountInvested) {
        return {
          success: false,
          message:
            "Insufficient copy wallet balance. Please top up your copy wallet.",
        };
      }
      try {
        await copyTradingApi.buy(setup._id, amountInvested);
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["my-copy-trades"] }),
          queryClient.invalidateQueries({ queryKey: ["user-profile"] }),
          queryClient.invalidateQueries({ queryKey: ["transactions"] }),
          queryClient.invalidateQueries({ queryKey: ["portfolio"] }),
          queryClient.invalidateQueries({ queryKey: ["copy-trading-portfolio"] }),
        ]);
        return {
          success: true,
          message: `Successfully copying ${setup.traderName}!`,
        };
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to start copy trade";
        return { success: false, message: errorMsg };
      }
    },
    [activeSetups, copyWalletBalance, queryClient],
  );

  const stopCopyTrade = useCallback(
    async (id: string) => {
      try {
        await copyTradingApi.liquidate(id);
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["my-copy-trades"] }),
          queryClient.invalidateQueries({ queryKey: ["user-profile"] }),
          queryClient.invalidateQueries({ queryKey: ["transactions"] }),
          queryClient.invalidateQueries({ queryKey: ["portfolio"] }),
          queryClient.invalidateQueries({ queryKey: ["copy-trading-portfolio"] }),
        ]);
        return {
          success: true,
          message: "Copy trade stopped and funds returned to copy wallet.",
        };
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to stop copy trade";
        return { success: false, message: errorMsg };
      }
    },
    [queryClient],
  );

  // Pause/Resume feature removed — trades are either active or liquidated.

  const getActiveTradeBySetupId = (setupId: string) => {
    return activeCopyTrades.find((t) => t.setupId === setupId);
  };

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    loop: activeSetups.length > 1,
    containScroll: false,
    startIndex: 0,
    dragFree: false,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTraderId, setSelectedTraderId] = useState<string | null>(null);
  const [investAmount, setInvestAmount] = useState("100");
  const [showTopUp, setShowTopUp] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [addFundsTrade, setAddFundsTrade] = useState<ActiveCopyTrade | null>(
    null,
  );
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleConfirmCopy = async () => {
    if (!selectedTrader) return;
    const result = await buyCopyTrade(
      selectedTrader._id,
      parseFloat(investAmount) || 0,
    );
    showNotification(result.success ? "success" : "error", result.message);
    setIsModalOpen(false);
    setSelectedTraderId(null);
  };

  const onSelect = useCallback((api: EmblaCarouselType) => {
    if (!api) return;
    setSelectedIndex(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    requestAnimationFrame(() => onSelect(emblaApi));
    emblaApi.on("reInit", onSelect).on("select", onSelect);
  }, [emblaApi, onSelect]);

  const scrollTo = (index: number) => emblaApi && emblaApi.scrollTo(index);
  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi],
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi],
  );

  const openModal = (id: string) => {
    setSelectedTraderId(id);
    setIsModalOpen(true);
  };

  const selectedTrader =
    activeSetups.find((s) => s._id === selectedTraderId) ?? null;

  return (
    <div className="relative min-h-screen w-full bg-[#0d1624] overflow-hidden selection:bg-penny-accent/30 font-britti-sans-trial">
      {/* Background wavy pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-30 z-0">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1440 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M0 100C300 200,500 0,800 100,1100 200,1300 0,1440 100V800H0V100Z"
            fill="url(#paint0_linear)"
          />
          <defs>
            <linearGradient
              id="paint0_linear"
              x1="720"
              y1="0"
              x2="720"
              y2="800"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#00D4A1" stopOpacity="0.15" />
              <stop offset="1" stopColor="#0F1624" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="px-4 md:px-8 py-6 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard/marketplace"
              className="w-10 h-10 rounded-full bg-penny-surface-2 border border-penny-border-subtle flex items-center justify-center text-white hover:bg-penny-surface-3 transition-all"
            >
              <Icon icon="mdi:arrow-left" width={20} />
            </Link>
            <span className="text-penny-text-secondary font-medium tracking-wide">
              {profile?.firstName || profile?.lastName
                ? `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim()
                : "My Account"}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <div
              className="px-4 py-2 rounded-xl"
              style={{ background: "#151d2d", border: "1px solid #252f45" }}
            >
              <p className="text-[10px]" style={{ color: "#6b7785" }}>
                Copy Wallet
              </p>
              <p className="text-sm font-bold" style={{ color: "#F5C518" }}>
                {formatCopyUSD(copyWalletBalance)}
              </p>
            </div>
            <button
              onClick={() => setShowWithdraw(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
              style={{ background: "#151d2d", color: "#F44336", border: "1px solid #252f45" }}
            >
              <Icon icon="mdi:bank-transfer-out" width={12} />
              Withdraw
            </button>
            <button
              onClick={() => setShowTopUp(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
              style={{ background: "#F5C518", color: "#0d1624" }}
            >
              <Icon icon="mdi:plus" width={12} />
              Top Up
            </button>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center mb-4 px-2">
          {/* <div className="text-center space-y-3 mb-8">
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tighter">
              Copy Trading
            </h1>
            <p className="text-penny-text-muted text-sm max-w-sm mx-auto leading-relaxed">
              Follow proven traders, Copy their moves, Earn with strategy.
            </p>
          </div> */}

          {/* Your Active Copy Trades */}
          {activeCopyTrades.length > 0 && (
            <div className="w-full max-w-3xl mb-10 px-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black text-white tracking-tight">
                  Your Active Copy Trades ({activeCopyTrades.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeCopyTrades.map((trade) => {
                  return (
                    <div
                      key={trade.id}
                      className="rounded-2xl relative overflow-hidden p-3.5 flex flex-col"
                      style={{
                        background: "#0f1624",
                        border: "1px solid rgba(0,212,161,0.45)",
                        boxShadow: "0 0 0 1px rgba(0,212,161,0.08)",
                      }}
                    >
                      {/* Header: avatar + name + LIVE pill */}
                      <div className="p-3 flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <TraderAvatar
                            country={trade.country}
                            label={trade.setup.traderNickname
                              .substring(0, 2)
                              .toUpperCase()}
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-white font-bold text-lg leading-tight truncate">
                                {trade.setup.traderNickname}
                              </p>
                              <VerifiedBadge />
                            </div>
                            <p className="text-[9px] mt-0.5" style={{ color: "#9aa3b0" }}>
                              Leverage{" "}
                              <span className="text-white font-semibold">
                                {    trade.setup.leverage}x
                                      </span>
                                    </p>
                                  </div>
                                </div>

                        <span
                          className="inline-flex items-center gap-1 text-[9px] font-black tracking-widest px-2.5 py-1 rounded-full shrink-0"
                          style={{
                            background: "rgba(0,212,161,0.12)",
                            color: "#00d4a1",
                          }}
                        >
                          <span
                            className="w-1 h-1 rounded-full animate-pulse"
                            style={{ background: "#00d4a1" }}
                          />
                          LIVE
                        </span>
                      </div>

                      {/* Coin pill + win rate */}
                      <div className="px-3 flex items-center justify-between gap-2">
                        <CoinPill symbol={trade.setup.coin.symbol} live />
                        <span
                          className="text-sm font-bold"
                          style={{ color: "#00d4a1" }}
                        >
                          {trade.winrate ?? 0}% win rate
                        </span>
                      </div>

                      {/* Live profit hero */}
                      <div className="px-3 pt-0.5 mt-auto">
                        <p
                          className="text-[10px] font-bold uppercase tracking-widest mb-1"
                          style={{ color: "#6b7785" }}
                        >
                          Live Profit
                        </p>
                        <p
                          className="text-2xl font-black tracking-tight"
                          style={{ color: trade.pnl >= 0 ? "#00d4a1" : "#F44336" }}
                        >
                          {trade.pnl >= 0 ? "+" : ""}
                          {formatCopyUSD(trade.pnl)}
                        </p>
                        <p className="text-[10px] mt-0.5" style={{ color: "#6b7785" }}>
                          of {formatCopyUSD(trade.investedAmount)} invested
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="p-3 pt-2 grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setAddFundsTrade(trade)}
                          className="h-11 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 whitespace-nowrap transition-all cursor-pointer hover:brightness-110 active:scale-[0.97]"
                          style={{
                            background: "#00d4a1",
                            color: "#0d1624",
                          }}
                        >
                          <Icon icon="mdi:plus-circle" width={16} />
                          Add Funds
                        </button>

                        <button
                          onClick={() => stopCopyTrade(trade.id)}
                          className="h-11 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 whitespace-nowrap transition-all cursor-pointer hover:brightness-110 active:scale-[0.97]"
                          style={{
                            background: "#F44336",
                            color: "#ffffff",
                          }}
                        >
                          <Icon icon="mdi:logout-variant" width={16} />
                          Stop
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="py-12 text-penny-text-muted text-sm">
              Loading copy trades…
            </div>
          ) : activeSetups.length === 0 ? (
            <div className="py-16 text-center">
              <Icon
                icon="mdi:chart-line-variant"
                width={48}
                className="mx-auto mb-3"
                style={{ color: "#6b7785" }}
              />
              <p className="text-white font-semibold mb-1">
                No Copy Trades Available
              </p>
              <p
                className="text-sm max-w-sm mx-auto"
                style={{ color: "#6b7785" }}
              >
                The admin has not yet posted any active copy trades. Check back
                soon.
              </p>
            </div>
          ) : (
            <>
              {/* Indicators */}
              {activeSetups.length > 1 && (
                <div className="flex items-center justify-center gap-1.5 mb-10">
                  {activeSetups.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => scrollTo(i)}
                      className={`transition-all duration-300 rounded-full h-1.5 ${
                        selectedIndex === i
                          ? "w-6 bg-penny-accent"
                          : "w-1.5 bg-penny-border-strong opacity-40 hover:opacity-100"
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Carousel */}
              <div className="w-full max-w-3xl relative group h-full">
                {activeSetups.length > 1 && (
                  <>
                    <button
                      onClick={scrollPrev}
                      className="absolute left-8 top-1/2 -translate-y-1/2 z-30 w-14 h-14 rounded-full bg-[#1A2333]/90 border border-white/30 items-center justify-center text-white hover:bg-penny-accent hover:border-penny-accent hover:text-black transition-all shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl hidden md:flex cursor-pointer"
                    >
                      <Icon icon="mdi:chevron-left" width={36} />
                    </button>
                    <button
                      onClick={scrollNext}
                      className="absolute right-8 top-1/2 -translate-y-1/2 z-30 w-14 h-14 rounded-full bg-[#1A2333]/90 border border-white/30 items-center justify-center text-white hover:bg-penny-accent hover:border-penny-accent hover:text-black transition-all shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl hidden md:flex cursor-pointer"
                    >
                      <Icon icon="mdi:chevron-right" width={36} />
                    </button>
                  </>
                )}

                <div className="overflow-visible" ref={emblaRef}>
                  <div className="flex">
                    {activeSetups.map((trader) => {
                      const isSelected =
                        activeSetups[selectedIndex]?._id === trader._id;
                      return (
                        <div
                          key={trader._id}
                          className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_80%] lg:flex-[0_0_52%] px-4"
                        >
                          <Card
                            className={`p-0 border-penny-border-default/50 bg-[#0B101B]/90 backdrop-blur-sm relative overflow-hidden shadow-2xl transition-all duration-500 scale-[0.98] ${
                              isSelected
                                ? "ring-2 ring-penny-accent/30 scale-[1.02]"
                                : "opacity-60"
                            }`}
                          >
                            <div className="flex flex-col gap-5 h-full">
                              {/* Header: avatar + name + verified */}
                              <div className="flex items-center gap-3.5">
                                <TraderAvatar
                                  country={trader.country}
                                  label={formatInitials(trader.traderName)}
                                />
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <p className="text-white font-bold text-lg leading-tight truncate">
                                      {trader.traderName}
                                    </p>
                                    <VerifiedBadge />
                                  </div>
                                  <p
                                    className="text-xs mt-0.5"
                                    style={{ color: "#9aa3b0" }}
                                  >
                                    Leverage{" "}
                                    <span className="text-white font-semibold">
                                      {trader.leverage ?? 1}x
                                    </span>
                                  </p>
                                </div>
                              </div>

                              {/* Coin pill + win rate */}
                              <div className="flex items-center justify-between gap-3">
                                <CoinPill symbol={trader.currency || "USD"} />
                                <span
                                  className="text-sm font-bold"
                                  style={{ color: "#00d4a1" }}
                                >
                                  {(trader.winrate ?? 0).toFixed(0)}% win rate
                                </span>
                              </div>

                              {/* Last 10 trades */}
                              <div
                                className="pt-4 border-t"
                                style={{ borderColor: "#1d2639" }}
                              >
                                <p
                                  className="text-[10px] font-bold uppercase tracking-widest mb-2.5"
                                  style={{ color: "#6b7785" }}
                                >
                                  Last 10 Trades
                                </p>
                                <div className="grid grid-cols-6 gap-1.5">
                                  {(trader.last_10_trades ?? [])
                                    .slice(0, 10)
                                    .map((v, i) => (
                                      <TradePill key={i} value={v} />
                                    ))}
                                </div>
                              </div>

                              {/* Trade percent + copy */}
                              <div
                                className="pt-4 border-t flex items-end justify-between gap-4 mt-auto"
                                style={{ borderColor: "#1d2639" }}
                              >
                                <div>
                                  <p
                                    className="text-[10px] font-bold uppercase tracking-widest mb-1"
                                    style={{ color: "#6b7785" }}
                                  >
                                    Trade Percent
                                  </p>
                                  <p className="text-2xl font-black text-white tracking-tight">
                                    {Math.max(
                                      1,
                                      Math.round(trader.percentage ?? 0),
                                    )}
                                    %
                                  </p>
                                </div>
                                <Button
                                  onClick={() => {
                                    if (getActiveTradeBySetupId(trader._id)) {
                                      showNotification(
                                        "error",
                                        "You already have this trade copied!",
                                      );
                                      return;
                                    }
                                    openModal(trader._id);
                                  }}
                                  className="h-12 px-7 rounded-2xl bg-white text-black font-black text-sm hover:bg-gray-100 transition-all active:scale-[0.98] shadow-lg shadow-black/20"
                                >
                                  {getActiveTradeBySetupId(trader._id)
                                    ? "Already Copied"
                                    : "Copy Trade"}
                                </Button>
                              </div>
                            </div>
                          </Card>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Top Up Wallet Modal */}
      <TopUpWalletModal
        isOpen={showTopUp}
        onClose={() => setShowTopUp(false)}
        onSuccess={(message) => showNotification("success", message)}
      />

      {/* Withdraw to Main Wallet Modal */}
      <WithdrawCopyWalletModal
        isOpen={showWithdraw}
        onClose={() => setShowWithdraw(false)}
        onSuccess={(message) => showNotification("success", message)}
      />

      {/* Add Funds to Trade Modal */}
      <AddFundsModal
        isOpen={!!addFundsTrade}
        onClose={() => setAddFundsTrade(null)}
        trade={addFundsTrade}
        onSuccess={(message) => showNotification("success", message)}
      />

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-[70] px-5 py-3 rounded-2xl shadow-xl"
            style={{
              background:
                notification.type === "success" ? "#1B4D3E" : "#4D1B1B",
              color: notification.type === "success" ? "#4CAF50" : "#F44336",
            }}
          >
            <div className="flex items-center gap-2">
              <Icon
                icon={
                  notification.type === "success"
                    ? "mdi:check-circle"
                    : "mdi:alert-circle"
                }
                width={20}
              />
              <span className="text-sm font-semibold">
                {notification.message}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {isModalOpen && selectedTrader && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-penny-bg-base/90 backdrop-blur-lg"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="relative w-full max-w-[420px] bg-[#141C2D] border border-white/5 rounded-3xl sm:rounded-[40px] p-6 sm:p-8 space-y-6 sm:space-y-8 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)] overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-penny-accent opacity-[0.05] blur-[80px] pointer-events-none" />

              <div className="text-center space-y-3 relative z-10">
                <h2 className="text-3xl font-black text-white tracking-tighter">
                  Confirm Copy Trade
                </h2>
                <p className="text-penny-text-muted text-[15px] leading-relaxed px-2">
                  You are about to copy{" "}
                  <span className="text-white font-black">
                    {selectedTrader.traderName}&apos;s
                  </span>{" "}
                  active trade.
                </p>
              </div>

              <div className="space-y-5 px-1 relative z-10">
                <div
                  className="flex items-center justify-between p-3 rounded-2xl"
                  style={{
                    background: "rgba(245,197,24,0.06)",
                    border: "1px solid rgba(245,197,24,0.15)",
                  }}
                >
                  <span className="text-penny-text-muted font-medium text-[13px]">
                    Copy Wallet Balance
                  </span>
                  <span
                    className="text-white font-bold text-sm"
                    style={{ color: "#F5C518" }}
                  >
                    {formatCopyUSD(copyWalletBalance)}
                  </span>
                </div>
                {[
                  {
                    label: "Amount to Invest:",
                    value: formatCopyUSD(parseFloat(investAmount) || 0),
                  },
                  {
                    label: "Win Rate:",
                    value: `${(selectedTrader.winrate ?? 0).toFixed(0)}%`,
                    colorClass: "text-penny-accent",
                  },
                  {
                    label: "Leverage:",
                    value: `${selectedTrader.leverage ?? 1}x`,
                  },
                  {
                    label: "Duration:",
                    value: selectedTrader.duration || "N/A",
                  },
                ].map((row, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-penny-text-muted font-medium text-[15px]">
                      {row.label}
                    </span>
                    <span
                      className={`text-[15px] font-bold ${row.colorClass || "text-white"}`}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 relative z-10">
                <label
                  className="text-penny-text-muted font-medium text-[13px]"
                  htmlFor="invest-amount"
                >
                  Amount to invest (from copy wallet)
                </label>
                <input
                  id="invest-amount"
                  type="number"
                  min="1"
                  step="0.01"
                  value={investAmount}
                  onChange={(e) => setInvestAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-[#0d1624] border border-white/10 text-white font-bold text-lg"
                  placeholder="100"
                />
              </div>

              <div className="space-y-3 relative z-10">
                <Button
                  className="w-full h-15 rounded-3xl bg-white text-black font-black text-lg hover:shadow-[0_8px_24px_rgba(255,255,255,0.15)] transition-all active:scale-95"
                  onClick={handleConfirmCopy}
                >
                  Confirm
                </Button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full h-15 rounded-3xl bg-white/5 border border-white/10 font-bold text-penny-text-muted hover:text-white hover:bg-white/10 transition-all text-[15px]"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
