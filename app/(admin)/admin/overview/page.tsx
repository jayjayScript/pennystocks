"use client";

import React from "react";
import { Icon } from "@iconify/react";
import { adminStats, recentAdminTransactions } from "@/constants/admin-data";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminOverviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Overview</h1>
        <p className="text-xs sm:text-sm mt-1" style={{ color: "#9aa3b0" }}>
          Here&apos;s what&apos;s happening on the platform.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-xl sm:rounded-2xl p-4 sm:p-5" style={{ background: "linear-gradient(135deg, #151d2d 0%, #1b2a40 100%)", border: "1px solid #252f45" }}>
          <div className="flex items-start justify-between mb-3">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center" style={{ background: "rgba(0,212,161,0.12)" }}>
              <Icon icon="mdi:users-outline" width={18} className="sm:w-[22px] sm:h-[22px]" style={{ color: "#00d4a1" }} />
            </div>
            <span className="text-[10px] sm:text-xs font-bold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full" style={{ background: "rgba(0,212,161,0.1)", color: "#00d4a1" }}>
              {adminStats.usersChange}
            </span>
          </div>
          <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white">{adminStats.totalUsers.toLocaleString()}</p>
          <p className="text-[10px] sm:text-sm mt-1" style={{ color: "#9aa3b0" }}>Total Users</p>
        </div>

        <div className="rounded-xl sm:rounded-2xl p-4 sm:p-5" style={{ background: "linear-gradient(135deg, #151d2d 0%, #1b2a40 100%)", border: "1px solid #252f45" }}>
          <div className="flex items-start justify-between mb-3">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center" style={{ background: "rgba(0,212,161,0.12)" }}>
              <Icon icon="mdi:chart-line-variant" width={18} className="sm:w-[22px] sm:h-[22px]" style={{ color: "#00d4a1" }} />
            </div>
            <span className="text-[10px] sm:text-xs font-bold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full" style={{ background: "rgba(0,212,161,0.1)", color: "#00d4a1" }}>
              +{adminStats.stocksChange}
            </span>
          </div>
          <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white">{adminStats.stocksCreated}</p>
          <p className="text-[10px] sm:text-sm mt-1" style={{ color: "#9aa3b0" }}>Stocks Created</p>
        </div>

        <div className="rounded-xl sm:rounded-2xl p-4 sm:p-5" style={{ background: "linear-gradient(135deg, #151d2d 0%, #1b2a40 100%)", border: "1px solid #252f45" }}>
          <div className="flex items-start justify-between mb-3">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center" style={{ background: "rgba(0,212,161,0.12)" }}>
              <Icon icon="mdi:shopping-outline" width={18} className="sm:w-[22px] sm:h-[22px]" style={{ color: "#00d4a1" }} />
            </div>
            <span className="text-[10px] sm:text-xs font-bold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full" style={{ background: "rgba(0,212,161,0.1)", color: "#00d4a1" }}>
              {adminStats.stocksSoldChange}
            </span>
          </div>
          <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white">{adminStats.stocksSold.toLocaleString()}</p>
          <p className="text-[10px] sm:text-sm mt-1" style={{ color: "#9aa3b0" }}>Stocks Sold</p>
        </div>

        <div className="rounded-xl sm:rounded-2xl p-4 sm:p-5" style={{ background: "linear-gradient(135deg, #151d2d 0%, #1b2a40 100%)", border: "1px solid #252f45" }}>
          <div className="flex items-start justify-between mb-3">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center" style={{ background: "rgba(0,212,161,0.12)" }}>
              <Icon icon="mdi:swap-horizontal" width={18} className="sm:w-[22px] sm:h-[22px]" style={{ color: "#00d4a1" }} />
            </div>
            <span className="text-[10px] sm:text-xs font-bold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full" style={{ background: "rgba(0,212,161,0.1)", color: "#00d4a1" }}>
              {adminStats.transactionsChange}
            </span>
          </div>
          <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white">{adminStats.totalTransactions.toLocaleString()}</p>
          <p className="text-[10px] sm:text-sm mt-1" style={{ color: "#9aa3b0" }}>Transactions</p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="rounded-xl sm:rounded-2xl overflow-hidden" style={{ background: "#151d2d", border: "1px solid #252f45" }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-4" style={{ borderBottom: "1px solid #1d2639" }}>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">Recent Transactions</h2>
            <p className="text-[10px] sm:text-xs mt-0.5 sm:mt-1" style={{ color: "#9aa3b0" }}>Latest buy and sell orders</p>
          </div>
          <button className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 w-full sm:w-auto" style={{ background: "rgba(0,212,161,0.1)", color: "#00d4a1", border: "1px solid rgba(0,212,161,0.2)" }}>
            <Icon icon="mdi:download" width={14} className="sm:w-4 sm:h-4" />
            Export
          </button>
        </div>

        {/* Desktop Table Header */}
        <div className="hidden lg:grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1.5fr_1fr] px-6 py-3 text-xs font-semibold" style={{ background: "#0d1624", color: "#6b7785" }}>
          <span>User</span>
          <span>Stock</span>
          <span>Type</span>
          <span className="text-right">Qty</span>
          <span className="text-right">Amount</span>
          <span className="text-right">Date</span>
        </div>

        <div className="divide-y" style={{ borderColor: "#1d2639" }}>
          {recentAdminTransactions.map((tx) => (
            <div key={tx.id} className="lg:grid lg:grid-cols-[1.5fr_1.5fr_1fr_1fr_1.5fr_1fr] px-4 sm:px-6 py-4 flex flex-col gap-3 hover:bg-opacity-50 transition-colors" style={{ borderColor: "#1d2639" }}>
              {/* User Info */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shrink-0 text-[10px] sm:text-xs font-bold" style={{ background: "rgba(0,212,161,0.1)", color: "#00d4a1" }}>
                  {tx.user.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-semibold text-white truncate">{tx.user}</p>
                  <p className="text-[10px] sm:text-xs" style={{ color: "#6b7785" }}>{tx.userId}</p>
                </div>
              </div>

              {/* Stock Info */}
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center shrink-0 text-[10px] sm:text-xs font-bold" style={{ background: "rgba(255,255,255,0.05)" }}>{tx.stock[0]}</div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-white">{tx.stock}</p>
                  <p className="text-[10px] sm:text-xs truncate hidden sm:block" style={{ color: "#6b7785" }}>{tx.stockName}</p>
                </div>
              </div>

              {/* Type */}
              <div className="flex items-center lg:block">
                <span className="text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full" style={{ background: tx.type === "buy" ? "rgba(0,212,161,0.12)" : "rgba(244,67,54,0.12)", color: tx.type === "buy" ? "#00d4a1" : "#F44336" }}>
                  {tx.type.toUpperCase()}
                </span>
              </div>

              {/* Quantity */}
              <div className="lg:text-right">
                <p className="text-xs sm:text-sm font-semibold text-white">{tx.quantity}</p>
                <p className="text-[10px] sm:text-xs lg:hidden" style={{ color: "#6b7785" }}>Quantity</p>
              </div>

              {/* Amount */}
              <div className="lg:text-right">
                <p className="text-xs sm:text-sm font-semibold text-white">{formatCurrency(tx.total)}</p>
                <p className="text-[10px] sm:text-xs" style={{ color: "#F5C518" }}>Fee: {(tx.fee).toFixed(2)}</p>
                <p className="text-[10px] sm:text-xs lg:hidden" style={{ color: "#6b7785" }}>{tx.type === "buy" ? "Total" : "Net"}</p>
              </div>

              {/* Date & Status */}
              <div className="flex items-center justify-between lg:justify-end gap-3 lg:text-right">
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-white lg:hidden">{formatDate(tx.date)}</p>
                  <span className="text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full" style={{ background: tx.status === "completed" ? "rgba(76,175,80,0.12)" : "rgba(245,197,24,0.12)", color: tx.status === "completed" ? "#4CAF50" : "#F5C518" }}>
                    {tx.status === "completed" ? "Done" : "Pending"}
                  </span>
                </div>
                <span className="text-[10px] sm:text-xs hidden lg:block" style={{ color: "#6b7785" }}>{formatDate(tx.date)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="px-4 sm:px-6 py-4 text-center" style={{ borderTop: "1px solid #1d2639" }}>
          <button className="text-xs sm:text-sm font-semibold transition-opacity hover:opacity-80" style={{ color: "#00d4a1" }}>
            View All Transactions
          </button>
        </div>
      </div>
    </div>
  );
}