"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useCopyTrading } from "@/hooks/queries";
import { useCreateCopyTrade, useUpdateCopyTrade, useDeleteCopyTrade } from "@/hooks/queries/useAdminActions";
import { formatUSD } from "@/context/PortfolioContext";
import type { CreateCopyTradingPayload, RiskLevel } from "@/types/api";

const RISK_OPTIONS: RiskLevel[] = ["low", "medium", "high"];

export default function CopyTradingAdminPage() {
  const { data: setups = [], isLoading } = useCopyTrading();
  const createMut = useCreateCopyTrade();
  const updateMut = useUpdateCopyTrade();
  const deleteMut = useDeleteCopyTrade();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateCopyTradingPayload>({
    traderName: "",
    riskLevel: "low",
    rateOfChange: 0,
    duration: "7 days",
    averageDailyProfit: 0,
    purchases: 0,
    totalAssets: 0,
    copyTradePrice: 0,
    isActive: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const openAdd = () => {
    setEditingId(null);
    setFormData({
      traderName: "",
      riskLevel: "low",
      rateOfChange: 0,
      duration: "7 days",
      averageDailyProfit: 0,
      purchases: 0,
      totalAssets: 0,
      copyTradePrice: 0,
      isActive: true,
    });
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (setup: typeof setups[0]) => {
    setEditingId(setup._id);
    setFormData({
      traderName: setup.traderName,
      riskLevel: setup.riskLevel,
      rateOfChange: setup.rateOfChange,
      duration: setup.duration,
      averageDailyProfit: setup.averageDailyProfit,
      purchases: setup.purchases,
      totalAssets: setup.totalAssets,
      copyTradePrice: setup.copyTradePrice,
      isActive: setup.isActive ?? true,
    });
    setFormErrors({});
    setShowModal(true);
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!formData.traderName.trim()) errs.traderName = "Trader name is required";
    if (formData.copyTradePrice <= 0) errs.copyTradePrice = "Price must be greater than 0";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingId) {
      updateMut.mutate(
        { id: editingId, data: formData },
        { onSuccess: () => setShowModal(false) }
      );
    } else {
      createMut.mutate(formData, { onSuccess: () => setShowModal(false) });
    }
  };

  const handleDelete = (id: string) => {
    deleteMut.mutate(id, { onSuccess: () => setDeleteConfirm(null) });
  };

  const toggleActive = (setup: typeof setups[0]) => {
    updateMut.mutate({
      id: setup._id,
      data: { isActive: !(setup.isActive ?? true) },
    });
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
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
          <p className="text-[10px] sm:text-sm" style={{ color: "#9aa3b0" }}>Revenue</p>
          <p className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-white mt-1">
            {isLoading ? "—" : formatUSD(setups.reduce((sum, s) => sum + s.copyTradePrice * s.purchases, 0))}
          </p>
        </div>
      </div>

      {/* Setups List */}
      <div className="rounded-xxl sm:rounded-2xl overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4" style={{ borderBottom: "1px solid #1d2639" }}>
          <h2 className="text-base sm:text-lg font-bold text-white">Available Copy Trade Setups</h2>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-penny-text-muted">Loading...</div>
        ) : setups.length === 0 ? (
          <div className="py-16 text-center text-penny-text-muted">
            No copy trading setups. Click &quot;Add Setup&quot; to create one.
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "#1d2639" }}>
            {setups.map((setup) => (
              <div key={setup._id} className="p-4 sm:p-5">
                <Card className="mb-4" variant="default" padding="md">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3 sm:gap-4 flex-1">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                        style={{
                          background: setup.riskLevel === "low" ? "rgba(0,212,161,0.1)"
                            : setup.riskLevel === "medium" ? "rgba(245,197,24,0.1)"
                            : "rgba(244,67,54,0.1)",
                          color: setup.riskLevel === "low" ? "#00d4a1"
                            : setup.riskLevel === "medium" ? "#F5C518"
                            : "#F44336",
                        }}
                      >
                        {setup.traderName.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm sm:text-base font-semibold text-white">{setup.traderName}</h3>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full capitalize"
                            style={{
                              background: setup.riskLevel === "low" ? "rgba(0,212,161,0.1)"
                                : setup.riskLevel === "medium" ? "rgba(245,197,24,0.1)"
                                : "rgba(244,67,54,0.1)",
                              color: setup.riskLevel === "low" ? "#00d4a1"
                                : setup.riskLevel === "medium" ? "#F5C518"
                                : "#F44336",
                            }}
                          >
                            {setup.riskLevel}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 mt-1 flex-wrap">
                          <span className="text-[10px] sm:text-xs" style={{ color: "#6b7785" }}>
                            {setup.duration}
                          </span>
                          <span className="text-[10px] sm:text-xs" style={{ color: "#6b7785" }}>
                            Win: {setup.rateOfChange.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                      <div className="text-center">
                        <p className="text-[10px] sm:text-xs" style={{ color: "#6b7785" }}>Daily Profit</p>
                        <p className="text-sm sm:text-base lg:text-lg font-bold" style={{ color: "#00d4a1" }}>
                          {formatUSD(setup.averageDailyProfit)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] sm:text-xs" style={{ color: "#6b7785" }}>Price</p>
                        <p className="text-sm sm:text-base lg:text-lg font-bold" style={{ color: "#F5C518" }}>
                          {formatUSD(setup.copyTradePrice)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] sm:text-xs" style={{ color: "#6b7785" }}>Purchases</p>
                        <p className="text-sm sm:text-base font-bold text-white">{setup.purchases}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:ml-4">
                      <span
                        className="text-[10px] font-bold px-2 py-1 rounded-full"
                        style={{
                          background: setup.isActive !== false ? "rgba(0,212,161,0.12)" : "rgba(244,67,54,0.12)",
                          color: setup.isActive !== false ? "#00d4a1" : "#F44336",
                        }}
                      >
                        {setup.isActive !== false ? "Active" : "Inactive"}
                      </span>
                      <Button
                        onClick={() => toggleActive(setup)}
                        className="p-2 rounded-lg"
                        title={setup.isActive !== false ? "Deactivate" : "Activate"}
                        style={{ background: "#0d1624", color: setup.isActive !== false ? "#9aa3b0" : "#00d4a1" }}
                      >
                        <Icon icon={setup.isActive !== false ? "mdi:pause" : "mdi:play"} width={16} />
                      </Button>
                      <Button
                        onClick={() => openEdit(setup)}
                        className="p-2 rounded-lg"
                        style={{ background: "rgba(0,212,161,0.1)", color: "#00d4a1" }}
                      >
                        <Icon icon="mdi:pencil" width={16} />
                      </Button>
                      <Button
                        onClick={() => setDeleteConfirm(setup._id)}
                        className="p-2 rounded-lg"
                        style={{ background: "rgba(244,67,54,0.1)", color: "#F44336" }}
                        aria-label="Delete setup"
                      >
                        <Icon icon="mdi:delete" width={16} />
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <>
          <div className="fixed inset-0 z-50 bg-black/80" onClick={() => setShowModal(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[95%] sm:w-[500px] max-h-[90vh] overflow-y-auto rounded-2xl p-5 sm:p-6"
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
                  <label className="text-xs font-semibold mb-2 block" style={{ color: "#6b7785" }}>Copy Price ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.copyTradePrice}
                    onChange={(e) => setFormData(f => ({ ...f, copyTradePrice: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm"
                    style={{ background: "#0d1624", border: `1px solid ${formErrors.copyTradePrice ? "#F44336" : "#252f45"}`, color: "white" }}
                  />
                  {formErrors.copyTradePrice && <p className="text-xs mt-1" style={{ color: "#F44336" }}>{formErrors.copyTradePrice}</p>}
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
          <div className="fixed inset-0 z-50 bg-black/80" onClick={() => setDeleteConfirm(null)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-sm rounded-2xl p-6"
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
