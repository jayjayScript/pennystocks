"use client";

import { usePortfolio, formatUSD } from "@/context/PortfolioContext";
import { Icon } from "@iconify/react";

export default function TransactionList() {
  const { pendingOrders } = usePortfolio();

  // Get all transactions from pending orders, filter to completed ones + recent
  const transactions = pendingOrders.filter(o => o.status === "approved");

  return (
    <div
      className="rounded-2xl p-6 border border-[#252f45]"
      style={{ background: "linear-gradient(180deg, #111b2c 0%, #0d1624 100%)" }}
    >
      {/* Card Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 rounded-full border border-[#252f45] flex items-center justify-center">
          <Icon icon="mdi:receipt-text-outline" className="text-white" width={18} />
        </div>
        <h2 className="text-base font-semibold text-white flex-1">Recent Transactions</h2>
        <Icon
          icon="mdi:chevron-right"
          width={20}
          className="text-penny-text-muted cursor-pointer hover:text-white transition-colors"
        />
      </div>

      <div className="space-y-3">
        {transactions.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-[#252f45] rounded-2xl bg-[#151d2d]">
            <Icon icon="mdi:receipt-text-outline" width={32} className="mx-auto text-[#6b7785] mb-3" />
            <p className="text-sm text-[#9aa3b0]">No recent transactions.</p>
            <p className="text-xs text-[#6b7785] mt-1">Completed trades will appear here</p>
          </div>
        ) : (
          transactions.map((order) => {
            const isBuy = order.type === "buy";

            return (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 rounded-xl bg-[#151d2d] border border-[#1d2639] hover:border-[#252f45] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: isBuy ? "rgba(0,212,161,0.1)" : "rgba(244,67,54,0.1)" }}
                  >
                    <Icon
                      icon={isBuy ? "mdi:arrow-down-left" : "mdi:arrow-up-right"}
                      width={20}
                      style={{ color: isBuy ? "#00d4a1" : "#F44336" }}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white capitalize text-sm">{order.type}</span>
                      <span className="text-penny-text-muted text-xs">{order.symbol}</span>
                    </div>
                    <p className="text-[11px] text-penny-text-disabled mt-0.5">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-bold text-white text-sm">
                    {parseFloat(order.units.toFixed(6))} {order.symbol}
                  </p>
                  <div className="mt-1 flex items-center justify-end gap-2">
                    <span className="text-[11px] font-semibold" style={{ color: isBuy ? "#00d4a1" : "#4CAF50" }}>
                      {isBuy ? "-" : "+"}{formatUSD(order.type === "buy" ? order.totalCost : order.netReceive)}
                    </span>
                    <span
                      className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                      style={{
                        background: "rgba(76,175,80,0.12)",
                        color: "#4CAF50"
                      }}
                    >
                      Completed
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}