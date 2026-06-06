"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { usePortfolio, formatUSD } from "@/context/PortfolioContext";

type Tab = "pending" | "approved" | "rejected";

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export default function AdminOrdersScreen() {
  const { pendingOrders, approveOrder, rejectOrder, accountBalance, portfolio } =
    usePortfolio();
  const [tab, setTab]           = useState<Tab>("pending");
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  const filtered = pendingOrders.filter((o) => o.status === tab);
  const pendingCount = pendingOrders.filter((o) => o.status === "pending").length;

  const handleApprove = (id: string) => {
    const result = approveOrder(id);
    setFeedback((prev) => ({ ...prev, [id]: result.message }));
  };

  const handleReject = (id: string) => {
    rejectOrder(id);
    setFeedback((prev) => ({ ...prev, [id]: "Order rejected." }));
  };

  const tabs: { key: Tab; label: string; color: string }[] = [
    { key: "pending",  label: `Pending${pendingCount > 0 ? ` (${pendingCount})` : ""}`, color: "#F5C518" },
    { key: "approved", label: "Approved", color: "#4CAF50" },
    { key: "rejected", label: "Rejected", color: "#F44336" },
  ];

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm" style={{ color: "#9aa3b0" }}>Administration</p>
          <h1 className="text-2xl font-bold text-white mt-0.5">Order Management</h1>
        </div>

        {/* Live portfolio snapshot */}
        <div
          className="flex gap-6 px-4 py-3 rounded-2xl text-sm"
          style={{ background: "#151d2d", border: "1px solid #1d2639" }}
        >
          <div>
            <p style={{ color: "#9aa3b0" }}>Account Balance</p>
            <p className="font-bold text-white">{formatUSD(accountBalance)}</p>
          </div>
          <div style={{ width: "1px", background: "#1d2639" }} />
          <div>
            <p style={{ color: "#9aa3b0" }}>Holdings</p>
            <p className="font-bold text-white">{portfolio.length} assets</p>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div
        className="flex rounded-2xl p-1 gap-1"
        style={{ background: "#0d1624", border: "1px solid #1d2639" }}
      >
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
            style={{
              background: tab === t.key ? t.color + "22" : "transparent",
              color:       tab === t.key ? t.color : "#6b7785",
              border:      tab === t.key ? `1px solid ${t.color}44` : "1px solid transparent",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Orders list ── */}
      {filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 rounded-2xl gap-3"
          style={{ background: "#151d2d", border: "1px dashed #252f45" }}
        >
          <Icon icon="mdi:inbox-outline" width={40} style={{ color: "#6b7785" }} />
          <p className="text-sm font-medium" style={{ color: "#6b7785" }}>
            No {tab} orders
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const isBuy      = order.type === "buy";
            const typeColor  = isBuy ? "#00d4a1" : "#F44336";
            const typeBg     = isBuy ? "rgba(0,212,161,0.1)" : "rgba(244,67,54,0.1)";
            const localFb    = feedback[order.id];

            return (
              <div
                key={order.id}
                className="rounded-2xl p-5 space-y-4"
                style={{ background: "#151d2d", border: "1px solid #1d2639" }}
              >
                {/* Order header row */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    {/* Asset icon */}
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-lg font-bold"
                      style={{ background: order.bgColor || "rgba(0,212,161,0.1)" }}
                    >
                      {order.icon
                        ? <Icon icon={order.icon} width={22} />
                        : order.symbol[0]}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                          style={{ background: typeBg, color: typeColor }}
                        >
                          {isBuy ? "BUY" : "SELL"}
                        </span>
                        <span className="text-white font-bold">{order.symbol}</span>
                        <span style={{ color: "#9aa3b0" }} className="text-sm">{order.name}</span>
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: "#6b7785" }}>
                        Placed {timeAgo(order.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Status badge */}
                  {order.status !== "pending" && (
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-full"
                      style={{
                        background: order.status === "approved" ? "rgba(76,175,80,0.12)" : "rgba(244,67,54,0.12)",
                        color:      order.status === "approved" ? "#4CAF50" : "#F44336",
                      }}
                    >
                      {order.status === "approved" ? "✓ Approved" : "✕ Rejected"}
                    </span>
                  )}
                </div>

                {/* Details grid */}
                <div
                  className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl p-4"
                  style={{ background: "#0d1624", border: "1px solid #1d2639" }}
                >
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: "#6b7785" }}>Units</p>
                    <p className="font-semibold text-white text-sm">
                      {parseFloat(order.units.toFixed(6))} {order.symbol}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: "#6b7785" }}>Price at Order</p>
                    <p className="font-semibold text-white text-sm">{formatUSD(order.stockPrice)}</p>
                  </div>
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: "#6b7785" }}>Fee (0.1%)</p>
                    <p className="font-semibold text-sm" style={{ color: "#F5C518" }}>
                      {formatUSD(order.fee)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: "#6b7785" }}>
                      {isBuy ? "Total Cost" : "Net Receive"}
                    </p>
                    <p className="font-bold text-base" style={{ color: isBuy ? "#F44336" : "#4CAF50" }}>
                      {isBuy ? formatUSD(order.totalCost) : formatUSD(order.netReceive)}
                    </p>
                  </div>
                </div>

                {/* Feedback message */}
                {localFb && (
                  <p className="text-xs font-medium" style={{ color: "#9aa3b0" }}>
                    {localFb}
                  </p>
                )}

                {/* Admin actions — only for pending */}
                {order.status === "pending" && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(order.id)}
                      className="flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
                      style={{
                        background: "rgba(76,175,80,0.15)",
                        color: "#4CAF50",
                        border: "1px solid rgba(76,175,80,0.3)",
                      }}
                    >
                      <Icon icon="mdi:check" width={16} className="inline mr-1.5 mb-0.5" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(order.id)}
                      className="flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
                      style={{
                        background: "rgba(244,67,54,0.1)",
                        color: "#F44336",
                        border: "1px solid rgba(244,67,54,0.25)",
                      }}
                    >
                      <Icon icon="mdi:close" width={16} className="inline mr-1.5 mb-0.5" />
                      Reject
                    </button>
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
