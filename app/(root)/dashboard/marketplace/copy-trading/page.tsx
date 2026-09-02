"use client";

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaCarouselType } from "embla-carousel";
import { motion, AnimatePresence } from "framer-motion";

import { useCopyTrading as useCopyTradingQuery } from "@/hooks/queries";
import { useCopyTrading as useCopyTradingCtx } from "@/context/CopyTradingContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatUSD } from "@/context/PortfolioContext";
import TopUpWalletModal from "@/components/modals/TopUpWalletModal";
import AddFundsModal from "@/components/modals/AddFundsModal";

const riskColors: Record<string, { bg: string; text: string; border: string }> = {
  low:    { bg: "rgba(0,212,161,0.12)",  text: "#00d4a1", border: "rgba(0,212,161,0.3)" },
  medium: { bg: "rgba(245,197,24,0.12)", text: "#F5C518", border: "rgba(245,197,24,0.3)" },
  high:   { bg: "rgba(244,67,54,0.12)",  text: "#F44336", border: "rgba(244,67,54,0.3)" },
};

function formatInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0] ?? "")
    .join("")
    .substring(0, 2)
    .toUpperCase() || "??";
}

export default function CopyTradingDetailPage() {
  const { data: setups = [], isLoading } = useCopyTradingQuery();
  const {
    copyWalletBalance,
    activeCopyTrades,
    buyCopyTrade,
    stopCopyTrade,
    pauseCopyTrade,
    resumeCopyTrade,
    getActiveTradeBySetupId,
    formatUSD: formatCopyUSD,
  } = useCopyTradingCtx();

  // Show all setups from the API — same data source as the marketplace carousel.
  const activeSetups = setups;

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
  const [showTopUp, setShowTopUp] = useState(false);
  const [addFundsTrade, setAddFundsTrade] = useState<ActiveCopyTrade | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleConfirmCopy = async () => {
    if (!selectedTrader) return;
    const result = await buyCopyTrade(selectedTrader._id);
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
  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const openModal = (id: string) => {
    setSelectedTraderId(id);
    setIsModalOpen(true);
  };

  const selectedTrader = activeSetups.find((s) => s._id === selectedTraderId) ?? null;

  return (
    <div className="relative min-h-screen w-full bg-[#0d1624] overflow-hidden selection:bg-penny-accent/30 font-britti-sans-trial">
      {/* Background wavy pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-30 z-0">
        <svg width="100%" height="100%" viewBox="0 0 1440 800" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 100C300 200,500 0,800 100,1100 200,1300 0,1440 100V800H0V100Z" fill="url(#paint0_linear)" />
          <defs>
            <linearGradient id="paint0_linear" x1="720" y1="0" x2="720" y2="800" gradientUnits="userSpaceOnUse">
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
            <span className="text-penny-text-secondary font-medium tracking-wide">UserID24</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-4 py-2 rounded-xl" style={{ background: "#151d2d", border: "1px solid #252f45" }}>
              <p className="text-[10px]" style={{ color: "#6b7785" }}>Copy Wallet</p>
              <p className="text-sm font-bold" style={{ color: "#F5C518" }}>{formatCopyUSD(copyWalletBalance)}</p>
            </div>
            <button
              onClick={() => setShowTopUp(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5" style={{ background: "#F5C518", color: "#0d1624" }}
            >
              <Icon icon="mdi:plus" width={12} />
              Top Up
            </button>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center mb-4 px-2">
          <div className="text-center space-y-3 mb-8">
            <h1 className="text-5xl font-black text-white tracking-tighter">Copy Trading</h1>
            <p className="text-penny-text-muted text-sm max-w-sm mx-auto leading-relaxed">
              Follow proven traders, Copy their moves, Earn with strategy.
            </p>
          </div>

          {/* Your Active Copy Trades */}
          {activeCopyTrades.length > 0 && (
            <div className="w-full max-w-5xl mb-10 px-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black text-white tracking-tight">
                  Your Active Copy Trades ({activeCopyTrades.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeCopyTrades.map((trade) => {
                  return (
                    <div
                      key={trade.id}
                      className="rounded-2xl p-5 relative overflow-hidden"
                      style={{ background: "#151d2d", border: "1px solid #252f45" }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white"
                            style={{ background: "rgba(0,212,161,0.1)", border: "1px solid rgba(0,212,161,0.3)" }}
                          >
                            {trade.setup.traderNickname.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white font-bold leading-tight">{trade.setup.traderNickname}</p>
                            <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: "#6b7785" }}>
                              {trade.setup.coin.symbol} • {trade.setup.leverage}x
                            </p>
                          </div>
                        </div>
                        {trade.status === "paused" && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(245,197,24,0.12)", color: "#F5C518" }}>
                            PAUSED
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5 mb-4">
                        <div className="flex justify-between text-xs">
                          <span style={{ color: "#6b7785" }}>Invested</span>
                          <span className="text-white font-semibold">{formatCopyUSD(trade.investedAmount)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span style={{ color: "#6b7785" }}>Current PnL</span>
                          <span className="font-semibold" style={{ color: trade.pnl >= 0 ? "#00D4A1" : "#F44336" }}>
                            {trade.pnl >= 0 ? "+" : ""}{formatCopyUSD(trade.pnl)}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span style={{ color: "#6b7785" }}>PnL %</span>
                          <span className="font-semibold" style={{ color: trade.pnlPercent >= 0 ? "#00D4A1" : "#F44336" }}>
                            {trade.pnlPercent >= 0 ? "+" : ""}{trade.pnlPercent.toFixed(2)}%
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setAddFundsTrade(trade)}
                          className="flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                          style={{ background: "rgba(0,212,161,0.12)", color: "#00d4a1" }}
                        >
                          <Icon icon="mdi:plus-circle" width={14} />
                          Add Funds
                        </button>
                        {trade.status === "active" ? (
                          <button
                            onClick={() => pauseCopyTrade(trade.id)}
                            className="flex-1 py-2 rounded-xl text-xs font-bold"
                            style={{ background: "#0d1624", color: "#9aa3b0", border: "1px solid #252f45" }}
                          >
                            Pause
                          </button>
                        ) : (
                          <button
                            onClick={() => resumeCopyTrade(trade.id)}
                            className="flex-1 py-2 rounded-xl text-xs font-bold"
                            style={{ background: "rgba(76,175,80,0.12)", color: "#4CAF50" }}
                          >
                            Resume
                          </button>
                        )}
                        <button
                          onClick={() =>{
                            const result = stopCopyTrade(trade.id);
                            showNotification(result.success ? "success" : "error", result.message);
                          }}
                          className="flex-1 py-2 rounded-xl text-xs font-bold"
                          style={{ background: "rgba(244,67,54,0.12)", color: "#F44336" }}
                        >
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
            <div className="py-12 text-penny-text-muted text-sm">Loading copy trades…</div>
          ) : activeSetups.length === 0 ? (
            <div className="py-16 text-center">
              <Icon icon="mdi:chart-line-variant" width={48} className="mx-auto mb-3" style={{ color: "#6b7785" }} />
              <p className="text-white font-semibold mb-1">No Copy Trades Available</p>
              <p className="text-sm max-w-sm mx-auto" style={{ color: "#6b7785" }}>
                The admin has not yet posted any active copy trades. Check back soon.
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
                        selectedIndex === i ? "w-6 bg-penny-accent" : "w-1.5 bg-penny-border-strong opacity-40 hover:opacity-100"
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Carousel */}
              <div className="w-full max-w-7xl relative group h-full">
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
                      const risk = riskColors[trader.riskLevel] ?? riskColors.low;
                      const isSelected = activeSetups[selectedIndex]?._id === trader._id;
                      return (
                        <div key={trader._id} className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] lg:flex-[0_0_33.33%] px-4">
                          <Card
                            className={`p-0 border-penny-border-default/50 bg-[#0B101B]/90 backdrop-blur-sm relative overflow-hidden shadow-2xl transition-all duration-500 scale-[0.98] ${
                              isSelected ? "ring-2 ring-penny-accent/30 scale-[1.02]" : "opacity-60"
                            }`}
                          >
                            <div className="p-6 space-y-6">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-full bg-penny-surface-3 border border-penny-border-default flex items-center justify-center text-lg font-extrabold text-white shadow-inner">
                                    {formatInitials(trader.traderName)}
                                  </div>
                                  <div className="space-y-0.5">
                                    <p className="text-white font-bold text-lg">{trader.traderName}</p>
                                    <p className="text-penny-text-disabled text-[10px] uppercase font-bold tracking-widest">Risk Level</p>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {["low", "medium", "high"].map((lvl) => {
                                  const c = riskColors[lvl];
                                  const active = trader.riskLevel === lvl;
                                  return (
                                    <div
                                      key={lvl}
                                      className="text-[10px] font-bold px-3 py-1 rounded-full border transition-all"
                                      style={{
                                        background: active ? c.bg : "rgba(255,255,255,0.03)",
                                        borderColor: active ? c.border : "rgba(255,255,255,0.1)",
                                        color: active ? c.text : "#6b7785",
                                      }}
                                    >
                                      {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                                    </div>
                                  );
                                })}
                              </div>

                              <div className="space-y-3">
                                <div
                                  className="text-6xl font-black tracking-tighter"
                                  style={{ color: trader.rateOfChange >= 0 ? "#00D4A1" : "#F44336" }}
                                >
                                  {trader.rateOfChange >= 0 ? "+" : ""}{trader.rateOfChange.toFixed(2)}%
                                </div>
                                <div className="inline-block px-4 py-1.5 rounded-full bg-penny-surface-2 border border-penny-border-subtle text-penny-text-secondary text-xs font-bold transition-colors">
                                  {trader.duration}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4 pb-6 border-b border-penny-border-subtle/30">
                                <div className="space-y-1">
                                  <p className="text-penny-text-disabled text-[10px] font-medium leading-none">Average daily profit:</p>
                                  <p className="text-white font-bold text-sm">{formatUSD(trader.averageDailyProfit)}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-penny-text-disabled text-[10px] font-medium leading-none">Copies</p>
                                  <p className="text-white font-bold text-sm">{trader.purchases.toLocaleString()}</p>
                                </div>
                              </div>

                              <div className="space-y-3">
                                <Button
                                  onClick={() => {
                                    if (getActiveTradeBySetupId(trader._id)) {
                                      showNotification("error", "You already have this trade copied!");
                                      return;
                                    }
                                    openModal(trader._id);
                                  }}
                                  className="w-full h-14 rounded-2xl bg-white text-black font-black text-lg hover:bg-gray-100 transition-all active:scale-[0.98] shadow-lg shadow-black/20"
                                >
                                  {getActiveTradeBySetupId(trader._id) ? "Already Copied" : "Copy Trade"}
                                </Button>
                                <p className="text-center text-penny-text-disabled text-[11px] font-medium opacity-60">
                                  Total assets: {trader.totalAssets.toLocaleString()}
                                </p>
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
      <TopUpWalletModal isOpen={showTopUp} onClose={() => setShowTopUp(false)} />

      {/* Add Funds to Trade Modal */}
      <AddFundsModal isOpen={!!addFundsTrade} onClose={() => setAddFundsTrade(null)} trade={addFundsTrade} />

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-xl"
            style={{ background: notification.type === "success" ? "#1B4D3E" : "#4D1B1B", color: notification.type === "success" ? "#4CAF50" : "#F44336" }}
          >
            <div className="flex items-center gap-2">
              <Icon icon={notification.type === "success" ? "mdi:check-circle" : "mdi:alert-circle"} width={20} />
              <span className="text-sm font-semibold">{notification.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {isModalOpen && selectedTrader && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
              className="relative w-full max-w-[420px] bg-[#141C2D] border border-white/5 rounded-[40px] p-8 space-y-8 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)] overflow-hidden"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-penny-accent opacity-[0.05] blur-[80px] pointer-events-none" />

              <div className="text-center space-y-3 relative z-10">
                <h2 className="text-3xl font-black text-white tracking-tighter">Confirm Copy Trade</h2>
                <p className="text-penny-text-muted text-[15px] leading-relaxed px-2">
                  You are about to copy <span className="text-white font-black">{selectedTrader.traderName}&apos;s</span> active trade.
                </p>
              </div>

              <div className="space-y-5 px-1 relative z-10">
                <div className="flex items-center justify-between p-3 rounded-2xl" style={{ background: "rgba(245,197,24,0.06)", border: "1px solid rgba(245,197,24,0.15)" }}>
                  <span className="text-penny-text-muted font-medium text-[13px]">Copy Wallet Balance</span>
                  <span className="text-white font-bold text-sm" style={{ color: "#F5C518" }}>
                    {formatCopyUSD(copyWalletBalance)}
                  </span>
                </div>
                {[
                  { label: "Copy Trade Price:", value: formatCopyUSD(selectedTrader.copyTradePrice), isBold: true },
                  {
                    label: "Risk Level:",
                    value: selectedTrader.riskLevel.charAt(0).toUpperCase() + selectedTrader.riskLevel.slice(1),
                    colorClass: selectedTrader.riskLevel === "high"
                      ? "text-penny-error"
                      : selectedTrader.riskLevel === "medium"
                      ? "text-penny-warning"
                      : "text-penny-accent",
                  },
                  {
                    label: "Current Profit:",
                    value: `${selectedTrader.rateOfChange >= 0 ? "+" : ""}${selectedTrader.rateOfChange.toFixed(2)}%`,
                    colorClass: selectedTrader.rateOfChange >= 0 ? "text-penny-accent" : "text-penny-error",
                  },
                  { label: "Duration:", value: selectedTrader.duration },
                ].map((row, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-penny-text-muted font-medium text-[15px]">{row.label}</span>
                    <span className={`text-[15px] font-bold ${row.colorClass || "text-white"}`}>
                      {row.value}
                    </span>
                  </div>
                ))}
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
