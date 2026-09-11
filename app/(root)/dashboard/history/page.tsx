"use client";

import React, { useState, useMemo } from "react";
import { Icon } from "@iconify/react";
import { useTransactions } from "@/hooks/queries";
import { formatUSD } from "@/context/PortfolioContext";

type TypeFilter = "all" | "buy" | "sell" | "deposit" | "withdraw" | "copy_trade";
type StatusFilter = "all" | "completed" | "pending" | "rejected" | "failed";

const TAB_LABELS: Record<TypeFilter, string> = {
  all: "All",
  buy: "Buy",
  sell: "Sell",
  deposit: "Deposit",
  withdraw: "Withdraw",
  copy_trade: "Copy Trade",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTypeIcon(type: string): string {
  switch (type) {
    case "buy": return "mdi:arrow-down-bold";
    case "sell": return "mdi:arrow-up-bold";
    case "deposit": return "mdi:plus-circle";
    case "withdraw": return "mdi:minus-circle";
    case "copy_trade": return "mdi:robot";
    case "profit": return "mdi:trending-up";
    case "loss": return "mdi:trending-down";
    default: return "mdi:swap-horizontal";
  }
}

function getTypeColor(type: string): string {
  switch (type) {
    case "buy": return "#00d4a1";
    case "sell": return "#F44336";
    case "deposit": return "#4CAF50";
    case "withdraw": return "#F5C518";
    case "copy_trade": return "#2196F3";
    default: return "#9aa3b0";
  }
}

function typeLabel(type: string): string {
  return type.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export default function TransactionHistoryPage() {
  const { data: txData, isLoading } = useTransactions(1, 100);
  const transactions = txData?.data ?? [];

  const [filter, setFilter] = useState<TypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filteredTransactions = useMemo(() => transactions.filter((tx) => {
    const typeMatch = filter === "all" || tx.type === filter;
    const statusMatch = statusFilter === "all" || tx.status === statusFilter;
    return typeMatch && statusMatch;
  }), [transactions, filter, statusFilter]);

  const totals = useMemo(() => {
    let totalBuy = 0, totalSell = 0;
    transactions.forEach(t => {
      if (t.type === "buy" && t.status === "completed") totalBuy += t.amount;
      if (t.type === "sell" && t.status === "completed") totalSell += t.amount;
    });
    return { totalBuy, totalSell };
  }, [transactions]);

  const exportToCSV = () => {
    const headers = ["id", "type", "status", "amount", "currency", "reference", "note", "createdAt"];
    const rows = filteredTransactions.map(tx =>
      headers.map(h => JSON.stringify((tx as any)[h] ?? "")).join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs: TypeFilter[] = ["all", "buy", "sell", "deposit", "withdraw", "copy_trade"];

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Transaction History</h1>
          <p className="text-sm mt-1" style={{ color: "#6b7785" }}>
            {isLoading ? "Loading..." : `${transactions.length} transactions`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="rounded-xl p-4" style={{ background: "#151d2d", border: "1px solid #252f45" }}>
          <p className="text-xs mb-1" style={{ color: "#6b7785" }}>Total Buy Volume</p>
          <p className="text-lg font-bold" style={{ color: "#00d4a1" }}>{formatUSD(totals.totalBuy)}</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: "#151d2d", border: "1px solid #252f45" }}>
          <p className="text-xs mb-1" style={{ color: "#6b7785" }}>Total Sell Volume</p>
          <p className="text-lg font-bold" style={{ color: "#F44336" }}>{formatUSD(totals.totalSell)}</p>
        </div>
      </div>

      <div className="mb-4 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className="px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors"
              style={{
                background: filter === tab ? "#00d4a1" : "#151d2d",
                color: filter === tab ? "#0d1624" : "#9aa3b0",
                border: filter === tab ? "none" : "1px solid #252f45",
              }}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {(["all", "completed", "pending", "rejected", "failed"] as StatusFilter[]).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors capitalize"
            style={{
              background: statusFilter === s ? "#252f45" : "transparent",
              color: statusFilter === s ? "#fff" : "#6b7785",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-16 text-sm text-penny-text-muted">Loading transactions...</div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-16">
            <Icon icon="mdi:file-document-outline" width={48} className="mx-auto mb-3" style={{ color: "#6b7785" }} />
            <p className="text-white font-semibold">No transactions found</p>
            <p className="text-sm mt-1" style={{ color: "#6b7785" }}>Try adjusting your filters</p>
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const icon = getTypeIcon(tx.type);
            const color = getTypeColor(tx.type);
            return (
              <div
                key={tx._id}
                className="rounded-xl p-4 transition-all hover:scale-[1.01]"
                style={{ background: "#151d2d", border: "1px solid #252f45" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ background: `${color}22` }}
                    >
                      <Icon icon={icon} width={18} style={{ color }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {typeLabel(tx.type)} {tx.reference ? `· ${tx.reference}` : ""}
                      </p>
                      <p className="text-xs" style={{ color: "#6b7785" }}>{formatDate(tx.createdAt)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold" style={{ color: tx.type === "sell" || tx.type === "withdraw" || tx.type === "loss" ? "#F44336" : "text-white" }}>
                      {formatUSD(tx.amount)} {tx.currency}
                    </p>
                    <p className="text-xs" style={{ color: "#9aa3b0" }}>
                      {tx.transactionID}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid #1d2639" }}>
                  <div className="flex items-center gap-2">
                    {tx.note && (
                      <span className="text-[10px]" style={{ color: "#6b7785" }}>{tx.note}</span>
                    )}
                  </div>
                  <span
                    className="text-[10px] font-bold px-2 py-1 rounded-full uppercase"
                    style={{
                      background:
                        tx.status === "completed" ? "rgba(76,175,80,0.12)" :
                        tx.status === "pending"   ? "rgba(245,197,24,0.12)" :
                        tx.status === "rejected"  ? "rgba(244,67,54,0.12)" :
                                                     "rgba(244,67,54,0.12)",
                      color:
                        tx.status === "completed" ? "#4CAF50" :
                        tx.status === "pending"   ? "#F5C518" :
                        tx.status === "rejected"  ? "#F44336" :
                                                     "#F44336",
                    }}
                  >
                    {tx.status}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-6">
        <button
          onClick={exportToCSV}
          disabled={filteredTransactions.length === 0}
          className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
          style={{ background: "#151d2d", color: "#9aa3b0", border: "1px solid #252f45" }}
        >
          <Icon icon="mdi:download" width={18} />
          Export to CSV
        </button>
      </div>
    </div>
  );
}
