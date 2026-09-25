"use client";

import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";
import { useCopyTrading } from "@/hooks/queries";
import {
  useCreateCopyTrade,
  useUpdateCopyTrade,
  useDeleteCopyTrade,
  useToggleCopyTradeActive,
} from "@/hooks/queries/useAdminActions";
import { adminApi } from "@/lib/api/backend";
import type { CopyTrading, CreateCopyTradingPayload, RiskLevel, CopyTradePurchase } from "@/types/api";

function formatUSD(val: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);
}

const RISK_STYLES: Record<RiskLevel, { bg: string; color: string }> = {
  low: { bg: "rgba(0,212,161,0.1)", color: "#00d4a1" },
  medium: { bg: "rgba(245,197,24,0.1)", color: "#F5C518" },
  high: { bg: "rgba(244,67,54,0.1)", color: "#F44336" },
};

// The "Deploy New Trader" form maps directly onto the backend CopyTrading model
// (traderName, riskLevel, leverage, winrate, country, last_10_trades, duration,
// percentage). The coin symbol is stored as the plan `currency`.
interface TraderFormState {
  traderName: string;
  countryCode: string;
  leverage: number;
  percentage: number;
  trades: number[];
}

const TRADE_COUNT = 10;

/** Derive a risk level from leverage — higher leverage reads as higher risk. */

function riskFromLeverage(leverage: number): RiskLevel {
  if (leverage >= 20) return "high";
  if (leverage >= 10) return "medium";
  return "low";
}

const emptyForm = (): TraderFormState => ({
  traderName: "",
  countryCode: "US",
  leverage: 10,
  percentage: 5,
  trades: Array.from({ length: TRADE_COUNT }, () => 10),
});

/** Build the payload the backend accepts from the richer local form state. */
function toBackendPayload(
  form: TraderFormState,
  duration: string,
): CreateCopyTradingPayload {
  const winRate = form.trades.length
    ? (form.trades.filter((t) => t > 0).length / form.trades.length) * 100
    : 0;
  return {
    traderName: form.traderName.trim(),
    riskLevel: riskFromLeverage(form.leverage),
    leverage: form.leverage,
    winrate: Number(winRate.toFixed(2)),
    country: form.countryCode.trim().toUpperCase(),
    last_10_trades: form.trades,
    duration: duration.trim() || "30 days",
    purchases: 0,
    totalAssets: 0,
    percentage: form.percentage,
  };
}

export default function CopyTradingAdminPage() {
  const { data: setupsData, isLoading, error } = useCopyTrading();
  const setups: CopyTrading[] = setupsData ?? [];

  const createMut = useCreateCopyTrade();
  const updateMut = useUpdateCopyTrade();
  const deleteMut = useDeleteCopyTrade();
  const toggleMut = useToggleCopyTradeActive();
  const qc = useQueryClient();

  const [activeTab, setActiveTab] = useState<"setups" | "purchases">("setups");
  const [purchaseSearch, setPurchaseSearch] = useState("");
  const [purchaseStatusFilter, setPurchaseStatusFilter] = useState<"all" | "active" | "liquidated">("all");

  const { data: purchasesData, isLoading: purchasesLoading, error: purchasesError } = useQuery({
    queryKey: ["admin", "copy-trade-purchases"],
    queryFn: () => adminApi.copyTradePurchases({ limit: 100 }),
  });
  const purchases: CopyTradePurchase[] = purchasesData?.data ?? [];

  // Edit PnL state
  const [editingPnlPurchase, setEditingPnlPurchase] = useState<CopyTradePurchase | null>(null);
  const [pnlValue, setPnlValue] = useState("");
  const [pnlError, setPnlError] = useState("");
  const [isSavingPnl, setIsSavingPnl] = useState(false);

  const openPnlEdit = (purchase: CopyTradePurchase) => {
    setEditingPnlPurchase(purchase);
    setPnlValue(purchase.pnl !== undefined && purchase.pnl !== null ? String(purchase.pnl) : "0");
    setPnlError("");
  };

  const closePnlEdit = () => {
    if (!isSavingPnl) {
      setEditingPnlPurchase(null);
      setPnlValue("");
      setPnlError("");
    }
  };

  const handleSavePnl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPnlPurchase) return;
    const num = parseFloat(pnlValue);
    if (isNaN(num)) {
      setPnlError("Please enter a valid number for PnL");
      return;
    }
    setIsSavingPnl(true);
    setPnlError("");
    try {
      await adminApi.updateCopyTradePurchase(editingPnlPurchase._id, { pnl: num });
      qc.invalidateQueries({ queryKey: ["admin", "copy-trade-purchases"] });
      qc.invalidateQueries({ queryKey: ["admin", "user-copy-trade-purchases"] });
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      setEditingPnlPurchase(null);
    } catch (err) {
      setPnlError(err instanceof Error ? err.message : "Failed to update PnL.");
    } finally {
      setIsSavingPnl(false);
    }
  };

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TraderFormState>(emptyForm());
  const [durationValue, setDurationValue] = useState("30 days");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [actionError, setActionError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const openAdd = () => {
    setEditingId(null);
    setFormData(emptyForm());
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (setup: CopyTrading) => {
    setEditingId(setup._id);
    setDurationValue(setup.duration || "30 days");
    // Prefill from the backend-stored fields (country, currency, leverage,
    // last_10_trades) with sensible defaults when absent.
    setFormData({
      traderName: setup.traderName,
      countryCode: setup.country ?? "US",
      leverage: setup.leverage ?? 10,
      percentage: setup.percentage,
      trades:
        setup.last_10_trades && setup.last_10_trades.length
          ? setup.last_10_trades.slice(0, TRADE_COUNT)
          : Array.from({ length: TRADE_COUNT }, () => 10),
    });
    setFormErrors({});
    setShowModal(true);
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!formData.traderName.trim()) errs.traderName = "Trader name is required";
    if (formData.percentage < 0 || formData.percentage > 100) errs.percentage = "Percentage must be between 0 and 100";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setActionError("");
    const payload = toBackendPayload(formData, durationValue);
    try {
      if (editingId) {
        await updateMut.mutateAsync({ id: editingId, data: payload });
      } else {
        await createMut.mutateAsync(payload);
      }
      setShowModal(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to save setup.");
    }
  };

  const handleDelete = async (id: string) => {
    setActionError("");
    try {
      await deleteMut.mutateAsync(id);
      setDeleteConfirm(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to delete setup.");
      setDeleteConfirm(null);
    }
  };

  const toggleActive = async (setup: CopyTrading) => {
    setActionError("");
    try {
      // Dedicated backend endpoint: PATCH /copy-trading/:id/toggle-active
      await toggleMut.mutateAsync({ id: setup._id, isActive: !(setup.isActive !== false) });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to update setup.");
    }
  };

  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) => {
      if (purchaseStatusFilter !== "all" && p.status !== purchaseStatusFilter) return false;
      if (!purchaseSearch.trim()) return true;
      const q = purchaseSearch.toLowerCase();
      const userName =
        typeof p.userId === "object" && p.userId !== null
          ? `${p.userId.firstName ?? ""} ${p.userId.lastName ?? ""} ${p.userId.email ?? ""} ${p.userId.userID ?? ""}`.toLowerCase()
          : String(p.userId).toLowerCase();
      return p.traderName.toLowerCase().includes(q) || userName.includes(q);
    });
  }, [purchases, purchaseSearch, purchaseStatusFilter]);

  return (
    <div className="px-0 py-4 sm:px-1 sm:py-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Copy Trading</h1>
          <p className="text-xs sm:text-sm mt-1" style={{ color: "#9aa3b0" }}>
            {activeTab === "setups"
              ? isLoading ? "Loading..." : `${setups.length} setups configured`
              : purchasesLoading ? "Loading..." : `${purchases.length} user trades recorded`}
          </p>
        </div>
        {activeTab === "setups" && (
          <Button
            onClick={openAdd}
            className="flex items-center gap-2"
            style={{ background: "#00d4a1", color: "#0d1624" }}
          >
            <Icon icon="mdi:plus" width={16} />
            Add Setup
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#252f45] pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("setups")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "setups"
              ? "bg-[#00d4a1]/15 text-[#00d4a1] border border-[#00d4a1]/30"
              : "text-[#9aa3b0] hover:text-white hover:bg-white/5"
          }`}
        >
          <Icon icon="mdi:account-group" width={16} />
          <span>Traders & Setups</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full ${
              activeTab === "setups" ? "bg-[#00d4a1]/25 text-[#00d4a1]" : "bg-white/10 text-[#9aa3b0]"
            }`}
          >
            {setups.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("purchases")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "purchases"
              ? "bg-[#00d4a1]/15 text-[#00d4a1] border border-[#00d4a1]/30"
              : "text-[#9aa3b0] hover:text-white hover:bg-white/5"
          }`}
        >
          <Icon icon="mdi:chart-timeline-variant-shimmer" width={16} />
          <span>User Active Trades</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full ${
              activeTab === "purchases" ? "bg-[#00d4a1]/25 text-[#00d4a1]" : "bg-white/10 text-[#9aa3b0]"
            }`}
          >
            {purchases.length}
          </span>
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="rounded-xl sm:rounded-2xl p-3 sm:p-5" style={{ background: "linear-gradient(135deg, #151d2d 0%, #1b2a40 100%)", border: "1px solid #252f45" }}>
          <p className="text-[10px] sm:text-sm" style={{ color: "#9aa3b0" }}>Total Setups</p>
          <p className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-white mt-1">
            {isLoading ? "—" : setups.length}
          </p>
        </div>
        <div className="rounded-xl sm:rounded-2xl p-3 sm:p-5" style={{ background: "linear-gradient(135deg, #151d2d 0%, #1b2a40 100%)", border: "1px solid #252f45" }}>
          <p className="text-[10px] sm:text-sm" style={{ color: "#9aa3b0" }}>Total User Trades</p>
          <p className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-white mt-1">
            {purchasesLoading ? "—" : purchases.length}
          </p>
        </div>
        <div className="rounded-xl sm:rounded-2xl p-3 sm:p-5" style={{ background: "linear-gradient(135deg, #151d2d 0%, #1b2a40 100%)", border: "1px solid #252f45" }}>
          <p className="text-[10px] sm:text-sm" style={{ color: "#9aa3b0" }}>Total Invested</p>
          <p className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-[#00d4a1] mt-1">
            {purchasesLoading ? "—" : formatUSD(purchases.reduce((sum, p) => sum + (p.amountInvested || 0), 0))}
          </p>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "setups" ? (
        /* Setups List */
        <div className="rounded-2xl overflow-hidden" style={{ background: "#151d2d", border: "1px solid #252f45" }}>
          <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4" style={{ borderBottom: "1px solid #1d2639" }}>
          <h2 className="text-base sm:text-lg font-bold text-white">Available Copy Trade Setups</h2>
          {!isLoading && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0" style={{ background: "rgba(0,212,161,0.1)", color: "#00d4a1" }}>
              {setups.length} total
            </span>
          )}
        </div>

        {actionError && (
          <div className="flex items-start justify-between gap-3 mx-4 sm:mx-6 mt-4 rounded-xl px-4 py-3 text-xs font-medium" style={{ background: "rgba(244,67,54,0.1)", border: "1px solid rgba(244,67,54,0.3)", color: "#F44336" }}>
            <span>{actionError}</span>
            <button type="button" onClick={() => setActionError("")} className="shrink-0 hover:text-white transition-colors cursor-pointer" aria-label="Dismiss error">
              <Icon icon="mdi:close" width={16} />
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl p-5 animate-pulse" style={{ background: "#0d1624", border: "1px solid #1d2639" }}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 shrink-0" />
                  <div className="flex-1">
                    <div className="h-4 w-1/2 rounded bg-white/10" />
                    <div className="h-3 w-1/3 rounded bg-white/10 mt-2" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-5">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="h-12 rounded-xl bg-white/5" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="py-16 text-center">
            <Icon icon="mdi:alert-circle-outline" width={48} className="mx-auto" style={{ color: "#F44336" }} />
            <p className="text-sm font-medium mt-3 text-white">Could not load copy trade setups</p>
            <p className="text-xs mt-1" style={{ color: "#6b7785" }}>
              {error instanceof Error ? error.message : "Please try again."}
            </p>
          </div>
        ) : setups.length === 0 ? (
          <div className="py-16 text-center">
            <Icon icon="mdi:account-group-outline" width={48} className="mx-auto" style={{ color: "#6b7785" }} />
            <p className="text-sm font-medium mt-3 text-white">No copy trading setups yet</p>
            <p className="text-xs mt-1" style={{ color: "#4a5568" }}>
              Click &quot;Add Setup&quot; to create your first trader.
            </p>
          </div>
        ) : (
          <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {setups.map((setup) => {
              const risk = RISK_STYLES[setup.riskLevel] ?? RISK_STYLES.low;
              const isActive = setup.isActive !== false;
              return (
                <div
                  key={setup._id}
                  className="rounded-2xl overflow-hidden transition-colors"
                  style={{
                    background: "linear-gradient(180deg, #151d2d 0%, #0d1624 100%)",
                    border: `1px solid ${isActive ? "#252f45" : "#3a2020"}`,
                  }}
                >
                  {/* Header */}
                  <div className="p-4 sm:p-5 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                        style={{ background: risk.bg, color: risk.color, border: `1px solid ${risk.color}33` }}
                      >
                        {setup.traderName.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm sm:text-base font-semibold text-white truncate">{setup.traderName}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full capitalize" style={{ background: risk.bg, color: risk.color }}>
                            {setup.riskLevel} risk
                          </span>
                          <span className="text-[10px] sm:text-xs" style={{ color: "#6b7785" }}>{setup.duration}</span>
                        </div>
                      </div>
                    </div>
                    <span
                      className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full shrink-0"
                      style={{
                        background: isActive ? "rgba(0,212,161,0.12)" : "rgba(244,67,54,0.12)",
                        color: isActive ? "#00d4a1" : "#F44336",
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: isActive ? "#00d4a1" : "#F44336" }} />
                      {isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Metrics grid */}
                  <div className="grid grid-cols-2 xs:grid-cols-4 gap-px mx-4 sm:mx-5 rounded-xl overflow-hidden" style={{ background: "#1d2639" }}>
                    <div className="p-3" style={{ background: "#0d1624" }}>
                      <p className="text-[10px]" style={{ color: "#6b7785" }}>Win Rate</p>
                      <p className="text-sm font-bold mt-0.5" style={{ color: "#00d4a1" }}>{(setup.winrate ?? 0).toFixed(2)}%</p>
                    </div>
                    <div className="p-3" style={{ background: "#0d1624" }}>
                      <p className="text-[10px]" style={{ color: "#6b7785" }}>Leverage</p>
                      <p className="text-sm font-bold text-white mt-0.5">{setup.leverage ?? 1}x</p>
                    </div>
                    <div className="p-3" style={{ background: "#0d1624" }}>
                      <p className="text-[10px]" style={{ color: "#6b7785" }}>Fee</p>
                      <p className="text-sm font-bold mt-0.5" style={{ color: "#F5C518" }}>{setup.percentage}%</p>
                    </div>
                    <div className="p-3" style={{ background: "#0d1624" }}>
                      <p className="text-[10px]" style={{ color: "#6b7785" }}>Copies</p>
                      <p className="text-sm font-bold text-white mt-0.5">{setup.purchases.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 sm:p-5 flex items-stretch gap-2">
                    <button
                      onClick={() => toggleActive(setup)}
                      disabled={toggleMut.isPending}
                      className="flex-1 h-9 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                      style={{ background: "#0d1624", color: isActive ? "#9aa3b0" : "#00d4a1", border: "1px solid #252f45" }}
                    >
                      <Icon icon={isActive ? "mdi:pause" : "mdi:play"} width={14} />
                      {isActive ? "Pause" : "Activate"}
                    </button>
                    <button
                      onClick={() => openEdit(setup)}
                      className="flex-1 h-9 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                      style={{ background: "rgba(0,212,161,0.12)", color: "#00d4a1", border: "1px solid rgba(0,212,161,0.25)" }}
                    >
                      <Icon icon="mdi:pencil" width={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(setup._id)}
                      className="flex-1 h-9 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                      style={{ background: "rgba(244,67,54,0.12)", color: "#F44336", border: "1px solid rgba(244,67,54,0.25)" }}
                      aria-label="Delete setup"
                    >
                      <Icon icon="mdi:delete" width={14} />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    ) : (
        /* Active User Trades List */
        <div className="rounded-2xl overflow-hidden" style={{ background: "#151d2d", border: "1px solid #252f45" }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4" style={{ borderBottom: "1px solid #1d2639" }}>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">Active User Copy Trades</h2>
              <p className="text-xs" style={{ color: "#6b7785" }}>
                View all user copy trade purchases and edit their live profit (PnL)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={purchaseSearch}
                  onChange={(e) => setPurchaseSearch(e.target.value)}
                  placeholder="Search trader or user..."
                  className="pl-8 pr-3 py-1.5 rounded-xl text-xs bg-[#0d1624] border border-[#252f45] text-white focus:outline-none focus:border-[#00d4a1]"
                />
                <Icon icon="mdi:magnify" width={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6b7785]" />
              </div>
              <select
                value={purchaseStatusFilter}
                onChange={(e) => setPurchaseStatusFilter(e.target.value as "all" | "active" | "liquidated")}
                className="px-2.5 py-1.5 rounded-xl text-xs bg-[#0d1624] border border-[#252f45] text-white focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="liquidated">Liquidated</option>
              </select>
            </div>
          </div>

          { purchasesLoading ? (
            <div className="py-16 text-center">
              <Icon icon="mdi:loading" width={36} className="mx-auto animate-spin" style={{ color: "#00d4a1" }} />
              <p className="text-xs mt-2" style={{ color: "#6b7785" }}>Loading copy trade purchases...</p>
            </div>
          ) : purchasesError ? (
            <div className="py-16 text-center">
              <Icon icon="mdi:alert-circle-outline" width={44} className="mx-auto" style={{ color: "#F44336" }} />
              <p className="text-sm font-semibold text-white mt-2">Failed to load purchases</p>
              <p className="text-xs mt-1" style={{ color: "#6b7785" }}>
                {purchasesError instanceof Error ? purchasesError.message : "Please try again"}
              </p>
            </div>
          ) : filteredPurchases.length === 0 ? (
            <div className="py-16 text-center">
              <Icon icon="mdi:chart-timeline-variant" width={44} className="mx-auto" style={{ color: "#6b7785" }} />
              <p className="text-sm font-semibold text-white mt-2">No copy trade purchases found</p>
              <p className="text-xs mt-1" style={{ color: "#6b7785" }}>
                No user copy trades match the current filter.
              </p>
            </div>
          ) : (
            <div className="p-4 sm:p-5 space-y-3">
              {filteredPurchases.map((trade) => {
                const isActive = trade.status !== "liquidated";
                const pnl = trade.pnl ?? 0;
                const isProfitable = pnl >= 0;
                const userName =
                  typeof trade.userId === "object" && trade.userId !== null
                    ? `${trade.userId.firstName ?? ""} ${trade.userId.lastName ?? ""}`.trim() || trade.userId.email || trade.userId.userID || "User"
                    : `User ${String(trade.userId).slice(-6)}`;
                return (
                  <div
                    key={trade._id}
                    className="rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
                    style={{ background: "#0d1624", border: "1px solid #1d2639" }}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-extrabold shrink-0"
                        style={{ background: "rgba(0,212,161,0.12)", color: "#00d4a1" }}
                      >
                        {trade.traderName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm sm:text-base font-bold text-white truncate">
                            {trade.traderName}
                          </h3>
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{
                              background: isActive ? "rgba(76,175,80,0.15)" : "rgba(107,119,133,0.15)",
                              color: isActive ? "#4CAF50" : "#6b7785",
                            }}
                          >
                            {trade.status ?? "active"}
                          </span>
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: "#6b7785" }}>
                          User: <span className="text-white font-medium">{userName}</span> · {trade.duration} · {trade.percentage}% fee
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-5 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#1d2639]">
                      <div className="text-left md:text-right">
                        <p className="text-[10px]" style={{ color: "#6b7785" }}>Invested Amount</p>
                        <p className="text-sm font-bold text-white">{formatUSD(trade.amountInvested)}</p>
                      </div>

                      <div className="text-left md:text-right">
                        <p className="text-[10px]" style={{ color: "#6b7785" }}>Live Profit (PnL)</p>
                        <div className="flex items-center md:justify-end gap-1.5 mt-0.5">
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded"
                            style={{
                              background: isProfitable ? "rgba(0,212,161,0.15)" : "rgba(244,67,54,0.15)",
                              color: isProfitable ? "#00d4a1" : "#F44336",
                            }}
                          >
                            {isProfitable ? "+" : ""}{formatUSD(pnl)}
                          </span>
                          {trade.amountInvested > 0 && (
                            <span className="text-[10px] font-semibold" style={{ color: isProfitable ? "#00d4a1" : "#F44336" }}>
                              ({isProfitable ? "+" : ""}{((pnl / trade.amountInvested) * 100).toFixed(1)}%)
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => openPnlEdit(trade)}
                        className="px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                        style={{ background: "#00d4a1", color: "#0d1624" }}
                      >
                        <Icon icon="mdi:pencil" width={14} />
                        <span>Edit Live Profit</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/80" onClick={() => setShowModal(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] w-[95%] sm:w-[560px] max-h-[92vh] overflow-y-auto rounded-2xl"
            style={{ background: "#0d1624", border: "1px solid #252f45" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4" style={{ borderBottom: "1px solid #1d2639" }}>
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(0,212,161,0.12)", color: "#00d4a1" }}>
                  <Icon icon={editingId ? "mdi:pencil" : "mdi:rocket-launch"} width={16} />
                </span>
                <h2 className="text-base sm:text-lg font-bold text-white truncate">
                  {editingId ? "Edit Trader" : "Deploy New Trader"}
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg shrink-0 cursor-pointer hover:brightness-125 transition-all"
                style={{ background: "#151d2d" }}
                aria-label="Close"
              >
                <Icon icon="mdi:close" width={18} style={{ color: "#9aa3b0" }} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6">
              {/* ── Basic Information ── */}
              <div className="space-y-4">
                <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: "#00d4a1" }}>
                  Basic Information
                </p>

                <div>
                  <label className="text-xs font-semibold mb-2 block" style={{ color: "#9aa3b0" }}>Trader Name</label>
                  <input
                    value={formData.traderName}
                    onChange={(e) => setFormData(f => ({ ...f, traderName: e.target.value }))}
                    placeholder="e.g. AlphaKing"
                    className="w-full px-4 py-2.5 rounded-xl text-sm placeholder:text-[#4a5568]"
                    style={{ background: "#151d2d", border: `1px solid ${formErrors.traderName ? "#F44336" : "#252f45"}`, color: "white" }}
                  />
                  {formErrors.traderName && <p className="text-xs mt-1" style={{ color: "#F44336" }}>{formErrors.traderName}</p>}
                </div>

                <div>
                  <label className="text-xs font-semibold mb-2 block" style={{ color: "#9aa3b0" }}>Country Code</label>
                  <input
                    value={formData.countryCode}
                    maxLength={2}
                    onChange={(e) => setFormData(f => ({ ...f, countryCode: e.target.value.toUpperCase() }))}
                    placeholder="US"
                    className="w-full px-4 py-2.5 rounded-xl text-sm uppercase placeholder:text-[#4a5568]"
                    style={{ background: "#151d2d", border: "1px solid #252f45", color: "white" }}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold mb-2 block" style={{ color: "#9aa3b0" }}>Duration</label>
                  <input
                    value={durationValue}
                    onChange={(e) => setDurationValue(e.target.value)}
                    placeholder="30 days"
                    className="w-full px-4 py-2.5 rounded-xl text-sm placeholder:text-[#4a5568]"
                    style={{ background: "#151d2d", border: "1px solid #252f45", color: "white" }}
                  />
                </div>
              </div>

              {/* ── Trading Configuration ── */}
              <div className="space-y-4 pt-5" style={{ borderTop: "1px solid #1d2639" }}>
                <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: "#00d4a1" }}>
                  Trading Configuration
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold mb-2 block" style={{ color: "#9aa3b0" }}>Leverage</label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData(f => ({ ...f, leverage: Math.max(1, f.leverage - 1) }))}
                        className="w-9 h-10 rounded-lg font-bold shrink-0 cursor-pointer hover:brightness-125 transition-all"
                        style={{ background: "#151d2d", color: "#9aa3b0", border: "1px solid #252f45" }}
                        aria-label="Decrease leverage"
                      >−</button>
                      <input
                        type="number"
                        min="1"
                        value={formData.leverage}
                        onChange={(e) => setFormData(f => ({ ...f, leverage: Math.max(1, parseInt(e.target.value) || 1) }))}
                        className="flex-1 min-w-0 w-full px-3 py-2.5 rounded-xl text-sm text-center"
                        style={{ background: "#151d2d", border: "1px solid #252f45", color: "white" }}
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(f => ({ ...f, leverage: f.leverage + 1 }))}
                        className="w-9 h-10 rounded-lg font-bold shrink-0 cursor-pointer hover:brightness-125 transition-all"
                        style={{ background: "#151d2d", color: "#9aa3b0", border: "1px solid #252f45" }}
                        aria-label="Increase leverage"
                      >+</button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-2 block" style={{ color: "#9aa3b0" }}>Trade Percentage (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={formData.percentage}
                      onChange={(e) => setFormData(f => ({ ...f, percentage: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-4 py-2.5 rounded-xl text-sm"
                      style={{ background: "#151d2d", border: `1px solid ${formErrors.percentage ? "#F44336" : "#252f45"}`, color: "white" }}
                    />
                    {formErrors.percentage && <p className="text-xs mt-1" style={{ color: "#F44336" }}>{formErrors.percentage}</p>}
                  </div>
                </div>
              </div>

              {/* ── Performance History ── */}
              <div className="space-y-4 pt-5" style={{ borderTop: "1px solid #1d2639" }}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: "#00d4a1" }}>
                    Performance History (Last {TRADE_COUNT})
                  </p>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0" style={{ background: "rgba(0,212,161,0.12)", color: "#00d4a1" }}>
                    Win Rate: {Math.round((formData.trades.filter((t) => t > 0).length / TRADE_COUNT) * 100)}%
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {formData.trades.map((val, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl p-2.5"
                      style={{ background: "#151d2d", border: "1px solid #252f45" }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold" style={{ color: "#6b7785" }}>#{idx + 1}</span>
                        <Icon icon="mdi:trending-up" width={14} style={{ color: "#00d4a1" }} />
                      </div>
                      <div className="flex items-center justify-between gap-1">
                        <button
                          type="button"
                          onClick={() => setFormData(f => ({ ...f, trades: f.trades.map((t, i) => i === idx ? t - 1 : t) }))}
                          className="w-6 h-6 rounded-md text-xs font-bold shrink-0 cursor-pointer hover:brightness-125 transition-all"
                          style={{ background: "#0d1624", color: "#9aa3b0", border: "1px solid #252f45" }}
                          aria-label={`Decrease trade ${idx + 1}`}
                        >−</button>
                        <span className="text-xs font-bold text-white tabular-nums">{val}</span>
                        <button
                          type="button"
                          onClick={() => setFormData(f => ({ ...f, trades: f.trades.map((t, i) => i === idx ? t + 1 : t) }))}
                          className="w-6 h-6 rounded-md text-xs font-bold shrink-0 cursor-pointer hover:brightness-125 transition-all"
                          style={{ background: "#0d1624", color: "#9aa3b0", border: "1px solid #252f45" }}
                          aria-label={`Increase trade ${idx + 1}`}
                        >+</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {actionError && (
                <p className="text-xs font-medium" style={{ color: "#F44336" }}>{actionError}</p>
              )}

              {/* Deploy button */}
              <Button
                type="submit"
                disabled={createMut.isPending || updateMut.isPending}
                className="w-full py-3.5 rounded-xl font-black uppercase tracking-wider"
                style={{ background: "#00d4a1", color: "#0d1624" }}
              >
                {(createMut.isPending || updateMut.isPending)
                  ? "Deploying..."
                  : editingId ? "Save Trader" : "Deploy Trader to Dashboard"}
              </Button>
            </form>
          </div>
        </>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/80" onClick={() => setDeleteConfirm(null)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] w-[90%] max-w-sm rounded-2xl p-6"
            style={{ background: "#151d2d", border: "1px solid #252f45" }}
          >
            <h3 className="text-lg font-bold text-white mb-3">Delete Setup?</h3>
            <p className="text-sm text-penny-text-muted mb-5">
              This action cannot be undone. Users will no longer be able to copy this trader.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 rounded-xl font-bold"
                style={{ background: "#0d1624", color: "#9aa3b0", border: "1px solid #252f45" }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleteMut.isPending}
                className="flex-1 py-3 rounded-xl font-bold"
                style={{ background: "#F44336", color: "#fff" }}
              >
                {deleteMut.isPending ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Edit Live Profit (PnL) Modal */}
      {editingPnlPurchase && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/80" onClick={closePnlEdit} />
          <div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] w-[95%] sm:w-[420px] rounded-2xl p-5 sm:p-6"
            style={{ background: "#151d2d", border: "1px solid #252f45" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">Edit Live Profit (PnL)</h2>
                <p className="text-xs" style={{ color: "#6b7785" }}>
                  {editingPnlPurchase.traderName} · Invested: {formatUSD(editingPnlPurchase.amountInvested)}
                </p>
              </div>
              <button
                type="button"
                onClick={closePnlEdit}
                disabled={isSavingPnl}
                className="p-2 rounded-lg transition-colors cursor-pointer"
                style={{ background: "#0d1624" }}
              >
                <Icon icon="mdi:close" width={18} style={{ color: "#9aa3b0" }} />
              </button>
            </div>

            <form onSubmit={handleSavePnl} className="space-y-4">
              <div className="p-3 rounded-xl flex items-center justify-between" style={{ background: "#0d1624", border: "1px solid #252f45" }}>
                <span className="text-xs" style={{ color: "#6b7785" }}>Current PnL:</span>
                <span className="text-sm font-bold" style={{ color: (editingPnlPurchase.pnl ?? 0) >= 0 ? "#00d4a1" : "#F44336" }}>
                  {(editingPnlPurchase.pnl ?? 0) >= 0 ? "+" : ""}{formatUSD(editingPnlPurchase.pnl ?? 0)}
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] sm:text-xs font-semibold" style={{ color: "#6b7785" }}>
                  New PnL ($) <span className="font-normal">(positive or negative)</span>
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={pnlValue}
                  onChange={(e) => {
                    setPnlValue(e.target.value);
                    setPnlError("");
                  }}
                  placeholder="e.g. 150.00 or -25.50"
                  className="w-full px-4 py-2.5 rounded-xl text-sm"
                  style={{ background: "#0d1624", border: `1px solid ${pnlError ? "#F44336" : "#252f45"}`, color: "white" }}
                  autoFocus
                />
              </div>

              {pnlValue && !isNaN(parseFloat(pnlValue)) && editingPnlPurchase.amountInvested > 0 && (
                <div className="text-xs flex justify-between px-1" style={{ color: "#9aa3b0" }}>
                  <span>Return Rate:</span>
                  <span className="font-semibold" style={{ color: parseFloat(pnlValue) >= 0 ? "#00d4a1" : "#F44336" }}>
                    {parseFloat(pnlValue) >= 0 ? "+" : ""}
                    {((parseFloat(pnlValue) / editingPnlPurchase.amountInvested) * 100).toFixed(2)}%
                  </span>
                </div>
              )}

              {pnlError && (
                <div
                  className="flex items-start gap-2 p-3 rounded-xl text-xs"
                  style={{ background: "rgba(244,67,54,0.1)", border: "1px solid rgba(244,67,54,0.3)", color: "#F44336" }}
                >
                  <Icon icon="mdi:alert-circle" width={16} className="shrink-0 mt-0.5" />
                  <span>{pnlError}</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closePnlEdit}
                  disabled={isSavingPnl}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-colors cursor-pointer"
                  style={{ background: "#0d1624", color: "#9aa3b0", border: "1px solid #252f45" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingPnl}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  style={{ background: "#00d4a1", color: "#0d1624" }}
                >
                  {isSavingPnl ? (
                    <>
                      <Icon icon="mdi:loading" width={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save PnL"
                  )}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
