"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Mock Types ───────────────────────────────────────────────────────────────

type CoinInfo = { symbol: string; icon: string; bgColor: string };
type CopyTradeSetup = { id: string; traderNickname: string; countryFlag: string; country: string; coin: CoinInfo; leverage: number; price: number; traderWinRate: number };
type TradeEntry = { id: string; type: "buy" | "sell"; amount: number; coinSymbol: string; profitLoss: number };
type ActiveCopyTrade = { id: string; setup: CopyTradeSetup; status: "active" | "paused"; pnl: number; pnlPercent: number; investedAmount: number; lastTrades: TradeEntry[] };

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_SETUPS: CopyTradeSetup[] = [
  { id: "s1", traderNickname: "AlphaKing",  countryFlag: "🇺🇸", country: "USA",    coin: { symbol: "BTC", icon: "mdi:bitcoin",  bgColor: "rgba(247,147,26,0.15)" }, leverage: 10, price: 99,  traderWinRate: 84 },
  { id: "s2", traderNickname: "NightOwl",   countryFlag: "🇬🇧", country: "UK",     coin: { symbol: "ETH", icon: "mdi:ethereum", bgColor: "rgba(98,126,234,0.15)"  }, leverage: 5,  price: 149, traderWinRate: 76 },
  { id: "s3", traderNickname: "ZenTrader",  countryFlag: "🇯🇵", country: "Japan",  coin: { symbol: "SOL", icon: "mdi:alpha-s-circle", bgColor: "rgba(20,241,149,0.15)" }, leverage: 3,  price: 79,  traderWinRate: 68 },
];

const INITIAL_ACTIVE: ActiveCopyTrade[] = [
  {
    id: "t1",
    setup: MOCK_SETUPS[0],
    status: "active",
    pnl: 248.30,
    pnlPercent: 14.2,
    investedAmount: 1750,
    lastTrades: [
      { id: "l1", type: "buy",  amount: 0.0032, coinSymbol: "BTC", profitLoss: 82.50 },
      { id: "l2", type: "sell", amount: 0.0018, coinSymbol: "BTC", profitLoss: -12.10 },
    ],
  },
];

// ─── Helper Functions ──────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(amount);
}

// ─── Active Copy Trade Card ───────────────────────────────────────────────────

function ActiveCopyTradeCard({ trade, onStop, onPause, onResume }: {
  trade: ActiveCopyTrade;
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const isUp = trade.pnl >= 0;
  const pnlColor = isUp ? "#4CAF50" : "#F44336";
  const isPaused = trade.status === "paused";
  const currentValue = trade.investedAmount + trade.pnl;
  // Bar fill: how much of the invested capital is currently in profit (capped for display).
  const profitFill = Math.min(Math.max(Math.abs(trade.pnlPercent), 0), 100);

  const statusMeta = isPaused
    ? { label: "PAUSED", color: "#F5C518", bg: "rgba(245,197,24,0.12)" }
    : { label: "ACTIVE", color: "#00d4a1", bg: "rgba(0,212,161,0.12)" };

  return (
    <div
      className="rounded-2xl overflow-hidden transition-colors"
      style={{ background: "#151d2d", border: `1px solid ${isPaused ? "#3a3320" : "#252f45"}` }}
    >
      {/* Header */}
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: trade.setup.coin.bgColor || "rgba(0,212,161,0.12)" }}
          >
            <Icon icon={trade.setup.coin.icon || "mdi:chart-line"} width={24} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold truncate">{trade.setup.traderNickname}</span>
              <span className="text-sm shrink-0">{trade.setup.countryFlag}</span>
            </div>
            <div className="flex items-center gap-2 text-xs mt-0.5" style={{ color: "#6b7785" }}>
              <span>{trade.setup.country}</span>
              <span>•</span>
              <span>{trade.setup.coin.symbol}</span>
              <span>•</span>
              <span>{trade.setup.leverage}x</span>
            </div>
          </div>
        </div>

        <span
          className="text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 tracking-wide"
          style={{ background: statusMeta.bg, color: statusMeta.color }}
        >
          {statusMeta.label}
        </span>
      </div>

      {/* PnL Hero */}
      <div className="px-4">
        <div
          className="rounded-xl p-4"
          style={{
            background: isUp
              ? "linear-gradient(135deg, rgba(76,175,80,0.12), rgba(76,175,80,0.02))"
              : "linear-gradient(135deg, rgba(244,67,54,0.12), rgba(244,67,54,0.02))",
            border: `1px solid ${isUp ? "rgba(76,175,80,0.25)" : "rgba(244,67,54,0.25)"}`,
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium" style={{ color: "#9aa3b0" }}>
              Unrealized P&amp;L
            </span>
            <div className="flex items-center gap-1 text-xs font-bold" style={{ color: pnlColor }}>
              <Icon icon={isUp ? "mdi:trending-up" : "mdi:trending-down"} width={14} />
              {isUp ? "+" : ""}
              {trade.pnlPercent.toFixed(2)}%
            </div>
          </div>
          <p className="text-2xl font-extrabold mt-1" style={{ color: pnlColor }}>
            {isUp ? "+" : ""}
            {formatCurrency(trade.pnl)}
          </p>

          {/* Profit bar */}
          <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${profitFill}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{ background: pnlColor }}
            />
          </div>
        </div>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-3 gap-2 px-4 py-3">
        <div className="text-center">
          <p className="text-[10px]" style={{ color: "#6b7785" }}>Invested</p>
          <p className="text-sm font-bold text-white mt-0.5">{formatCurrency(trade.investedAmount)}</p>
        </div>
        <div className="text-center border-x" style={{ borderColor: "#252f45" }}>
          <p className="text-[10px]" style={{ color: "#6b7785" }}>Current Value</p>
          <p className="text-sm font-bold text-white mt-0.5">{formatCurrency(currentValue)}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px]" style={{ color: "#6b7785" }}>Trades</p>
          <p className="text-sm font-bold text-white mt-0.5">{trade.lastTrades.length}</p>
        </div>
      </div>

      {/* Last Trades Toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-2.5 flex items-center justify-between cursor-pointer"
        style={{ borderTop: "1px solid #1d2639" }}
      >
        <span className="text-xs font-semibold" style={{ color: "#9aa3b0" }}>
          Last Trades ({trade.lastTrades.length})
        </span>
        <Icon icon={expanded ? "mdi:chevron-up" : "mdi:chevron-down"} width={16} style={{ color: "#9aa3b0" }} />
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2">
              {trade.lastTrades.length === 0 ? (
                <p className="text-xs text-center py-3" style={{ color: "#6b7785" }}>
                  No trades executed yet.
                </p>
              ) : (
                trade.lastTrades.map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: "#0d1624" }}>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: t.type === "buy" ? "rgba(0,212,161,0.12)" : "rgba(244,67,54,0.12)", color: t.type === "buy" ? "#00d4a1" : "#F44336" }}>
                        {t.type.toUpperCase()}
                      </span>
                      <span className="text-xs text-white">{t.amount.toFixed(4)} {t.coinSymbol}</span>
                    </div>
                    <span className="text-[10px] font-semibold" style={{ color: t.profitLoss >= 0 ? "#4CAF50" : "#F44336" }}>
                      {t.profitLoss >= 0 ? "+" : ""}{formatCurrency(t.profitLoss)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="px-4 pb-4 flex gap-2">
        {isPaused ? (
          <button onClick={onResume} className="flex-1 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-transform active:scale-95" style={{ background: "rgba(76,175,80,0.12)", color: "#4CAF50", border: "1px solid rgba(76,175,80,0.25)" }}>
            Resume
          </button>
        ) : (
          <button onClick={onPause} className="flex-1 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-transform active:scale-95" style={{ background: "#0d1624", color: "#9aa3b0", border: "1px solid #252f45" }}>
            Pause
          </button>
        )}
        <button onClick={onStop} className="flex-1 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-transform active:scale-95" style={{ background: "rgba(244,67,54,0.12)", color: "#F44336", border: "1px solid rgba(244,67,54,0.2)" }}>
          Stop &amp; Exit
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

      <button
        onClick={onBuy}
        disabled={isActive}
        className="w-full py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50 cursor-pointer"
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
          <div className="flex justify-between text-sm"><span style={{ color: "#6b7785" }}>Coin</span><span className="text-white font-semibold">{setup.coin.symbol}</span></div>
          <div className="flex justify-between text-sm"><span style={{ color: "#6b7785" }}>Leverage</span><span className="text-white font-semibold">{setup.leverage}x</span></div>
          <div className="flex justify-between text-sm"><span style={{ color: "#6b7785" }}>Win Rate</span><span className="text-white font-semibold">{setup.traderWinRate}%</span></div>
          <div className="border-t pt-3 mt-3 flex justify-between">
            <span className="font-semibold text-white">Price</span>
            <span className="font-bold" style={{ color: "#F5C518" }}>{formatCurrency(setup.price)}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl font-bold cursor-pointer" style={{ background: "#0d1624", color: "#9aa3b0" }}>Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-3 rounded-xl font-bold cursor-pointer" style={{ background: "#00d4a1", color: "#0d1624" }}>Confirm</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function CopyTradingPage() {
  const [activeCopyTrades, setActiveCopyTrades] = useState<ActiveCopyTrade[]>(INITIAL_ACTIVE);
  const [copyWalletBalance] = useState(750.00);
  const [selectedSetup, setSelectedSetup] = useState<CopyTradeSetup | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const availableSetups = MOCK_SETUPS.filter(
    (s) => !activeCopyTrades.some((t) => t.setup.id === s.id)
  );

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleBuy = (setup: CopyTradeSetup) => {
    setSelectedSetup(setup);
    setShowConfirm(true);
  };

  const confirmBuy = () => {
    if (!selectedSetup) return;
    const newTrade: ActiveCopyTrade = {
      id: `t-${Date.now()}`,
      setup: selectedSetup,
      status: "active",
      pnl: 0,
      pnlPercent: 0,
      investedAmount: selectedSetup.price,
      lastTrades: [],
    };
    setActiveCopyTrades((prev) => [...prev, newTrade]);
    showNotification("success", `Now copying ${selectedSetup.traderNickname}!`);
    setShowConfirm(false);
    setSelectedSetup(null);
  };

  const handleStop = (trade: ActiveCopyTrade) => {
    setActiveCopyTrades((prev) => prev.filter((t) => t.id !== trade.id));
    showNotification("success", `Stopped copying ${trade.setup.traderNickname}.`);
  };

  const handlePause = (id: string) => {
    setActiveCopyTrades((prev) => prev.map((t) => t.id === id ? { ...t, status: "paused" } : t));
  };

  const handleResume = (id: string) => {
    setActiveCopyTrades((prev) => prev.map((t) => t.id === id ? { ...t, status: "active" } : t));
  };

  // Auto-simulate minor PnL drift on active trades
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCopyTrades((prev) =>
        prev.map((t) => {
          if (t.status !== "active") return t;
          const delta = (Math.random() - 0.48) * 5;
          const newPnl = +(t.pnl + delta).toFixed(2);
          const newPct = +((newPnl / t.investedAmount) * 100).toFixed(2);
          return { ...t, pnl: newPnl, pnlPercent: newPct };
        })
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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

          <div className="px-4 py-2 rounded-xl" style={{ background: "#151d2d", border: "1px solid #252f45" }}>
            <p className="text-[10px]" style={{ color: "#6b7785" }}>Copy Wallet</p>
            <p className="text-sm font-bold" style={{ color: "#F5C518" }}>{formatCurrency(copyWalletBalance)}</p>
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
                  onPause={() => handlePause(trade.id)}
                  onResume={() => handleResume(trade.id)}
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
                isActive={activeCopyTrades.some((t) => t.setup.id === setup.id)}
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