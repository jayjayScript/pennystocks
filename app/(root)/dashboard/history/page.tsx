"use client";

import React, { useState, useMemo } from "react";
import { Icon } from "@iconify/react";
import DepositModal from "@/components/modals/DepositModal";
function formatUSD(val: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);
}

const MOCK_ACTIVE_ORDERS: any[] = [
  {
    _id: "ord-101",
    type: "deposit",
    amount: 1500,
    method: "USDT (TRC20)",
    methodDetails: "TL9eW8zQp2p4q7R9mK3jU5vT1a8s9X4z",
    status: "pending",
    isMethodIncluded: true,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    _id: "ord-102",
    type: "withdraw",
    amount: 600,
    method: "Bitcoin (BTC)",
    status: "pending",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  }
];

const MOCK_HISTORY_TRANSACTIONS: any[] = [
  { _id: "tx-1", type: "deposit", amount: 2500, currency: "USD", status: "completed", reference: "DEP-84729", note: "Wire Transfer", createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
  { _id: "tx-2", type: "buy", amount: 1200, currency: "USD", status: "completed", reference: "BUY-AAPL", note: "Purchased 8 shares AAPL", createdAt: new Date(Date.now() - 4 * 86400000).toISOString() },
  { _id: "tx-3", type: "sell", amount: 950, currency: "USD", status: "completed", reference: "SEL-TSLA", note: "Sold 4 shares TSLA", createdAt: new Date(Date.now() - 7 * 86400000).toISOString() },
  { _id: "tx-4", type: "copy_trade", amount: 500, currency: "USD", status: "completed", reference: "CPY-ALEX", note: "Allocated to Alex Vance", createdAt: new Date(Date.now() - 12 * 86400000).toISOString() },
  { _id: "tx-5", type: "withdraw", amount: 400, currency: "USD", status: "completed", reference: "WTH-28374", note: "Bank Transfer", createdAt: new Date(Date.now() - 15 * 86400000).toISOString() },
];

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
  const transactions = MOCK_HISTORY_TRANSACTIONS;
  const pendingOrders = MOCK_ACTIVE_ORDERS;
  const isLoading = false;
  const ordersLoading = false;

  const [mainTab, setMainTab] = useState<"active_orders" | "transactions">("active_orders");
  const [filter, setFilter] = useState<TypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>(undefined);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeOrders = useMemo(() => {
    return pendingOrders.filter(
      (o) => o.status !== "completed" && o.status !== "rejected" && o.status !== "expired"
    );
  }, [pendingOrders]);

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

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openUploadProofModal = (orderId: string) => {
    setSelectedOrderId(orderId);
    setDepositModalOpen(true);
  };

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
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Orders & Transactions</h1>
          <p className="text-sm mt-1" style={{ color: "#6b7785" }}>
            Track your active deposit & withdrawal orders and review completed transaction history.
          </p>
        </div>
      </div>

      {/* Primary Top Tab Switcher: Active Orders vs Past Transactions */}
      <div className="flex p-1.5 rounded-2xl bg-[#0d1624] border border-[#252f45]">
        <button
          type="button"
          onClick={() => setMainTab("active_orders")}
          className={`flex-1 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            mainTab === "active_orders"
              ? "bg-[#00d4a1] text-[#0d1624] shadow-lg"
              : "text-penny-text-muted hover:text-white"
          }`}
        >
          <Icon icon="mdi:clock-fast" width={18} />
          <span>Active Orders</span>
          {activeOrders.length > 0 && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                mainTab === "active_orders"
                  ? "bg-[#0d1624] text-[#00d4a1]"
                  : "bg-[#00d4a1]/20 text-[#00d4a1]"
              }`}
            >
              {activeOrders.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setMainTab("transactions")}
          className={`flex-1 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            mainTab === "transactions"
              ? "bg-[#00d4a1] text-[#0d1624] shadow-lg"
              : "text-penny-text-muted hover:text-white"
          }`}
        >
          <Icon icon="mdi:history" width={18} />
          <span>Transaction History</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white/80">
            {transactions.length}
          </span>
        </button>
      </div>

      {/* ── ACTIVE ORDERS TAB ─────────────────────────────────────────────── */}
      {mainTab === "active_orders" && (
        <div className="space-y-4">
          {ordersLoading ? (
            <div className="text-center py-16 text-sm text-penny-text-muted">Loading active orders...</div>
          ) : activeOrders.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-dashed border-[#252f45] bg-[#151d2d]/60 p-6">
              <Icon icon="mdi:package-variant-closed" width={48} className="mx-auto mb-3 text-[#6b7785]" />
              <h3 className="text-white font-bold text-base">No active orders right now</h3>
              <p className="text-xs text-penny-text-muted mt-1 max-w-sm mx-auto">
                When you submit a deposit request, it will appear here. Once admin sends payment details, you can view the account information and upload your transfer receipt right here.
              </p>
            </div>
          ) : (
            activeOrders.map((order) => {
              const isDeposit = order.type === "deposit";
              const hasProof = Boolean(order.proofPaymentDocument);
              const hasDetails = Boolean(order.methodDetails || order.isMethodIncluded);
              const readyForProof = isDeposit && hasDetails && !hasProof;

              return (
                <div
                  key={order._id}
                  className={`rounded-2xl p-5 border transition-all ${
                    readyForProof
                      ? "border-[#00d4a1]/50 bg-[#151d2d] shadow-lg shadow-[#00d4a1]/5"
                      : "border-[#252f45] bg-[#151d2d]"
                  }`}
                >
                  {/* Order Header Row */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          background: isDeposit ? "rgba(0,212,161,0.12)" : "rgba(245,197,24,0.12)",
                          color: isDeposit ? "#00d4a1" : "#F5C518",
                        }}
                      >
                        <Icon icon={isDeposit ? "mdi:arrow-down-bold" : "mdi:arrow-up-bold"} width={22} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase"
                            style={{
                              background: isDeposit ? "rgba(0,212,161,0.15)" : "rgba(245,197,24,0.15)",
                              color: isDeposit ? "#00d4a1" : "#F5C518",
                            }}
                          >
                            {order.type}
                          </span>
                          <span className="text-sm font-bold text-white">{order.method}</span>
                          {/* Live Status Badge */}
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                              readyForProof
                                ? "bg-[#00d4a1]/20 text-[#00d4a1] border border-[#00d4a1]/30 animate-pulse"
                                : hasProof
                                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            }`}
                          >
                            {readyForProof
                              ? "Payment Details Ready"
                              : hasProof
                              ? "Proof Under Review"
                              : "Awaiting Admin Details"}
                          </span>
                        </div>
                        <p className="text-xs text-penny-text-muted mt-1">
                          Order #{order.orderID || order._id.slice(-6)} · {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-penny-text-muted">Requested Amount</p>
                      <p className="text-xl font-extrabold text-white">{formatUSD(order.amount)}</p>
                    </div>
                  </div>

                  {/* ── STATE 1: Ready for Payment Proof (Admin has provided details) ── */}
                  {readyForProof && (
                    <div className="mt-4 p-4 rounded-xl bg-[#00d4a1]/10 border border-[#00d4a1]/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-[#00d4a1] flex items-center gap-1.5 uppercase tracking-wide">
                          <Icon icon="mdi:bank-check" width={18} />
                          Admin Account / Payment Details
                        </span>
                        {order.methodDetails && (
                          <button
                            type="button"
                            onClick={() => handleCopy(order._id, order.methodDetails || "")}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-[#00d4a1] text-[#0d1624] hover:bg-[#00b88c] transition-colors cursor-pointer"
                          >
                            <Icon icon={copiedId === order._id ? "mdi:check" : "mdi:content-copy"} width={14} />
                            <span>{copiedId === order._id ? "Copied!" : "Copy Details"}</span>
                          </button>
                        )}
                      </div>

                      {order.methodDetails ? (
                        <div className="bg-black/50 p-3 rounded-xl border border-white/10">
                          <p className="text-xs font-mono font-bold text-white break-all whitespace-pre-wrap select-all leading-relaxed">
                            {order.methodDetails}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-penny-text-muted">
                          Admin has accepted your order. Click below to view account info and submit proof.
                        </p>
                      )}

                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                        <p className="text-[11px] text-penny-text-muted">
                          💡 Send exact amount <strong>{formatUSD(order.amount)}</strong> to the details above, then upload your transfer receipt.
                        </p>
                        <button
                          type="button"
                          onClick={() => openUploadProofModal(order._id)}
                          className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-[#00d4a1] text-[#0d1624] hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#00d4a1]/20 cursor-pointer"
                        >
                          <Icon icon="mdi:cloud-upload-outline" width={17} />
                          <span>Upload Proof of Payment</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ── STATE 2: Proof Uploaded, Under Review ── */}
                  {hasProof && (
                    <div className="mt-4 p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                          <Icon icon="mdi:clock-check-outline" width={18} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">Payment Receipt Attached — Under Admin Review</p>
                          <p className="text-[11px] text-penny-text-muted mt-0.5">
                            Admin is verifying your transfer. Your account balance will be credited upon confirmation.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => openUploadProofModal(order._id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-white border border-[#252f45] transition-colors shrink-0 cursor-pointer"
                      >
                        View Receipt
                      </button>
                    </div>
                  )}

                  {/* ── STATE 3: Fresh Request Awaiting Admin Response ── */}
                  {!hasDetails && !hasProof && (
                    <div className="mt-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                        <Icon icon="mdi:clock-outline" width={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Awaiting Admin Payment Details</p>
                        <p className="text-[11px] text-penny-text-muted mt-0.5">
                          Admin will respond shortly with the account details for your chosen {order.method} deposit. You will receive an instant notification once details arrive.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── COMPLETED TRANSACTIONS TAB ───────────────────────────────────── */}
      {mainTab === "transactions" && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl p-4" style={{ background: "#151d2d", border: "1px solid #252f45" }}>
              <p className="text-xs mb-1" style={{ color: "#6b7785" }}>Total Buy Volume</p>
              <p className="text-lg font-bold" style={{ color: "#00d4a1" }}>{formatUSD(totals.totalBuy)}</p>
            </div>
            <div className="rounded-xl p-4" style={{ background: "#151d2d", border: "1px solid #252f45" }}>
              <p className="text-xs mb-1" style={{ color: "#6b7785" }}>Total Sell Volume</p>
              <p className="text-lg font-bold" style={{ color: "#F44336" }}>{formatUSD(totals.totalSell)}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer"
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

          <div className="flex gap-2 flex-wrap">
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
    </>
  )}

  {depositModalOpen && (
    <DepositModal
      isOpen={depositModalOpen}
      onClose={() => setDepositModalOpen(false)}
      initialOrderId={selectedOrderId}
    />
  )}
</div>
);
}
