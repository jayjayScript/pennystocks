"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { usePortfolio } from "@/context/PortfolioContext";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(amount);
}

export default function OrdersPage() {
  const { pendingOrders, approveOrder, rejectOrder, adminProvideDepositDetails } = usePortfolio();
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [expandedProofs, setExpandedProofs] = useState<Record<string, boolean>>({});
  const [depositInputs, setDepositInputs] = useState<Record<string, string>>({});

  const getDefaultPaymentDetails = (method?: string) => {
    switch (method?.toLowerCase()) {
      case "crypto (btc / usdt)":
      case "crypto":
        return "USDT TRC20 Wallet: 0x71C7656EC7ab88b098defB751B7401B5f6d8976F";
      case "cash app":
        return "Cash App $Cashtag: $PennyStocksGlobal";
      case "paypal":
        return "PayPal Email: payments@pennystocks.com";
      case "venmo":
        return "Venmo Handle: @PennyStocks-Pay";
      case "zelle":
        return "Zelle: zelle@pennystocks.com";
      case "wire transfer":
        return "Bank: JPMorgan Chase | Swift: CHASUS33 | Acct: 9876543210";
      case "bank transfer":
        return "Bank of America | Acct: 4400-8812-9901 | Name: PennyStocks LLC";
      default:
        return "Account Details: 0x71C7656EC7ab88b098defB751B7401B5f6d8976F";
    }
  };

  const handleSendDetails = (id: string, defaultMethod?: string) => {
    const details = depositInputs[id] || getDefaultPaymentDetails(defaultMethod);
    const result = adminProvideDepositDetails(id, details);
    setFeedback((prev) => ({ ...prev, [id]: result.message }));
  };

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
                        {order.paymentMethod && (
                          <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-md bg-[#00d4a1]/15 text-[#00d4a1]">
                            {order.paymentMethod}
                          </span>
                        )}
                        {order.type === "deposit" && order.depositStep && (
                          <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400">
                            {order.depositStep === "awaiting_admin_details" && "Step 1: Awaiting Admin Details"}
                            {order.depositStep === "awaiting_user_proof" && "Step 2: Details Sent (Awaiting User Proof)"}
                            {order.depositStep === "pending_approval" && "Step 3: Proof Uploaded (Ready for Approval)"}
                            {order.depositStep === "completed" && "Completed"}
                            {order.depositStep === "rejected" && "Rejected"}
                          </span>
                        )}
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

                {/* Admin Provided Payment Details */}
                {order.adminPaymentDetails && (
                  <div className="mt-3 p-3 rounded-xl bg-[#00d4a1]/10 border border-[#00d4a1]/30 text-xs">
                    <span className="font-semibold text-[#00d4a1]">Payment Details Sent to User: </span>
                    <span className="text-white font-mono">{order.adminPaymentDetails}</span>
                  </div>
                )}

                {/* Payment Details Response Section (Admin sends account details for Deposit or Buy orders) */}
                {((order.type === "deposit" && order.depositStep === "awaiting_admin_details") || order.type === "buy") && order.status === "pending" && (
                  <div className="mt-4 p-3.5 rounded-xl bg-[#0d1624] border border-[#252f45] space-y-2">
                    <label className="block text-xs font-semibold text-white">
                      {order.adminPaymentDetails ? `Update Payment Details for User (${order.paymentMethod || order.symbol})` : `Provide Payment / Account Details for User (${order.paymentMethod || order.symbol})`}
                    </label>
                    <input
                      type="text"
                      value={depositInputs[order.id] !== undefined ? depositInputs[order.id] : (order.adminPaymentDetails || getDefaultPaymentDetails(order.paymentMethod))}
                      onChange={(e) => setDepositInputs((prev) => ({ ...prev, [order.id]: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg text-xs bg-[#141e30] border border-[#252f45] text-white focus:outline-none focus:border-[#00d4a1]"
                      placeholder="e.g. Wallet address, $Cashtag, Bank Account #"
                    />
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleSendDetails(order.id, order.paymentMethod)}
                        className="px-4 py-2 rounded-lg font-bold text-xs bg-[#00d4a1] text-[#0d1624] hover:opacity-90 transition-all flex items-center gap-1.5"
                      >
                        <Icon icon="mdi:send" width={14} />
                        {order.adminPaymentDetails ? "Update Payment Details" : "Send Payment Details to User"}
                      </button>
                      {order.type === "deposit" && (
                        <button
                          onClick={() => handleReject(order.id)}
                          className="px-3 py-2 rounded-lg font-semibold text-xs bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 transition-all"
                        >
                          Reject Request
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 2 (Deposit): Admin waiting for user to upload proof */}
                {order.type === "deposit" && order.status === "pending" && order.depositStep === "awaiting_user_proof" && (
                  <div className="mt-4 p-3.5 rounded-xl border border-amber-500/30 space-y-2" style={{ background: "rgba(245,197,24,0.07)" }}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(245,197,24,0.2)" }}>
                        <Icon icon="mdi:clock-outline" width={16} style={{ color: "#F5C518" }} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-amber-400">Payment Details Sent — Awaiting User Proof</p>
                        <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: "#9aa3b0" }}>
                          Waiting for the user to make their payment and upload a screenshot as proof.
                        </p>
                      </div>
                    </div>
                    {order.adminPaymentDetails && (
                      <p className="text-[11px] font-mono text-white px-2.5 py-2 rounded-lg border border-white/10 break-all" style={{ background: "rgba(0,0,0,0.3)" }}>
                        <span className="text-amber-400 font-semibold not-font-mono">Details sent: </span>{order.adminPaymentDetails}
                      </p>
                    )}
                  </div>
                )}

                {/* STEP 3 (Deposit): Proof uploaded — show image prominently and prompt admin to review */}
                {order.type === "deposit" && order.status === "pending" && order.depositStep === "pending_approval" && (
                  <div className="mt-4 p-3.5 rounded-xl border border-[#00d4a1]/30 space-y-3" style={{ background: "rgba(0,212,161,0.07)" }}>
                    <div className="flex items-center gap-2">
                      <Icon icon="mdi:file-image-outline" width={16} style={{ color: "#00d4a1" }} />
                      <p className="text-xs font-bold text-[#00d4a1]">User Uploaded Proof — Review & Approve Below</p>
                    </div>
                    {order.proofImageUrl && (
                      <div className="rounded-xl overflow-hidden border border-[#252f45] bg-[#0d1624] max-w-xs">
                        <img src={order.proofImageUrl} alt="Transaction Proof" className="w-full h-auto max-h-64 object-contain mx-auto" />
                      </div>
                    )}
                    {order.note && (
                      <p className="text-[11px]" style={{ color: "#9aa3b0" }}>
                        <span className="text-white font-semibold">User note: </span>{order.note}
                      </p>
                    )}
                  </div>
                )}

                {/* Proof Image expander (for non-deposit orders only, e.g. sell orders) */}
                {order.proofImageUrl && order.type !== "deposit" && (
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
                  <p className="text-xs sm:text-sm mt-3" style={{ color: feedback[order.id]?.toLowerCase().includes("sent") || feedback[order.id]?.toLowerCase().includes("approv") || feedback[order.id]?.toLowerCase().includes("credit") ? "#4CAF50" : "#F44336" }}>{feedback[order.id]}</p>
                )}

                {/* Standard Actions (Approve / Reject) for Buy, Sell, Withdraw or Deposit step 2/3 */}
                {order.status === "pending" && (order.type !== "deposit" || order.depositStep !== "awaiting_admin_details") && (
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