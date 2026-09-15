"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
type NotifItem = {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "deposit" | "withdraw" | "transaction" | "order";
  status: string;
};

export default function AdminNotificationsPage() {
  const [filter, setFilter] = useState<"all" | "orders" | "transactions">("all");
  const isLoading = false;
  const items: NotifItem[] = [];

  const filtered = filter === "all" ? items : items.filter((i) => {
    if (filter === "orders") return i.type === "deposit" || i.type === "withdraw";
    return i.type === "transaction";
  });

  const statusColor = (s: string) => {
    switch (s) {
      case "completed": return { bg: "rgba(76,175,80,0.12)", color: "#4CAF50" };
      case "pending": return { bg: "rgba(245,197,24,0.12)", color: "#F5C518" };
      case "rejected":
      case "failed":
      case "expired": return { bg: "rgba(244,67,54,0.12)", color: "#F44336" };
      default: return { bg: "rgba(33,150,243,0.12)", color: "#2196F3" };
    }
  };

  const typeIcon = (t: string) => {
    switch (t) {
      case "deposit": return { icon: "mdi:arrow-down-circle", color: "#00d4a1" };
      case "withdraw": return { icon: "mdi:arrow-up-circle", color: "#F5C518" };
      default: return { icon: "mdi:swap-horizontal", color: "#2196F3" };
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Activity Feed</h1>
          <p className="text-xs sm:text-sm mt-1" style={{ color: "#9aa3b0" }}>
            Real-time payment orders and transactions
          </p>
        </div>
        <div className="flex gap-2">
          {(["all", "orders", "transactions"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-colors"
              style={{
                background: filter === f ? "#00d4a1" : "#151d2d",
                color: filter === f ? "#0d1624" : "#9aa3b0",
                border: filter === f ? "none" : "1px solid #252f45",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="rounded-xl sm:rounded-2xl overflow-hidden" style={{ background: "#151d2d", border: "1px solid #252f45" }}>
        {isLoading ? (
          <div className="py-16 text-center" style={{ color: "#6b7785" }}>
            <Icon icon="mdi:loading" width={32} className="mx-auto animate-spin mb-3" />
            <p className="text-sm">Loading activity...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center" style={{ color: "#6b7785" }}>
            <Icon icon="mdi:bell-off-outline" width={40} className="mx-auto mb-3" />
            <p className="text-sm font-medium">No activity yet</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "#1d2639" }}>
            {filtered.map((item) => {
              const ti = typeIcon(item.type);
              const sc = statusColor(item.status);
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 hover:bg-[#1a2438] transition-colors"
                >
                  {/* Icon */}
                  <div
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${ti.color}18` }}
                  >
                    <Icon icon={ti.icon} width={18} style={{ color: ti.color }} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className="text-xs sm:text-sm font-semibold text-white">{item.title}</p>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                        style={sc}
                      >
                        {item.status}
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-xs truncate" style={{ color: "#9aa3b0" }}>
                      {item.message}
                    </p>
                  </div>

                  {/* Time */}
                  <span className="text-[10px] sm:text-xs shrink-0 mt-0.5" style={{ color: "#6b7785" }}>
                    {item.time}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}