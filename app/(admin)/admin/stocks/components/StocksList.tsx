"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { usePortfolio } from "@/context/PortfolioContext";

export default function StocksList() {
  const { pendingOrders } = usePortfolio();
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected">("pending");

  const filteredOrders = pendingOrders.filter((o) => o.status === activeTab);
  const pendingCount = pendingOrders.filter((o) => o.status === "pending").length;

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

      {filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl" style={{ background: "#151d2d", border: "1px dashed #252f45" }}>
          <Icon icon="mdi:inbox-outline" width={48} style={{ color: "#6b7785" }} />
          <p className="text-sm font-medium mt-3" style={{ color: "#6b7785" }}>
            No {activeTab} orders
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isBuy = order.type === "buy";
            const typeColor = isBuy ? "#00d4a1" : "#F44336";
            const typeBg = isBuy ? "rgba(0,212,161,0.1)" : "rgba(244,67,54,0.1)";

            return (
              <div key={order.id} className="rounded-2xl p-5" style={{ background: "#151d2d", border: "1px solid #252f45" }}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: order.bgColor || "rgba(0,212,161,0.1)" }}>
                      <Icon icon={order.icon || "mdi:chart-line"} width={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full" style={{ background: typeBg, color: typeColor }}>
                          {isBuy ? "BUY" : "SELL"}
                        </span>
                        <span className="text-white font-bold">{order.symbol}</span>
                        <span className="text-sm" style={{ color: "#9aa3b0" }}>{order.name}</span>
                      </div>
                      <p className="text-xs mt-1" style={{ color: "#6b7785" }}>
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm" style={{ color: "#9aa3b0" }}>{isBuy ? "Total Cost" : "Net Receive"}</p>
                      <p className="text-lg font-bold" style={{ color: isBuy ? "#00d4a1" : "#4CAF50" }}>
                        ${order.totalCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 p-4 rounded-xl" style={{ background: "#0d1624", border: "1px solid #1d2639" }}>
                  <div>
                    <p className="text-xs" style={{ color: "#6b7785" }}>Units</p>
                    <p className="text-sm font-semibold text-white">{parseFloat(order.units.toFixed(6))}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "#6b7785" }}>Price</p>
                    <p className="text-sm font-semibold text-white">${order.stockPrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "#6b7785" }}>Fee (0.1%)</p>
                    <p className="text-sm font-semibold" style={{ color: "#F5C518" }}>${order.fee.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "#6b7785" }}>Amount</p>
                    <p className="text-sm font-semibold text-white">${order.usdAmount.toFixed(2)}</p>
                  </div>
                </div>

                {order.status === "pending" && (
                  <div className="flex gap-3 mt-4">
                    <button className="flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-95" style={{ background: "rgba(76,175,80,0.15)", color: "#4CAF50", border: "1px solid rgba(76,175,80,0.3)" }}>
                      <Icon icon="mdi:check" width={16} className="inline mr-1.5" />
                      Approve
                    </button>
                    <button className="flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-95" style={{ background: "rgba(244,67,54,0.1)", color: "#F44336", border: "1px solid rgba(244,67,54,0.25)" }}>
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