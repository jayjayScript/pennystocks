"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { usePortfolio } from "@/context/PortfolioContext";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(amount);
}

export default function OrdersPage() {
  const { pendingOrders, approveOrder, rejectOrder } = usePortfolio();
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [expandedProofs, setExpandedProofs] = useState<Record<string, boolean>>({});

  const handleApprove = (id: string) => {
    const result = approveOrder(id);
    setFeedback((prev) => ({ ...prev, [id]: result.message }));
  };

  const handleReject = (id: string) => {
    rejectOrder(id);
    setFeedback((prev) => ({ ...prev, [id]: "Order rejected" }));
  };

  const toggleProof = (id: string) => {
    setExpandedProofs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const pendingCount = pendingOrders.filter((o) => o.status === "pending").length;

  const getTypeStyles = (type: Order["type"]) => {
    switch (type) {
      case "buy":
        return { color: "#00d4a1", bg: "rgba(0,212,161,0.1)", label: "BUY", icon: "mdi:arrow-down-left" };
      case "sell":
        return { color: "#F44336", bg: "rgba(244,67,54,0.1)", label: "SELL", icon: "mdi:arrow-up-right" };
      case "deposit":
        return { color: "#4CAF50", bg: "rgba(76,175,80,0.1)", label: "DEPOSIT", icon: "mdi:arrow-down" };
      case "withdraw":
        return { color: "#FF9800", bg: "rgba(255,152,0,0.1)", label: "WITHDRAW", icon: "mdi:arrow-up" };
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Orders</h1>
          <p className="text-xs sm:text-sm mt-1" style={{ color: "#9aa3b0" }}>Manage buy, sell, deposit, and withdrawal requests</p>
        </div>
        <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl" style={{ background: "rgba(245,197,24,0.12)" }}>
          <Icon icon="mdi:clock-outline" width={16} className="sm:w-[18px]" style={{ color: "#F5C518" }} />
          <span className="text-xs sm:text-sm font-semibold" style={{ color: "#F5C518" }}>{pendingCount} Pending</span>
        </div>
      </div>

      {pendingOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 sm:py-20 rounded-xl sm:rounded-2xl" style={{ background: "#151d2d", border: "1px dashed #252f45" }}>
          <Icon icon="mdi:clipboard-check-outline" width={48} className="sm:w-16 sm:h-16" style={{ color: "#6b7785" }} />
          <p className="text-base sm:text-lg font-semibold text-white mt-4">No orders yet</p>
          <p className="text-xs sm:text-sm" style={{ color: "#9aa3b0" }}>Transactions and order requests will appear here</p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {pendingOrders.map((order) => {
            const styles = getTypeStyles(order.type);
            const isBuyOrDeposit = order.type === "buy" || order.type === "deposit";

            return (
              <div key={order.id} className="rounded-xl sm:rounded-2xl p-4 sm:p-5" style={{ background: "#151d2d", border: "1px solid #252f45" }}>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center bg-white/5" style={{ color: styles.color }}>
                      <Icon icon={order.icon || styles.icon} width={20} className="sm:w-6 sm:h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full" style={{ background: styles.bg, color: styles.color }}>{styles.label}</span>
                        <span className="text-sm sm:text-base text-white font-bold">{order.symbol}</span>
                        <span className="text-xs sm:text-sm hidden sm:inline" style={{ color: "#9aa3b0" }}>{order.name}</span>
                      </div>
                      <p className="text-[10px] sm:text-xs mt-1" style={{ color: "#6b7785" }}>{new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] sm:text-sm" style={{ color: "#9aa3b0" }}>{isBuyOrDeposit ? "Total Cost" : "Net Receive"}</p>
                    <p className="text-base sm:text-lg font-bold" style={{ color: isBuyOrDeposit ? "#00d4a1" : "#4CAF50" }}>{formatCurrency(isBuyOrDeposit ? order.totalCost : order.netReceive)}</p>
                  </div>
                </div>

                {/* Details Grid - 2 cols on mobile, 4 on sm+ */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mt-4 p-3 sm:p-4 rounded-xl" style={{ background: "#0d1624", border: "1px solid #1d2639" }}>
                  <div>
                    <p className="text-[10px] sm:text-xs" style={{ color: "#6b7785" }}>Units</p>
                    <p className="text-xs sm:text-sm font-semibold text-white">{parseFloat(order.units.toFixed(6))}</p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs" style={{ color: "#6b7785" }}>Price</p>
                    <p className="text-xs sm:text-sm font-semibold text-white">${order.stockPrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs" style={{ color: "#6b7785" }}>Fee (0.1%)</p>
                    <p className="text-xs sm:text-sm font-semibold" style={{ color: "#F5C518" }}>${order.fee.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs" style={{ color: "#6b7785" }}>Amount</p>
                    <p className="text-xs sm:text-sm font-semibold text-white">${order.usdAmount.toFixed(2)}</p>
                  </div>
                </div>

                {/* User Note */}
                {order.note && (
                  <div className="mt-3 p-3 rounded-xl bg-[#0d1624]/60 border border-[#1d2639] text-xs text-penny-text-muted">
                    <span className="font-semibold text-white">Reference details: </span>
                    {order.note}
                  </div>
                )}

                {/* Proof Image expander */}
                {order.proofImageUrl && (
                  <div className="mt-3">
                    <button
                      onClick={() => toggleProof(order.id)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-penny-text-muted hover:text-white transition-colors"
                    >
                      <Icon icon={expandedProofs[order.id] ? "mdi:eye-off-outline" : "mdi:eye-outline"} width={16} />
                      {expandedProofs[order.id] ? "Hide Uploaded Proof" : "View Uploaded Proof"}
                    </button>
                    {expandedProofs[order.id] && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-[#252f45] max-w-sm bg-[#0d1624]">
                        <img src={order.proofImageUrl} alt="Transaction Proof" className="w-full h-auto max-h-60 object-contain mx-auto" />
                      </div>
                    )}
                  </div>
                )}

                {/* Feedback */}
                {feedback[order.id] && (
                  <p className="text-xs sm:text-sm mt-3" style={{ color: order.status === "approved" ? "#4CAF50" : "#F44336" }}>{feedback[order.id]}</p>
                )}

                {/* Actions */}
                {order.status === "pending" && (
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => handleApprove(order.id)}
                      className="flex-1 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all hover:-translate-y-0.5 active:scale-95"
                      style={{ background: "rgba(76,175,80,0.15)", color: "#4CAF50", border: "1px solid rgba(76,175,80,0.3)" }}
                    >
                      <Icon icon="mdi:check" width={14} className="sm:w-4 sm:h-4 inline mr-1 sm:mr-1.5" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(order.id)}
                      className="flex-1 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all hover:-translate-y-0.5 active:scale-95"
                      style={{ background: "rgba(244,67,54,0.1)", color: "#F44336", border: "1px solid rgba(244,67,54,0.25)" }}
                    >
                      <Icon icon="mdi:close" width={14} className="sm:w-4 sm:h-4 inline mr-1 sm:mr-1.5" />
                      Reject
                    </button>
                  </div>
                )}

                {order.status !== "pending" && (
                  <div className="mt-4 text-center">
                    <span className="text-xs sm:text-sm font-bold px-4 sm:px-6 py-1.5 sm:py-2 rounded-full" style={{ background: order.status === "approved" ? "rgba(76,175,80,0.12)" : "rgba(244,67,54,0.12)", color: order.status === "approved" ? "#4CAF50" : "#F44336" }}>
                      {order.status === "approved" ? "✓ Approved" : "✕ Rejected"}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}