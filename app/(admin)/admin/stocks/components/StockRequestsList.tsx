"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { useStockRequests } from "@/context/StockRequestContext";

export default function StockRequestsList() {
  const { stockRequests, approveStockRequest, rejectStockRequest } = useStockRequests();
  const [activeSubTab, setActiveSubTab] = useState<"pending" | "approved" | "rejected">("pending");

  const filteredRequests = stockRequests.filter((r) => r.status === activeSubTab);
  const pendingCount = stockRequests.filter((r) => r.status === "pending").length;

  const tabs = [
    { key: "pending" as const, label: `Pending (${pendingCount})`, color: "#F5C518" },
    { key: "approved" as const, label: "Approved", color: "#4CAF50" },
    { key: "rejected" as const, label: "Rejected", color: "#F44336" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex rounded-xl p-1 gap-1" style={{ background: "#0d1624", border: "1px solid #1d2639" }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveSubTab(tab.key)}
            className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
            style={{
              background: activeSubTab === tab.key ? `${tab.color}22` : "transparent",
              color: activeSubTab === tab.key ? tab.color : "#6b7785",
              border: activeSubTab === tab.key ? `1px solid ${tab.color}44` : "1px solid transparent",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredRequests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl" style={{ background: "#151d2d", border: "1px dashed #252f45" }}>
          <Icon icon="mdi:inbox-outline" width={48} style={{ color: "#6b7785" }} />
          <p className="text-sm font-medium mt-3" style={{ color: "#6b7785" }}>
            No {activeSubTab} stock requests
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => (
            <div key={req.id} className="rounded-2xl p-5" style={{ background: "#151d2d", border: "1px solid #252f45" }}>
              <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/5 text-white font-extrabold text-lg">
                    {req.ticker[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/10 text-white">
                        {req.type}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">
                        {req.exchange}
                      </span>
                      <span className="text-white font-bold text-base">{req.ticker}</span>
                      <span className="text-sm text-penny-text-muted">({req.name})</span>
                    </div>
                    <p className="text-xs mt-1 text-penny-text-disabled">
                      Requested: {new Date(req.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs text-penny-text-muted">Suggested Price</p>
                  <p className="text-lg font-bold text-[#00d4a1]">${req.initialPrice.toFixed(2)}</p>
                </div>
              </div>

              {req.description && (
                <div className="p-3.5 rounded-xl bg-[#0d1624] border border-[#1d2639] text-xs text-penny-text-muted leading-relaxed mb-4">
                  <p className="font-semibold text-white mb-1">Company Description:</p>
                  {req.description}
                </div>
              )}

              {req.status === "pending" && (
                <div className="flex gap-3">
                  <button
                    onClick={() => approveStockRequest(req.id)}
                    className="flex-1 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
                    style={{ background: "rgba(76,175,80,0.15)", color: "#4CAF50", border: "1px solid rgba(76,175,80,0.3)" }}
                  >
                    <Icon icon="mdi:check" width={14} className="inline mr-1" />
                    Approve Listing
                  </button>
                  <button
                    onClick={() => rejectStockRequest(req.id)}
                    className="flex-1 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
                    style={{ background: "rgba(244,67,54,0.1)", color: "#F44336", border: "1px solid rgba(244,67,54,0.25)" }}
                  >
                    <Icon icon="mdi:close" width={14} className="inline mr-1" />
                    Reject Request
                  </button>
                </div>
              )}

              {req.status !== "pending" && (
                <div className="text-center pt-2">
                  <span
                    className="text-xs font-bold px-4 py-1.5 rounded-full"
                    style={{
                      background: req.status === "approved" ? "rgba(76,175,80,0.12)" : "rgba(244,67,54,0.12)",
                      color: req.status === "approved" ? "#4CAF50" : "#F44336"
                    }}
                  >
                    {req.status === "approved" ? "✓ Approved" : "✕ Rejected"}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
