"use client";

import React from "react";
import { Icon } from "@iconify/react";
import { useAdminUsers, useAdminTransactions, useStocks } from "@/hooks/queries";
import { formatUSD } from "@/context/PortfolioContext";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminOverviewPage() {
  const { data: usersData, isLoading: usersLoading } = useAdminUsers(1, 1);
  const { data: txData, isLoading: txLoading } = useAdminTransactions(1, 10);
  const { data: stocksData, isLoading: stocksLoading } = useStocks(1, 1);

  const users = usersData?.data ?? [];
  const totalUsers = usersData?.pagination?.total ?? users.length;
  const totalStocks = stocksData?.pagination?.total ?? stocksData?.data?.length ?? 0;
  const totalTransactions = txData?.pagination?.total ?? 0;
  const recentTx = txData?.data ?? [];

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
          </div>
          <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white">
            {usersLoading ? "—" : totalUsers.toLocaleString()}
          </p>
          <p className="text-[10px] sm:text-sm mt-1" style={{ color: "#9aa3b0" }}>Total Users</p>
        </div>

        <div className="rounded-xl sm:rounded-2xl p-4 sm:p-5" style={{ background: "linear-gradient(135deg, #151d2d 0%, #1b2a40 100%)", border: "1px solid #252f45" }}>
          <div className="flex items-start justify-between mb-3">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center" style={{ background: "rgba(0,212,161,0.12)" }}>
              <Icon icon="mdi:chart-line-variant" width={18} className="sm:w-[22px] sm:h-[22px]" style={{ color: "#00d4a1" }} />
            </div>
          </div>
          <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white">
            {stocksLoading ? "—" : totalStocks.toLocaleString()}
          </p>
          <p className="text-[10px] sm:text-sm mt-1" style={{ color: "#9aa3b0" }}>Stocks Created</p>
        </div>

        <div className="rounded-xl sm:rounded-2xl p-4 sm:p-5" style={{ background: "linear-gradient(135deg, #151d2d 0%, #1b2a40 100%)", border: "1px solid #252f45" }}>
          <div className="flex items-start justify-between mb-3">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center" style={{ background: "rgba(0,212,161,0.12)" }}>
              <Icon icon="mdi:shopping-outline" width={18} className="sm:w-[22px] sm:h-[22px]" style={{ color: "#00d4a1" }} />
            </div>
          </div>
          <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white">
            {txLoading ? "—" : recentTx.filter((t) => t.type === "sell").length.toLocaleString()}
          </p>
          <p className="text-[10px] sm:text-sm mt-1" style={{ color: "#9aa3b0" }}>Stocks Sold</p>
        </div>

        <div className="rounded-xl sm:rounded-2xl p-4 sm:p-5" style={{ background: "linear-gradient(135deg, #151d2d 0%, #1b2a40 100%)", border: "1px solid #252f45" }}>
          <div className="flex items-start justify-between mb-3">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center" style={{ background: "rgba(0,212,161,0.12)" }}>
              <Icon icon="mdi:swap-horizontal" width={18} className="sm:w-[22px] sm:h-[22px]" style={{ color: "#00d4a1" }} />
            </div>
          </div>
          <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white">
            {txLoading ? "—" : totalTransactions.toLocaleString()}
          </p>
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
          <span>Reference</span>
          <span>Type</span>
          <span className="text-right">Amount</span>
          <span>Status</span>
          <span className="text-right">Date</span>
        </div>

        <div className="divide-y" style={{ borderColor: "#1d2639" }}>
          {txLoading ? (
            <div className="py-16 text-center" style={{ color: "#6b7785" }}>Loading...</div>
          ) : recentTx.length === 0 ? (
            <div className="py-16 text-center" style={{ color: "#6b7785" }}>
              <Icon icon="mdi:inbox-outline" width={48} className="mx-auto" />
              <p className="text-sm font-medium mt-3">No transactions yet</p>
            </div>
          ) : (
            recentTx.map((tx) => {
              const isBuy = tx.type === "buy";
              const isSell = tx.type === "sell";
              const userName = tx.email ?? "User";
              const initials = userName.substring(0, 2).toUpperCase();
              return (
                <div key={tx._id} className="lg:grid lg:grid-cols-[1.5fr_1.5fr_1fr_1fr_1.5fr_1fr] px-4 sm:px-6 py-4 flex flex-col gap-3 hover:bg-opacity-50 transition-colors" style={{ borderColor: "#1d2639" }}>
                  {/* User Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shrink-0 text-[10px] sm:text-xs font-bold" style={{ background: "rgba(0,212,161,0.1)", color: "#00d4a1" }}>
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-semibold text-white truncate">{userName}</p>
                      <p className="text-[10px] sm:text-xs truncate" style={{ color: "#6b7785" }}>{tx.transactionID ?? tx._id}</p>
                    </div>
                  </div>

                  {/* Reference */}
                  <div className="flex items-center gap-2 min-w-0">
                    <p className="text-xs sm:text-sm text-white truncate">{tx.reference ?? "—"}</p>
                  </div>

                  {/* Type */}
                  <div className="flex items-center lg:block">
                    <span className="text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full" style={{ background: isBuy ? "rgba(0,212,161,0.12)" : isSell ? "rgba(244,67,54,0.12)" : "rgba(245,197,24,0.12)", color: isBuy ? "#00d4a1" : isSell ? "#F44336" : "#F5C518" }}>
                      {tx.type.toUpperCase()}
                    </span>
                  </div>

                  {/* Amount */}
                  <div className="lg:text-right">
                    <p className="text-xs sm:text-sm font-semibold text-white">{formatUSD(tx.amount)}</p>
                  </div>

                  {/* Status */}
                  <div className="flex items-center">
                    <span className="text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full" style={{ background: tx.status === "completed" ? "rgba(76,175,80,0.12)" : tx.status === "rejected" || tx.status === "failed" ? "rgba(244,67,54,0.12)" : "rgba(245,197,24,0.12)", color: tx.status === "completed" ? "#4CAF50" : tx.status === "rejected" || tx.status === "failed" ? "#F44336" : "#F5C518" }}>
                      {tx.status}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="lg:text-right">
                    <span className="text-[10px] sm:text-xs" style={{ color: "#6b7785" }}>{formatDate(tx.createdAt)}</span>
                  </div>
                </div>
              );
            })
          )}
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
