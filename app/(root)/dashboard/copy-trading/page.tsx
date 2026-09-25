"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { copyTradingApi } from "@/lib/api/backend";
import { flagFromCountryCode } from "@/lib/copyTradeMeta";
import type {
  CopyTrading,
  CopyTradePurchase,
  CopyTradingPortfolio,
} from "@/types/api";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

function initials(name?: string): string {
  return (
    (name ?? "")
      .split(" ")
      .map((n) => n[0] ?? "")
      .join("")
      .substring(0, 2)
      .toUpperCase() || "??"
  );
}

/** The plan id of a purchase — the field may be populated or a raw id. */
function planIdOf(purchase: CopyTradePurchase): string {
  return typeof purchase.copyTradingId === "string"
    ? purchase.copyTradingId
    : (purchase.copyTradingId?._id ?? "");
}

// ─── Active Copy Trade Card ───────────────────────────────────────────────────

function ActiveCopyTradeCard({
  trade,
  onLiquidate,
  liquidating,
}: {
  trade: CopyTradePurchase;
  onLiquidate: () => void;
  liquidating: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  const invested = trade.amountInvested ?? 0;
  const pnl = trade.pnl ?? 0;
  const pnlPercent = invested > 0 ? (pnl / invested) * 100 : 0;
  const isUp = pnl >= 0;
  const pnlColor = isUp ? "#4CAF50" : "#F44336";
  const currentValue = invested + pnl;
  const plan =
    trade.copyTradingId && typeof trade.copyTradingId !== "string"
      ? trade.copyTradingId
      : null;
  const profitFill = Math.min(Math.max(Math.abs(pnlPercent), 0), 100);

  return (
    <div
      className="rounded-2xl overflow-hidden transition-colors"
      style={{ background: "#151d2d", border: "1px solid #252f45" }}
    >
      {/* Header */}
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
            style={{ background: "rgba(0,212,161,0.12)", color: "#00d4a1" }}
          >
            {initials(trade.traderName)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold truncate">
                {trade.traderName}
              </span>
            </div>
            <div
              className="flex items-center gap-2 text-xs mt-0.5"
              style={{ color: "#6b7785" }}
            >
              <span>INDEX FUNDS</span>
              <span>•</span>
              <span>{trade.leverage ?? 1}x</span>
              <span>•</span>
              <span>{trade.winrate ?? 0}% win rate</span>
            </div>
          </div>
        </div>

        <span
          className="text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 tracking-wide"
          style={{ background: "rgba(0,212,161,0.12)", color: "#00d4a1" }}
        >
          ACTIVE
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
            <span
              className="text-[11px] font-medium"
              style={{ color: "#9aa3b0" }}
            >
              Unrealized P&amp;L
            </span>
            <div
              className="flex items-center gap-1 text-xs font-bold"
              style={{ color: pnlColor }}
            >
              <Icon
                icon={isUp ? "mdi:trending-up" : "mdi:trending-down"}
                width={14}
              />
              {isUp ? "+" : ""}
              {pnlPercent.toFixed(2)}%
            </div>
          </div>
          <p className="text-2xl font-extrabold mt-1" style={{ color: pnlColor }}>
            {isUp ? "+" : ""}
            {formatCurrency(pnl)}
          </p>

          {/* Profit bar */}
          <div
            className="mt-3 h-1.5 rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
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
          <p className="text-[10px]" style={{ color: "#6b7785" }}>
            Invested
          </p>
          <p className="text-sm font-bold text-white mt-0.5">
            {formatCurrency(invested)}
          </p>
        </div>
        <div
          className="text-center border-x"
          style={{ borderColor: "#252f45" }}
        >
          <p className="text-[10px]" style={{ color: "#6b7785" }}>
            Current Value
          </p>
          <p className="text-sm font-bold text-white mt-0.5">
            {formatCurrency(currentValue)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-[10px]" style={{ color: "#6b7785" }}>
            Fee
          </p>
          <p className="text-sm font-bold text-white mt-0.5">
            {trade.percentage ?? 0}%
          </p>
        </div>
      </div>

      {/* Plan details */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-2.5 flex items-center justify-between cursor-pointer"
        style={{ borderTop: "1px solid #1d2639" }}
      >
        <span className="text-xs font-semibold" style={{ color: "#9aa3b0" }}>
          Plan Details
        </span>
        <Icon
          icon={expanded ? "mdi:chevron-up" : "mdi:chevron-down"}
          width={16}
          style={{ color: "#9aa3b0" }}
        />
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg" style={{ background: "#0d1624" }}>
                <span style={{ color: "#6b7785" }}>Duration</span>
                <p className="text-white font-semibold">
                  {trade.duration || plan?.traderName ? trade.duration : "—"}
                </p>
              </div>
              <div className="p-2.5 rounded-lg" style={{ background: "#0d1624" }}>
                <span style={{ color: "#6b7785" }}>Risk Level</span>
                <p className="text-white font-semibold capitalize">
                  {trade.riskLevel || "low"}
                </p>
              </div>
              <div className="p-2.5 rounded-lg" style={{ background: "#0d1624" }}>
                <span style={{ color: "#6b7785" }}>Expires</span>
                <p className="text-white font-semibold">
                  {trade.expiredAt
                    ? new Date(trade.expiredAt).toLocaleDateString()
                    : "—"}
                </p>
              </div>
              <div className="p-2.5 rounded-lg" style={{ background: "#0d1624" }}>
                <span style={{ color: "#6b7785" }}>Opened</span>
                <p className="text-white font-semibold">
                  {trade.createdAt
                    ? new Date(trade.createdAt).toLocaleDateString()
                    : "—"}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="px-4 pb-4 flex gap-2">
        <button
          onClick={onLiquidate}
          disabled={liquidating}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-transform active:scale-95 disabled:opacity-50"
          style={{
            background: "rgba(244,67,54,0.12)",
            color: "#F44336",
            border: "1px solid rgba(244,67,54,0.2)",
          }}
        >
          {liquidating ? "Liquidating..." : "Stop & Exit"}
        </button>
      </div>
    </div>
  );
}

// ─── Available Setup Card ─────────────────────────────────────────────────────

function AvailableSetupCard({
  setup,
  onBuy,
}: {
  setup: CopyTrading;
  onBuy: () => void;
}) {
  const trades = (setup.last_10_trades ?? []).slice(0, 10);

  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: "#151d2d", border: "1px solid #252f45" }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: "rgba(0,212,161,0.1)", color: "#00d4a1" }}
          >
            {initials(setup.traderName)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-white font-bold">{setup.traderName}</span>
              <span className="text-lg">
                {flagFromCountryCode(setup.country)}
              </span>
            </div>
            <div
              className="flex items-center gap-2 text-[10px]"
              style={{ color: "#6b7785" }}
            >
              <span>{setup.duration}</span>
              <span>•</span>
              <span className="capitalize">{setup.riskLevel} risk</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div
          className="p-2.5 rounded-xl text-center"
          style={{ background: "#0d1624" }}
        >
          <p className="text-[10px] mb-0.5" style={{ color: "#6b7785" }}>
            Win Rate
          </p>
          <p
            className="text-sm font-bold"
            style={{ color: "#00d4a1" }}
          >
            {(setup.winrate ?? 0).toFixed(0)}%
          </p>
        </div>
        <div
          className="p-2.5 rounded-xl text-center"
          style={{ background: "#0d1624" }}
        >
          <p className="text-[10px] mb-0.5" style={{ color: "#6b7785" }}>
            Leverage
          </p>
          <p className="text-sm font-bold text-white">{setup.leverage ?? 1}x</p>
        </div>
        <div
          className="p-2.5 rounded-xl text-center"
          style={{ background: "#0d1624" }}
        >
          <p className="text-[10px] mb-0.5" style={{ color: "#6b7785" }}>
            Fee
          </p>
          <p className="text-sm font-bold" style={{ color: "#F5C518" }}>
            {setup.percentage}%
          </p>
        </div>
      </div>

      {/* Last 10 trades reported by the backend plan */}
      {trades.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {trades.map((v, i) => {
            const up = v >= 0;
            return (
              <span
                key={i}
                className="text-[11px] font-bold px-2 py-1 rounded-md text-center"
                style={{
                  background: up
                    ? "rgba(0,212,161,0.10)"
                    : "rgba(244,67,54,0.10)",
                  color: up ? "#00d4a1" : "#F44336",
                  border: `1px solid ${up ? "rgba(0,212,161,0.35)" : "rgba(244,67,54,0.35)"}`,
                }}
              >
                {up ? "+" : ""}
                {v.toFixed(1)}%
              </span>
            );
          })}
        </div>
      )}

      <button
        onClick={onBuy}
        className="w-full py-3 rounded-xl text-sm font-bold transition-all cursor-pointer active:scale-95"
        style={{ background: "#00d4a1", color: "#0d1624" }}
      >
        Copy Trade
      </button>
    </div>
  );
}

// ─── Buy Confirmation Modal ───────────────────────────────────────────────────

function BuyConfirmModal({
  setup,
  copyWalletBalance,
  pending,
  onConfirm,
  onClose,
}: {
  setup: CopyTrading;
  copyWalletBalance: number;
  pending: boolean;
  onConfirm: (amount: number) => void;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState("100");
  const parsed = parseFloat(amount) || 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-sm rounded-3xl p-6 space-y-5"
        style={{ background: "#151d2d", border: "1px solid #252f45" }}
      >
        <div className="text-center">
          <div
            className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-lg font-bold mb-3"
            style={{ background: "rgba(0,212,161,0.12)", color: "#00d4a1" }}
          >
            {initials(setup.traderName)}
          </div>
          <h2 className="text-xl font-bold text-white">Confirm Copy Trade</h2>
          <p className="text-sm mt-1" style={{ color: "#9aa3b0" }}>
            Copy {setup.traderName} {flagFromCountryCode(setup.country)}
          </p>
        </div>

        <div className="space-y-3 p-4 rounded-xl" style={{ background: "#0d1624" }}>
          <div className="flex justify-between text-sm">
            <span style={{ color: "#6b7785" }}>Win Rate</span>
            <span className="text-white font-semibold">
              {(setup.winrate ?? 0).toFixed(0)}%
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span style={{ color: "#6b7785" }}>Leverage</span>
            <span className="text-white font-semibold">
              {setup.leverage ?? 1}x
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span style={{ color: "#6b7785" }}>Performance Fee</span>
            <span className="text-white font-semibold">
              {setup.percentage}%
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span style={{ color: "#6b7785" }}>Copy Wallet</span>
            <span className="font-semibold" style={{ color: "#F5C518" }}>
              {formatCurrency(copyWalletBalance)}
            </span>
          </div>
          <div className="border-t pt-3 mt-3">
            <label
              className="text-xs font-semibold mb-2 block"
              style={{ color: "#9aa3b0" }}
              htmlFor="copy-amount"
            >
              Amount to invest
            </label>
            <input
              id="copy-amount"
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-sm text-center font-bold"
              style={{
                background: "#151d2d",
                border: "1px solid #252f45",
                color: "white",
              }}
              placeholder="100"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-bold cursor-pointer"
            style={{ background: "#0d1624", color: "#9aa3b0" }}
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(parsed)}
            disabled={pending || parsed <= 0}
            className="flex-1 py-3 rounded-xl font-bold cursor-pointer disabled:opacity-50"
            style={{ background: "#00d4a1", color: "#0d1624" }}
          >
            {pending ? "Processing..." : "Confirm"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CopyTradingPage() {
  const queryClient = useQueryClient();
  const [selectedSetup, setSelectedSetup] = useState<CopyTrading | null>(null);
  const [buying, setBuying] = useState(false);
  const [liquidatingId, setLiquidatingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const { data: rawSetups, isLoading: isSetupsLoading } = useQuery({
    queryKey: ["copy-trading"],
    queryFn: copyTradingApi.list,
  });

  const { data: rawPurchases, isLoading: isPurchasesLoading } = useQuery({
    queryKey: ["my-copy-trades"],
    queryFn: copyTradingApi.mine,
  });

  const { data: portfolio } = useQuery({
    queryKey: ["copy-trading-portfolio"],
    queryFn: copyTradingApi.portfolio,
  });

  const setups: CopyTrading[] = useMemo(() => rawSetups ?? [], [rawSetups]);

  const purchases: CopyTradePurchase[] = useMemo(
    () => rawPurchases ?? [],
    [rawPurchases],
  );

  const copyPortfolio: CopyTradingPortfolio | null = portfolio ?? null;
  const copyWalletBalance = copyPortfolio?.balance ?? 0;
  const isLoading = isSetupsLoading || isPurchasesLoading;

  const activeCopyTrades = purchases.filter((p) => p.status !== "liquidated");
  const activeSetupIds = new Set(activeCopyTrades.map(planIdOf));
  const availableSetups = setups.filter(
    (s) => s.isActive !== false && !activeSetupIds.has(s._id),
  );

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const refreshData = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["my-copy-trades"] }),
      queryClient.invalidateQueries({ queryKey: ["copy-trading-portfolio"] }),
      queryClient.invalidateQueries({ queryKey: ["user-profile"] }),
      queryClient.invalidateQueries({ queryKey: ["transactions"] }),
    ]);

  const confirmBuy = async (amountInvested: number) => {
    if (!selectedSetup) return;
    if (amountInvested <= 0 || amountInvested > copyWalletBalance) {
      showNotification(
        "error",
        `Insufficient copy wallet balance. You have ${formatCurrency(copyWalletBalance)}.`,
      );
      return;
    }
    setBuying(true);
    try {
      await copyTradingApi.buy(selectedSetup._id, amountInvested);
      await refreshData();
      showNotification("success", `Now copying ${selectedSetup.traderName}!`);
      setSelectedSetup(null);
    } catch (err) {
      showNotification(
        "error",
        err instanceof Error ? err.message : "Failed to start copy trade.",
      );
    } finally {
      setBuying(false);
    }
  };

  const handleLiquidate = async (trade: CopyTradePurchase) => {
    setLiquidatingId(trade._id);
    try {
      await copyTradingApi.liquidate(trade._id);
      await refreshData();
      showNotification("success", `Stopped copying ${trade.traderName}.`);
    } catch (err) {
      showNotification(
        "error",
        err instanceof Error ? err.message : "Failed to liquidate copy trade.",
      );
    } finally {
      setLiquidatingId(null);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#0d1624" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-40 px-4 py-4"
        style={{
          background: "#0d1624e6",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #1d2639",
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "#151d2d", border: "1px solid #252f45" }}
            >
              <Icon icon="mdi:arrow-left" width={20} className="text-white" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-white">Copy Trading</h1>
              <p className="text-[10px]" style={{ color: "#6b7785" }}>
                Follow expert traders
              </p>
            </div>
          </div>

          <div
            className="px-4 py-2 rounded-xl"
            style={{ background: "#151d2d", border: "1px solid #252f45" }}
          >
            <p className="text-[10px]" style={{ color: "#6b7785" }}>
              Copy Wallet
            </p>
            <p className="text-sm font-bold" style={{ color: "#F5C518" }}>
              {formatCurrency(copyWalletBalance)}
            </p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6 max-w-2xl mx-auto">
        {/* Active Copy Trades */}
        {activeCopyTrades.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-white">
                Your Copy Trades ({activeCopyTrades.length})
              </h2>
            </div>
            <div className="space-y-4">
              {activeCopyTrades.map((trade) => (
                <ActiveCopyTradeCard
                  key={trade._id}
                  trade={trade}
                  liquidating={liquidatingId === trade._id}
                  onLiquidate={() => handleLiquidate(trade)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Available Trades */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-white">Copy These Trades</h2>
            {!isLoading && (
              <span
                className="text-xs px-2.5 py-1 rounded-full"
                style={{ background: "rgba(0,212,161,0.1)", color: "#00d4a1" }}
              >
                {availableSetups.length} Available
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-4 animate-pulse"
                  style={{ background: "#151d2d", border: "1px solid #1d2639" }}
                >
                  <div className="h-12 rounded bg-white/10" />
                  <div className="h-4 rounded bg-white/10 mt-4" />
                  <div className="h-10 rounded bg-white/5 mt-4" />
                </div>
              ))}
            </div>
          ) : availableSetups.length === 0 ? (
            <div className="py-12 text-center">
              <Icon
                icon="mdi:chart-line-variant"
                width={40}
                className="mx-auto"
                style={{ color: "#6b7785" }}
              />
              <p className="text-sm font-medium mt-3 text-white">
                No copy trades available
              </p>
              <p className="text-xs mt-1" style={{ color: "#6b7785" }}>
                You have copied every available trader, or the admin has not
                posted one yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availableSetups.map((setup) => (
                <AvailableSetupCard
                  key={setup._id}
                  setup={setup}
                  onBuy={() => setSelectedSetup(setup)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Buy Confirmation Modal */}
      <AnimatePresence>
        {selectedSetup && (
          <BuyConfirmModal
            setup={selectedSetup}
            copyWalletBalance={copyWalletBalance}
            pending={buying}
            onConfirm={confirmBuy}
            onClose={() => setSelectedSetup(null)}
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
    </div>
  );
}