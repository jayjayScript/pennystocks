"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { useCopyTrading } from "@/context/CopyTradingContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

// ─── Helper Functions ──────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Active Copy Trade Card ───────────────────────────────────────────────────

function ActiveCopyTradeCard({ trade, onStop, onPause, onResume }: {
  trade: ActiveCopyTrade;
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { simulateNewTrade } = useCopyTrading();

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#151d2d", border: "1px solid #252f45" }}>
      {/* Header */}
      <div className="p-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold" style={{ background: trade.setup.coin.bgColor }}>
            <Icon icon={trade.setup.coin.icon || "mdi:coin"} width={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold">{trade.setup.traderNickname}</span>
              <span className="text-sm">{trade.setup.countryFlag}</span>
              {trade.status === "paused" && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(245,197,24,0.12)", color: "#F5C518" }}>PAUSED</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs" style={{ color: "#6b7785" }}>
              <span>{trade.setup.coin.symbol}</span>
              <span>•</span>
              <span>{trade.setup.leverage}x Leverage</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <p className="text-lg font-bold" style={{ color: trade.pnl >= 0 ? "#4CAF50" : "#F44336" }}>
            {trade.pnl >= 0 ? "+" : ""}{formatCurrency(trade.pnl)}
          </p>
          <p className="text-xs" style={{ color: trade.pnlPercent >= 0 ? "#4CAF50" : "#F44336" }}>
            {trade.pnlPercent >= 0 ? "+" : ""}{trade.pnlPercent.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Last Trades Toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 pb-3 flex items-center justify-between"
      >
        <span className="text-xs font-semibold" style={{ color: "#9aa3b0" }}>
          Last 10 Trades ({trade.lastTrades.length})
        </span>
        <Icon icon={expanded ? "mdi:chevron-up" : "mdi:chevron-down"} width={16} style={{ color: "#9aa3b0" }} />
      </button>

      {/* Expanded Trades List */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2">
              {trade.lastTrades.map((t, index) => (
                <div key={t.id} className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: "#0d1624" }}>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: t.type === "buy" ? "rgba(0,212,161,0.12)" : "rgba(244,67,54,0.12)", color: t.type === "buy" ? "#00d4a1" : "#F44336" }}>
                      {t.type.toUpperCase()}
                    </span>
                    <span className="text-xs text-white">{t.amount.toFixed(4)} {t.coinSymbol}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px]" style={{ color: t.profitLoss >= 0 ? "#4CAF50" : "#F44336" }}>
                      {t.profitLoss >= 0 ? "+" : ""}{formatCurrency(t.profitLoss)}
                    </span>
                    {index === 0 && (
                      <button
                        onClick={() => simulateNewTrade(trade.id)}
                        className="ml-2 text-[10px] px-2 py-0.5 rounded" style={{ background: "rgba(0,212,161,0.1)", color: "#00d4a1" }}
                      >
                        Simulate +
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="px-4 pb-4 flex gap-2">
        {trade.status === "active" ? (
          <button
            onClick={onPause}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: "#0d1624", color: "#9aa3b0", border: "1px solid #252f45" }}
          >
            Pause
          </button>
        ) : (
          <button
            onClick={onResume}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: "rgba(76,175,80,0.12)", color: "#4CAF50" }}
          >
            Resume
          </button>
        )}
        <button
          onClick={onStop}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: "rgba(244,67,54,0.12)", color: "#F44336" }}
        >
          Stop & Exit
        </button>
      </div>
    </div>
  );
}

// ─── Available Setup Card ─────────────────────────────────────────────────────

function AvailableSetupCard({ setup, isActive, onBuy }: {
  setup: CopyTradeSetup;
  isActive: boolean;
  onBuy: () => void;
}) {
  return (
    <div className="rounded-2xl p-4" style={{ background: "#151d2d", border: "1px solid #252f45" }}>
      {/* Trader Info */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: "rgba(0,212,161,0.1)", color: "#00d4a1" }}>
            {setup.traderNickname.substring(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-white font-bold">{setup.traderNickname}</span>
              <span className="text-lg">{setup.countryFlag}</span>
            </div>
            <div className="flex items-center gap-2 text-[10px]" style={{ color: "#6b7785" }}>
              <span>{setup.country}</span>
              <span>•</span>
              <span>{setup.traderWinRate}% Win Rate</span>
            </div>
          </div>
        </div>
      </div>

      {/* Coin & Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="p-2.5 rounded-xl text-center" style={{ background: "#0d1624" }}>
          <div className="w-8 h-8 mx-auto rounded-lg flex items-center justify-center mb-1" style={{ background: setup.coin.bgColor }}>
            <Icon icon={setup.coin.icon || "mdi:coin"} width={16} />
          </div>
          <p className="text-xs font-bold text-white">{setup.coin.symbol}</p>
        </div>
        <div className="p-2.5 rounded-xl text-center" style={{ background: "#0d1624" }}>
          <p className="text-[10px] mb-0.5" style={{ color: "#6b7785" }}>Leverage</p>
          <p className="text-sm font-bold text-white">{setup.leverage}x</p>
        </div>
        <div className="p-2.5 rounded-xl text-center" style={{ background: "#0d1624" }}>
          <p className="text-[10px] mb-0.5" style={{ color: "#6b7785" }}>Price</p>
          <p className="text-sm font-bold" style={{ color: "#F5C518" }}>{formatCurrency(setup.price)}</p>
        </div>
      </div>

      {/* Buy Button */}
      <button
        onClick={onBuy}
        disabled={isActive}
        className="w-full py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
        style={{ background: isActive ? "#0d1624" : "#00d4a1", color: isActive ? "#9aa3b0" : "#0d1624" }}
      >
        {isActive ? "Already Copied" : `Copy for ${formatCurrency(setup.price)}`}
      </button>
    </div>
  );
}

// ─── Confirmation Modal ────────────────────────────────────────────────────────

function BuyConfirmModal({ setup, onConfirm, onClose }: {
  setup: CopyTradeSetup;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-sm rounded-3xl p-6 space-y-5" style={{ background: "#151d2d", border: "1px solid #252f45" }}
      >
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3" style={{ background: setup.coin.bgColor }}>
            <Icon icon={setup.coin.icon || "mdi:coin"} width={32} />
          </div>
          <h2 className="text-xl font-bold text-white">Confirm Copy Trade</h2>
          <p className="text-sm mt-1" style={{ color: "#9aa3b0" }}>
            Copy {setup.traderNickname} ({setup.countryFlag})
          </p>
        </div>

        <div className="space-y-3 p-4 rounded-xl" style={{ background: "#0d1624" }}>
          <div className="flex justify-between text-sm">
            <span style={{ color: "#6b7785" }}>Coin</span>
            <span className="text-white font-semibold">{setup.coin.symbol}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span style={{ color: "#6b7785" }}>Leverage</span>
            <span className="text-white font-semibold">{setup.leverage}x</span>
          </div>
          <div className="flex justify-between text-sm">
            <span style={{ color: "#6b7785" }}>Win Rate</span>
            <span className="text-white font-semibold">{setup.traderWinRate}%</span>
          </div>
          <div className="border-t pt-3 mt-3 flex justify-between">
            <span className="font-semibold text-white">Price</span>
            <span className="font-bold" style={{ color: "#F5C518" }}>{formatCurrency(setup.price)}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl font-bold" style={{ background: "#0d1624", color: "#9aa3b0" }}>
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 py-3 rounded-xl font-bold" style={{ background: "#00d4a1", color: "#0d1624" }}>
            Confirm
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function CopyTradingPage() {
  const {
    copyWalletBalance,
    activeCopyTrades,
    availableSetups,
    buyCopyTrade,
    stopCopyTrade,
    pauseCopyTrade,
    resumeCopyTrade,
    getActiveTradeBySetupId,
    formatUSD,
  } = useCopyTrading();

  const [selectedSetup, setSelectedSetup] = useState<CopyTradeSetup | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleBuy = (setup: CopyTradeSetup) => {
    setSelectedSetup(setup);
    if (getActiveTradeBySetupId(setup.id)) {
      showNotification("error", "You already have this trade copied!");
      return;
    }
    setShowConfirm(true);
  };

  const confirmBuy = () => {
    if (!selectedSetup) return;
    const result = buyCopyTrade(selectedSetup.id);
    showNotification(result.success ? "success" : "error", result.message);
    setShowConfirm(false);
    setSelectedSetup(null);
  };

  const handleStop = (trade: ActiveCopyTrade) => {
    const result = stopCopyTrade(trade.id);
    showNotification(result.success ? "success" : "error", result.message);
  };

  // Auto-simulate trades for active copy trades
  useEffect(() => {
    const interval = setInterval(() => {
      activeCopyTrades.forEach((trade) => {
        if (trade.status === "active" && Math.random() > 0.7) {
          // Random chance to simulate new trade
        }
      });
    }, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [activeCopyTrades]);

  return (
    <div className="min-h-screen" style={{ background: "#0d1624" }}>
      {/* Header */}
      <header className="sticky top-0 z-40 px-4 py-4" style={{ background: "#0d1624e6", backdropFilter: "blur(12px)", borderBottom: "1px solid #1d2639" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/marketplace" className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#151d2d", border: "1px solid #252f45" }}>
              <Icon icon="mdi:arrow-left" width={20} className="text-white" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-white">Copy Trading</h1>
              <p className="text-[10px]" style={{ color: "#6b7785" }}>Follow expert traders</p>
            </div>
          </div>

          {/* Copy Wallet Balance */}
          <div className="px-4 py-2 rounded-xl" style={{ background: "#151d2d", border: "1px solid #252f45" }}>
            <p className="text-[10px]" style={{ color: "#6b7785" }}>Copy Wallet</p>
            <p className="text-sm font-bold" style={{ color: "#F5C518" }}>{formatUSD(copyWalletBalance)}</p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6 max-w-2xl mx-auto">
        {/* Active Copy Trades */}
        {activeCopyTrades.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-white">Your Copy Trades ({activeCopyTrades.length})</h2>
            </div>
            <div className="space-y-4">
              {activeCopyTrades.map((trade) => (
                <ActiveCopyTradeCard
                  key={trade.id}
                  trade={trade}
                  onStop={() => handleStop(trade)}
                  onPause={() => pauseCopyTrade(trade.id)}
                  onResume={() => resumeCopyTrade(trade.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Available Trades */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-white">Copy These Trades</h2>
            <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: "rgba(0,212,161,0.1)", color: "#00d4a1" }}>
              {availableSetups.length} Available
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {availableSetups.map((setup) => (
              <AvailableSetupCard
                key={setup.id}
                setup={setup}
                isActive={!!getActiveTradeBySetupId(setup.id)}
                onBuy={() => handleBuy(setup)}
              />
            ))}
          </div>
        </section>
      </div>

      {/* Buy Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && selectedSetup && (
          <BuyConfirmModal
            setup={selectedSetup}
            onConfirm={confirmBuy}
            onClose={() => { setShowConfirm(false); setSelectedSetup(null); }}
          />
        )}
      </AnimatePresence>

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
    </div>
  );
}