"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";
import { useCopyTrading } from "@/hooks/queries";
import {
  useCreateCopyTrade,
  useUpdateCopyTrade,
  useDeleteCopyTrade,
} from "@/hooks/queries/useAdminActions";
import type { CopyTrading, CreateCopyTradingPayload, RiskLevel } from "@/types/api";

const formatUSD = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

const RISK_OPTIONS: RiskLevel[] = ["low", "medium", "high"];

const RISK_STYLES: Record<RiskLevel, { bg: string; color: string }> = {
  low: { bg: "rgba(0,212,161,0.1)", color: "#00d4a1" },
  medium: { bg: "rgba(245,197,24,0.1)", color: "#F5C518" },
  high: { bg: "rgba(244,67,54,0.1)", color: "#F44336" },
};

const emptyForm = (): CreateCopyTradingPayload => ({
  traderName: "",
  riskLevel: "low",
  rateOfChange: 0,
  duration: "7 days",
  averageDailyProfit: 0,
  purchases: 0,
  totalAssets: 0,
  percentage: 0,
  copyTradePrice: 0,
});

export default function CopyTradingAdminPage() {
  const { data: setupsData, isLoading, error } = useCopyTrading();
  const setups: CopyTrading[] = Array.isArray(setupsData)
    ? setupsData
    : ((setupsData as unknown as { data?: CopyTrading[] })?.data ?? []);

  const createMut = useCreateCopyTrade();
  const updateMut = useUpdateCopyTrade();
  const deleteMut = useDeleteCopyTrade();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateCopyTradingPayload>(emptyForm());
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
    setFormData({
      traderName: setup.traderName,
      riskLevel: setup.riskLevel,
      rateOfChange: setup.rateOfChange,
      duration: setup.duration,
      averageDailyProfit: setup.averageDailyProfit,
      purchases: setup.purchases,
      totalAssets: setup.totalAssets,
      percentage: setup.percentage,
      copyTradePrice: setup.copyTradePrice,
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
    try {
      if (editingId) {
        await updateMut.mutateAsync({ id: editingId, data: formData });
      } else {
        await createMut.mutateAsync(formData);
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
      // The backend PATCH /copy-trading/:id endpoint does NOT accept `isActive`.
      // Instead, we update a non-isActive field as a no-op workaround while
      // toggling the local cache optimistically, OR the backend may expose a
      // separate activate/deactivate endpoint in the future.
      // For now, surface a clear error so the developer knows.
      setActionError(
        `The backend does not support toggling active status via the PATCH endpoint (isActive is not an accepted field). ` +
        `Ask the backend developer to add a dedicated PATCH /copy-trading/${setup._id}/toggle-active endpoint.`
      );
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to update setup.");
    }
  };

  return (
    <div className="px-0 py-4 sm:px-1 sm:py-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Copy Trading</h1>
          <p className="text-xs sm:text-sm mt-1" style={{ color: "#9aa3b0" }}>
            {isLoading ? "Loading..." : `${setups.length} setups`}
          </p>
        </div>
        <Button
          onClick={openAdd}
          className="flex items-center gap-2"
          style={{ background: "#00d4a1", color: "#0d1624" }}
        >
          <Icon icon="mdi:plus" width={16} />
          Add Setup
        </Button>
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
          <p className="text-[10px] sm:text-sm" style={{ color: "#9aa3b0" }}>Active Copies</p>
          <p className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-white mt-1">
            {isLoading ? "—" : setups.reduce((sum, s) => sum + s.purchases, 0)}
          </p>
        </div>
        <div className="rounded-xl sm:rounded-2xl p-3 sm:p-5" style={{ background: "linear-gradient(135deg, #151d2d 0%, #1b2a40 100%)", border: "1px solid #252f45" }}>
          <p className="text-[10px] sm:text-sm" style={{ color: "#9aa3b0" }}>Average Fee</p>
          <p className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-white mt-1">
            {isLoading ? "—" : `${(setups.reduce((sum, s) => sum + s.percentage, 0) / Math.max(setups.length, 1)).toFixed(2)}%`}
          </p>
        </div>
      </div>

      {/* Setups List */}
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
                      <p className="text-sm font-bold mt-0.5" style={{ color: "#00d4a1" }}>{setup.rateOfChange.toFixed(2)}%</p>
                    </div>
                    <div className="p-3" style={{ background: "#0d1624" }}>
                      <p className="text-[10px]" style={{ color: "#6b7785" }}>Daily Profit</p>
                      <p className="text-sm font-bold text-white mt-0.5">{formatUSD(setup.averageDailyProfit)}</p>
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
                      disabled={updateMut.isPending}
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

      {/* Add/Edit Modal */}
      {showModal && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/80" onClick={() => setShowModal(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] w-[95%] sm:w-125 max-h-[90vh] overflow-y-auto rounded-2xl p-5 sm:p-6"
            style={{ background: "#151d2d", border: "1px solid #252f45" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">
                {editingId ? "Edit" : "Add"} Copy Trade Setup
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg"
                style={{ background: "#0d1624" }}
              >
                <Icon icon="mdi:close" width={18} style={{ color: "#9aa3b0" }} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold mb-2 block" style={{ color: "#6b7785" }}>Trader Name</label>
                <input
                  value={formData.traderName}
                  onChange={(e) => setFormData(f => ({ ...f, traderName: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm"
                  style={{ background: "#0d1624", border: `1px solid ${formErrors.traderName ? "#F44336" : "#252f45"}`, color: "white" }}
                />
                {formErrors.traderName && <p className="text-xs mt-1" style={{ color: "#F44336" }}>{formErrors.traderName}</p>}
              </div>

              <div>
                <label className="text-xs font-semibold mb-2 block" style={{ color: "#6b7785" }}>Risk Level</label>
                <div className="flex gap-2">
                  {RISK_OPTIONS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setFormData(f => ({ ...f, riskLevel: r }))}
                      className="flex-1 py-2 rounded-xl text-xs font-semibold capitalize"
                      style={{
                        background: formData.riskLevel === r
                          ? r === "low" ? "rgba(0,212,161,0.2)" : r === "medium" ? "rgba(245,197,24,0.2)" : "rgba(244,67,54,0.2)"
                          : "#0d1624",
                        color: formData.riskLevel === r
                          ? r === "low" ? "#00d4a1" : r === "medium" ? "#F5C518" : "#F44336"
                          : "#9aa3b0",
                        border: `1px solid ${formData.riskLevel === r ? "transparent" : "#252f45"}`,
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold mb-2 block" style={{ color: "#6b7785" }}>Liquidation Fee (%)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    max="100"
                    value={formData.percentage}
                    onChange={(e) => setFormData(f => ({ ...f, percentage: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm"
                    style={{ background: "#0d1624", border: `1px solid ${formErrors.percentage ? "#F44336" : "#252f45"}`, color: "white" }}
                  />
                  {formErrors.percentage && <p className="text-xs mt-1" style={{ color: "#F44336" }}>{formErrors.percentage}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold mb-2 block" style={{ color: "#6b7785" }}>Avg Daily Profit ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.averageDailyProfit}
                    onChange={(e) => setFormData(f => ({ ...f, averageDailyProfit: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm"
                    style={{ background: "#0d1624", border: "1px solid #252f45", color: "white" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold mb-2 block" style={{ color: "#6b7785" }}>Win Rate / ROC (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.rateOfChange}
                    onChange={(e) => setFormData(f => ({ ...f, rateOfChange: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm"
                    style={{ background: "#0d1624", border: "1px solid #252f45", color: "white" }}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold mb-2 block" style={{ color: "#6b7785" }}>Duration</label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData(f => ({ ...f, duration: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm"
                    style={{ background: "#0d1624", border: "1px solid #252f45", color: "white" }}
                  >
                    <option value="7 days">7 days</option>
                    <option value="14 days">14 days</option>
                    <option value="30 days">30 days</option>
                    <option value="90 days">90 days</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl font-bold"
                  style={{ background: "#0d1624", color: "#9aa3b0", border: "1px solid #252f45" }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMut.isPending || updateMut.isPending}
                  className="flex-1 py-3 rounded-xl font-bold"
                  style={{ background: "#00d4a1", color: "#0d1624" }}
                >
                  {(createMut.isPending || updateMut.isPending) ? "Saving..." : (editingId ? "Update" : "Add") + " Setup"}
                </Button>
              </div>
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
    </div>
  );
}
