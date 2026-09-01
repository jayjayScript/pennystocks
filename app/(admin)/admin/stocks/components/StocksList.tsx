"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { useAdminTransactions } from "@/hooks/queries";
import { useUpdateTransactionStatus } from "@/hooks/queries/useAdminActions";
import { formatUSD } from "@/context/PortfolioContext";

export default function StocksList() {
  const { data: txData, isLoading } = useAdminTransactions(1, 50);
  const { mutate: updateStatus } = useUpdateTransactionStatus();

  const [activeTab, setActiveTab] = useState<"pending" | "completed" | "rejected">("pending");

  const transactions = txData?.data ?? [];

  const filtered = transactions.filter((tx) => {
    if (activeTab === "pending") return tx.status === "pending";
    if (activeTab === "completed") return tx.status === "completed";
    if (activeTab === "rejected") return tx.status === "rejected" || tx.status === "failed";
    return false;
  });

  const pendingCount = transactions.filter(t => t.status === "pending").length;

  const tabs = [
    { key: "pending" as const,   label: `Pending (${pendingCount})`, color: "#F5C518" },
    { key: "completed" as const,  label: "Completed",                color: "#4CAF50" },
    { key: "rejected" as const,   label: "Rejected",               color: "#F44336" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex rounded-xl p-1 gap-1" style={{ background: "#0d1624", border: "1px solid #1d2639" }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
            style={{
              background: activeTab === tab.key ? `${tab.color}22` : "transparent",
              color: activeTab === tab.key ? tab.color : "#6b7785",
              border: activeTab === tab.key ? `1px solid ${tab.color}44` : "1px solid transparent",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl" style={{ background: "#151d2d", border: "1px dashed #252f45" }}>
          <p className="text-sm font-medium" style={{ color: "#6b7785" }}>Loading transactions...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl" style={{ background: "#151d2d", border: "1px dashed #252f45" }}>
          <Icon icon="mdi:inbox-outline" width={48} style={{ color: "#6b7785" }} />
          <p className="text-sm font-medium mt-3" style={{ color: "#6b7785" }}>
            No {activeTab} transactions
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((tx) => {
            const isBuy = tx.type === "buy";
            const isSell = tx.type === "sell";
            const isActionable = tx.status === "pending" && (isBuy || isSell);

            return (
              <div key={tx._id} className="rounded-2xl p-5" style={{ background: "#151d2d", border: "1px solid #252f45" }}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{
                        background: isBuy ? "rgba(0,212,161,0.1)" : "rgba(244,67,54,0.1)",
                        color: isBuy ? "#00d4a1" : "#F44336",
                      }}
                    >
                      <Icon icon={isBuy ? "mdi:cart-outline" : isSell ? "mdi:tag-outline" : "mdi:swap-horizontal"} width={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                          style={{
                            background: isBuy ? "rgba(0,212,161,0.1)" : "rgba(244,67,54,0.1)",
                            color: isBuy ? "#00d4a1" : "#F44336",
                          }}
                        >
                          {isBuy ? "BUY" : isSell ? "SELL" : tx.type.toUpperCase()}
                        </span>
                        {tx.reference && <span className="text-white font-bold">{tx.reference}</span>}
                      </div>
                      <p className="text-xs mt-1" style={{ color: "#6b7785" }}>
                        {new Date(tx.createdAt).toLocaleString()} · {tx.email}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm" style={{ color: "#9aa3b0" }}>
                      {isBuy ? "Total Cost" : isSell ? "Net Receive" : "Amount"}
                    </p>
                    <p className="text-lg font-bold" style={{ color: isBuy ? "#00d4a1" : "#4CAF50" }}>
                      {formatUSD(tx.amount)} {tx.currency}
                    </p>
                  </div>
                </div>

                {tx.note && (
                  <div className="mt-3 text-xs" style={{ color: "#9aa3b0" }}>
                    Note: {tx.note}
                  </div>
                )}

                {isActionable && (
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => updateStatus({ id: tx._id, status: "completed" })}
                      className="flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
                      style={{
                        background: "rgba(76,175,80,0.15)",
                        color: "#4CAF50",
                        border: "1px solid rgba(76,175,80,0.3)",
                      }}
                    >
                      <Icon icon="mdi:check" width={16} className="inline mr-1.5" />
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus({ id: tx._id, status: "rejected" })}
                      className="flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
                      style={{
                        background: "rgba(244,67,54,0.1)",
                        color: "#F44336",
                        border: "1px solid rgba(244,67,54,0.25)",
                      }}
                    >
                      <Icon icon="mdi:close" width={16} className="inline mr-1.5" />
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
