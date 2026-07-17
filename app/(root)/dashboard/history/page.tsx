"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";

const transactions = [
  { id: "TXN-001", type: "buy", symbol: "BTC", name: "Bitcoin", amount: "0.5 BTC", price: 57200, total: 28600, fee: 28.60, status: "completed", date: "2024-02-28T14:30:00Z" },
  { id: "TXN-002", type: "sell", symbol: "ETH", name: "Ethereum", amount: "1.2 ETH", price: 3129, total: 3754.80, fee: 3.75, status: "completed", date: "2024-02-27T10:15:00Z" },
  { id: "TXN-003", type: "buy", symbol: "SOL", name: "Solana", amount: "10 SOL", price: 150, total: 1500, fee: 1.50, status: "completed", date: "2024-02-26T16:45:00Z" },
  { id: "TXN-004", type: "deposit", symbol: "USD", name: "USD Deposit", amount: "+5000.00", price: 1, total: 5000, fee: 0, status: "completed", date: "2024-02-25T09:00:00Z" },
  { id: "TXN-005", type: "copy", symbol: "BTC", name: "George's Copy", amount: "1x", price: 250, total: 250, fee: 0, status: "active", date: "2024-02-24T11:30:00Z" },
  { id: "TXN-006", type: "buy", symbol: "BNB", name: "BNB", amount: "5 BNB", price: 571, total: 2855, fee: 2.86, status: "completed", date: "2024-02-23T15:20:00Z" },
  { id: "TXN-007", type: "withdraw", symbol: "USD", name: "USD Withdrawal", amount: "-2000.00", price: 1, total: 2000, fee: 0, status: "completed", date: "2024-02-22T08:45:00Z" },
  { id: "TXN-008", type: "sell", symbol: "LTC", name: "Litecoin", amount: "2.5 LTC", price: 89.50, total: 223.75, fee: 0.22, status: "pending", date: "2024-02-21T17:00:00Z" },
];

const symbolColors: Record<string, string> = {
  BTC: "#F7931A", ETH: "#627EEA", SOL: "#14F195",
  BNB: "#F0B90B", LTC: "#BFBBBB", USD: "#4CAF50",
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TransactionHistoryPage() {
  const [filter, setFilter] = useState<"all" | "buy" | "sell" | "deposit" | "withdraw" | "copy">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "pending">("all");

  const filteredTransactions = transactions.filter((tx) => {
    const typeMatch = filter === "all" || tx.type === filter;
    const statusMatch = statusFilter === "all" || tx.status === statusFilter;
    return typeMatch && statusMatch;
  });

  const tabs = [
    { key: "all" as const, label: "All" },
    { key: "buy" as const, label: "Buy" },
    { key: "sell" as const, label: "Sell" },
    { key: "deposit" as const, label: "Deposit" },
    { key: "withdraw" as const, label: "Withdraw" },
    { key: "copy" as const, label: "Copy" },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "buy": return "mdi:arrow-down-bold";
      case "sell": return "mdi:arrow-up-bold";
      case "deposit": return "mdi:plus-circle";
      case "withdraw": return "mdi:minus-circle";
      case "copy": return "mdi:robot";
      default: return "mdi:swap-horizontal";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "buy": return "#00d4a1";
      case "sell": return "#F44336";
      case "deposit": return "#4CAF50";
      case "withdraw": return "#F5C518";
      case "copy": return "#2196F3";
      default: return "#9aa3b0";
    }
  };

  // Calculate totals
  const totalBuyVolume = transactions.filter(t => t.type === "buy").reduce((sum, t) => sum + t.total, 0);
  const totalSellVolume = transactions.filter(t => t.type === "sell").reduce((sum, t) => sum + t.total, 0);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Transaction History</h1>
          <p className="text-sm mt-1" style={{ color: "#6b7785" }}>{transactions.length} transactions</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="rounded-xl p-4" style={{ background: "#151d2d", border: "1px solid #252f45" }}>
          <p className="text-xs mb-1" style={{ color: "#6b7785" }}>Total Buy Volume</p>
          <p className="text-lg font-bold" style={{ color: "#00d4a1" }}>{formatCurrency(totalBuyVolume)}</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: "#151d2d", border: "1px solid #252f45" }}>
          <p className="text-xs mb-1" style={{ color: "#6b7785" }}>Total Sell Volume</p>
          <p className="text-lg font-bold" style={{ color: "#F44336" }}>{formatCurrency(totalSellVolume)}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-4 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className="px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors"
              style={{
                background: filter === tab.key ? "#00d4a1" : "#151d2d",
                color: filter === tab.key ? "#0d1624" : "#9aa3b0",
                border: filter === tab.key ? "none" : "1px solid #252f45",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setStatusFilter("all")}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
          style={{ background: statusFilter === "all" ? "#252f45" : "transparent", color: statusFilter === "all" ? "#fff" : "#6b7785" }}
        >
          All Status
        </button>
        <button
          onClick={() => setStatusFilter("completed")}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
          style={{ background: statusFilter === "completed" ? "rgba(76,175,80,0.15)" : "transparent", color: statusFilter === "completed" ? "#4CAF50" : "#6b7785" }}
        >
          Completed
        </button>
        <button
          onClick={() => setStatusFilter("pending")}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
          style={{ background: statusFilter === "pending" ? "rgba(245,197,24,0.15)" : "transparent", color: statusFilter === "pending" ? "#F5C518" : "#6b7785" }}
        >
          Pending
        </button>
      </div>

      {/* Transactions List */}
      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-16">
            <Icon icon="mdi:file-document-outline" width={48} className="mx-auto mb-3" style={{ color: "#6b7785" }} />
            <p className="text-white font-semibold">No transactions found</p>
            <p className="text-sm mt-1" style={{ color: "#6b7785" }}>Try adjusting your filters</p>
          </div>
        ) : (
          filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              className="rounded-xl p-4 transition-all hover:scale-[1.01]"
              style={{ background: "#151d2d", border: "1px solid #252f45" }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: `${getTypeColor(tx.type)}22` }}
                  >
                    <Icon icon={getTypeIcon(tx.type)} width={18} style={{ color: getTypeColor(tx.type) }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {tx.type === "buy" ? "Buy" : tx.type === "sell" ? "Sell" : tx.type === "deposit" ? "Deposit" : tx.type === "withdraw" ? "Withdraw" : "Copy Trade"} {tx.name}
                    </p>
                    <p className="text-xs" style={{ color: "#6b7785" }}>{formatDate(tx.date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold" style={{ color: tx.type === "sell" || tx.type === "withdraw" ? "#F44336" : "text-white" }}>
                    {tx.type === "buy" || tx.type === "sell" || tx.type === "copy"
                      ? `${tx.amount} @ ${formatCurrency(tx.price)}`
                      : tx.amount
                    }
                  </p>
                  <p className="text-xs font-semibold" style={{ color: "#F5C518" }}>
                    {formatCurrency(tx.total)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid #1d2639" }}>
                <div className="flex items-center gap-2">
                  {tx.symbol && (
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                        style={{ background: `${symbolColors[tx.symbol] || "#00d4a1"}22`, color: symbolColors[tx.symbol] || "#00d4a1" }}
                      >
                        {tx.symbol[0]}
                      </div>
                      <span className="text-xs font-semibold" style={{ color: "#9aa3b0" }}>{tx.symbol}</span>
                    </div>
                  )}
                  {tx.fee > 0 && (
                    <span className="text-[10px]" style={{ color: "#6b7785" }}>Fee: {formatCurrency(tx.fee)}</span>
                  )}
                </div>
                <span
                  className="text-[10px] font-bold px-2 py-1 rounded-full"
                  style={{
                    background: tx.status === "completed" ? "rgba(76,175,80,0.12)" : "rgba(245,197,24,0.12)",
                    color: tx.status === "completed" ? "#4CAF50" : "#F5C518",
                  }}
                >
                  {tx.status === "completed" ? "DONE" : "PENDING"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Export Button */}
      <div className="mt-6">
        <button
          className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
          style={{ background: "#151d2d", color: "#9aa3b0", border: "1px solid #252f45" }}
        >
          <Icon icon="mdi:download" width={18} />
          Export to CSV
        </button>
      </div>
    </div>
  );
}