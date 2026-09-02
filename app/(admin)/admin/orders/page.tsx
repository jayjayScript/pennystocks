"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useAdminPaymentOrders } from "@/hooks/queries/useAdminPaymentOrders";
import { useSendDepositDetails, useApprovePaymentOrder, useRejectPaymentOrder } from "@/hooks/queries/useAdminActions";
import { formatUSD } from "@/context/PortfolioContext";
import type { PaymentOrder } from "@/types/api";

type TabKey = "all" | "awaiting_details" | "awaiting_proof" | "completed" | "rejected";

function tabForOrder(order: PaymentOrder): TabKey {
  if (order.status === "completed") return "completed";
  if (order.status === "rejected" || order.status === "expired") return "rejected";
  if (order.type === "deposit") {
    if (order.proofPaymentDocument) return "awaiting_proof";
    if (order.methodDetails || order.isMethodIncluded) return "awaiting_proof";
    return "awaiting_details";
  }
  // withdraws go straight to awaiting_proof (user provided wallet already)
  return "awaiting_proof";
}

function statusBadgeStyles(status: PaymentOrder["status"]) {
  switch (status) {
    case "completed":
      return { bg: "rgba(76,175,80,0.15)", color: "#4CAF50", border: "rgba(76,175,80,0.3)", label: "Completed" };
    case "rejected":
      return { bg: "rgba(244,67,54,0.15)", color: "#F44336", border: "rgba(244,67,54,0.3)", label: "Rejected" };
    case "expired":
      return { bg: "rgba(107,119,133,0.15)", color: "#9aa3b0", border: "rgba(107,119,133,0.3)", label: "Expired" };
    case "awaiting_payment":
      return { bg: "rgba(245,197,24,0.15)", color: "#F5C518", border: "rgba(245,197,24,0.3)", label: "Awaiting Payment" };
    case "awaiting_confirmation":
      return { bg: "rgba(33,150,243,0.15)", color: "#2196F3", border: "rgba(33,150,243,0.3)", label: "Under Review" };
    default:
      return { bg: "rgba(245,197,24,0.15)", color: "#F5C518", border: "rgba(245,197,24,0.3)", label: "Pending" };
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function OrdersPage() {
  const { data: orders = [], isLoading } = useAdminPaymentOrders();
  const sendDetails = useSendDepositDetails();
  const approve = useApprovePaymentOrder();
  const reject = useRejectPaymentOrder();

  const [activeTab, setActiveTab] = useState<TabKey>("awaiting_details");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [detailsDraft, setDetailsDraft] = useState<Record<string, string>>({});

  // Auto-select the most useful tab once data arrives
  useEffect(() => {
    if (orders.length === 0) return;
    if (activeTab !== "all") return;
    const hasAwaiting = orders.some((o) => tabForOrder(o) === "awaiting_details");
    if (hasAwaiting) setActiveTab("awaiting_details");
  }, [orders, activeTab]);

  const filtered = orders.filter((o) => activeTab === "all" || tabForOrder(o) === activeTab);

  const counts = {
    awaiting_details: orders.filter((o) => tabForOrder(o) === "awaiting_details").length,
    awaiting_proof: orders.filter((o) => tabForOrder(o) === "awaiting_proof").length,
    completed: orders.filter((o) => tabForOrder(o) === "completed").length,
    rejected: orders.filter((o) => tabForOrder(o) === "rejected").length,
  };

  const tabs: { key: TabKey; label: string; color: string }[] = [
    { key: "awaiting_details", label: "Awaiting Details", color: "#F5C518" },
    { key: "awaiting_proof", label: "Awaiting Proof", color: "#2196F3" },
    { key: "completed", label: "Completed", color: "#4CAF50" },
    { key: "rejected", label: "Rejected", color: "#F44336" },
    { key: "all", label: "All", color: "#9aa3b0" },
  ];

  const handleSendDetails = async (id: string) => {
    const text = detailsDraft[id]?.trim();
    if (!text) return;
    await sendDetails.mutateAsync({ id, methodDetails: text });
    setEditingId(null);
    setDetailsDraft((d) => ({ ...d, [id]: "" }));
  };

  const handleApprove = (id: string) => approve.mutate(id);
  const handleReject = (id: string) => reject.mutate(id);

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Payment Orders</h1>
        <p className="text-xs sm:text-sm mt-1" style={{ color: "#9aa3b0" }}>
          Manage deposits and withdrawals — send payment details, review proof, and approve or reject.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const count = tab.key === "all" ? orders.length : counts[tab.key as keyof typeof counts];
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="shrink-0 px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2"
              style={{
                background: isActive ? `${tab.color}22` : "#151d2d",
                color: isActive ? tab.color : "#9aa3b0",
                border: `1px solid ${isActive ? `${tab.color}44` : "#252f45"}`,
              }}
            >
              {tab.label}
              {count > 0 && (
                <span
                  className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                  style={{
                    background: isActive ? `${tab.color}33` : "#252f45",
                    color: isActive ? tab.color : "#9aa3b0",
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="py-16 text-center" style={{ color: "#6b7785" }}>Loading orders...</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl" style={{ background: "#151d2d", border: "1px dashed #252f45" }}>
          <Icon icon="mdi:inbox-outline" width={48} className="mb-3" style={{ color: "#6b7785" }} />
          <p className="text-sm font-semibold text-white">No orders here</p>
          <p className="text-xs mt-1" style={{ color: "#6b7785" }}>Nothing in this state right now.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => {
            const tab = tabForOrder(order);
            const isDeposit = order.type === "deposit";
            const isClosed = order.status === "completed" || order.status === "rejected" || order.status === "expired";
            const badge = statusBadgeStyles(order.status);
            const isEditing = editingId === order._id;

            return (
              <div key={order._id} className="rounded-2xl p-4 sm:p-5" style={{ background: "#151d2d", border: "1px solid #252f45" }}>
                {/* Header row */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: isDeposit ? "rgba(0,212,161,0.12)" : "rgba(245,197,24,0.12)" }}
                    >
                      <Icon
                        icon={isDeposit ? "mdi:arrow-down-bold" : "mdi:arrow-up-bold"}
                        width={22}
                        style={{ color: isDeposit ? "#00d4a1" : "#F5C518" }}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full uppercase"
                          style={{
                            background: isDeposit ? "rgba(0,212,161,0.15)" : "rgba(245,197,24,0.15)",
                            color: isDeposit ? "#00d4a1" : "#F5C518",
                          }}
                        >
                          {order.type}
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-white">{order.method}</span>
                        <span
                          className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}
                        >
                          {badge.label}
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-xs mt-1" style={{ color: "#6b7785" }}>
                        {order.email} · {order.orderID} · {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] sm:text-xs" style={{ color: "#9aa3b0" }}>
                      {isDeposit ? "Deposit Amount" : "Withdraw Amount"}
                    </p>
                    <p className="text-lg sm:text-xl font-extrabold text-white">{formatUSD(order.amount)}</p>
                  </div>
                </div>

                {/* User note (deposit request) */}
                {isDeposit && order.suggestedMethod && order.suggestedMethod !== order.method && (
                  <div className="mt-3 p-2.5 rounded-lg text-xs" style={{ background: "#0d1624", color: "#9aa3b0" }}>
                    <span className="font-semibold text-white">User preferred:</span> {order.suggestedMethod}
                  </div>
                )}

                {/* Withdraw wallet address */}
                {!isDeposit && order.methodDetails && (
                  <div className="mt-3 p-2.5 rounded-lg text-xs font-mono break-all" style={{ background: "#0d1624", color: "#fff" }}>
                    <span className="text-penny-text-muted text-[10px] font-sans font-semibold block mb-1">User wallet:</span>
                    {order.methodDetails}
                  </div>
                )}

                {/* Proof image (if user uploaded) */}
                {order.proofPaymentDocument && (
                  <div className="mt-3">
                    <p className="text-[10px] font-semibold mb-1.5" style={{ color: "#6b7785" }}>Payment proof</p>
                    <a href={order.proofPaymentDocument} target="_blank" rel="noreferrer" className="inline-block">
                      <img
                        src={order.proofPaymentDocument}
                        alt="Payment proof"
                        className="w-44 h-28 object-cover rounded-xl border hover:opacity-80 transition-opacity"
                        style={{ borderColor: "#252f45" }}
                      />
                    </a>
                  </div>
                )}

                {/* Already-sent details (read-only display) */}
                {isDeposit && tab === "awaiting_proof" && order.methodDetails && !isEditing && (
                  <div className="mt-3 p-3 rounded-xl text-xs" style={{ background: "rgba(0,212,161,0.08)", border: "1px solid rgba(0,212,161,0.2)" }}>
                    <p className="text-[10px] font-semibold mb-1" style={{ color: "#00d4a1" }}>Details sent to user</p>
                    <p className="font-mono text-white break-all whitespace-pre-wrap">{order.methodDetails}</p>
                  </div>
                )}

                {/* Action area */}
                {!isClosed && (
                  <div className="mt-4 space-y-3">
                    {/* Deposit awaiting details — send details form */}
                    {isDeposit && tab === "awaiting_details" && (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          value={detailsDraft[order._id] ?? ""}
                          onChange={(e) => setDetailsDraft((d) => ({ ...d, [order._id]: e.target.value }))}
                          placeholder="Send account / wallet / payment details to user…"
                          className="flex-1 px-3 py-2.5 rounded-xl text-xs bg-[#0d1624] border text-white focus:outline-none focus:border-[#00d4a1]"
                          style={{ borderColor: "#252f45" }}
                        />
                        <button
                          onClick={() => handleSendDetails(order._id)}
                          disabled={!detailsDraft[order._id]?.trim() || sendDetails.isPending}
                          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#00d4a1] text-[#0d1624] disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-95 transition-all"
                        >
                          {sendDetails.isPending ? "Sending…" : "Send Details"}
                        </button>
                      </div>
                    )}

                    {/* Approve / Reject — for both deposits (after proof) and withdrawals (any time) */}
                    {(tab === "awaiting_proof" || !isDeposit) && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(order._id)}
                          disabled={approve.isPending}
                          className="flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                          style={{ background: "rgba(76,175,80,0.15)", color: "#4CAF50", border: "1px solid rgba(76,175,80,0.3)" }}
                        >
                          <Icon icon="mdi:check" width={14} />
                          {approve.isPending ? "Approving…" : isDeposit ? "Approve & Credit" : "Approve & Send"}
                        </button>
                        <button
                          onClick={() => handleReject(order._id)}
                          disabled={reject.isPending}
                          className="flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                          style={{ background: "rgba(244,67,54,0.1)", color: "#F44336", border: "1px solid rgba(244,67,54,0.25)" }}
                        >
                          <Icon icon="mdi:close" width={14} />
                          {reject.isPending ? "Rejecting…" : "Reject"}
                        </button>
                      </div>
                    )}
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
