"use client";

import { useTransactions } from "@/hooks/queries";
import { formatUSD } from "@/context/PortfolioContext";
import { Icon } from "@iconify/react";

export default function TransactionList() {
  const { data: txData, isLoading } = useTransactions(1, 20);

  const transactions = txData?.data ?? [];

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

      {isLoading ? (
        <div className="py-12 text-center">
          <p className="text-sm text-penny-text-muted">Loading transactions...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-[#252f45] rounded-2xl bg-[#151d2d]">
          <Icon icon="mdi:receipt-text-outline" width={32} className="mx-auto text-[#6b7785] mb-3" />
          <p className="text-sm text-[#9aa3b0]">No recent transactions.</p>
          <p className="text-xs text-[#6b7785] mt-1">Completed trades will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => {
            const isDeposit  = tx.type === "deposit";
            const isWithdraw = tx.type === "withdraw";
            const isBuy      = tx.type === "buy";
            const isSell     = tx.type === "sell";
            const isProfit   = tx.type === "profit";
            const isLoss     = tx.type === "loss";
            const isCopy     = tx.type === "copy_trade";

            const icon = isDeposit ? "mdi:arrow-down-left"
              : isWithdraw ? "mdi:arrow-up-right"
              : isBuy ? "mdi:cart-outline"
              : isSell ? "mdi:tag-outline"
              : isCopy ? "mdi:account-copy-outline"
              : isProfit ? "mdi:trending-up"
              : "mdi:swap-horizontal";

            const color = isDeposit || isProfit ? "#00d4a1"
              : isWithdraw || isLoss ? "#F44336"
              : isBuy ? "#F5C518"
              : isSell ? "#4CAF50"
              : "#9aa3b0";

            const label = isDeposit ? "Deposit"
              : isWithdraw ? "Withdrawal"
              : isBuy ? `Buy ${tx.reference || ""}`
              : isSell ? `Sell ${tx.reference || ""}`
              : isCopy ? "Copy Trade"
              : isProfit ? "Profit"
              : isLoss ? "Loss"
              : tx.type;

            return (
              <div
                key={tx._id}
                className="flex items-center justify-between p-4 rounded-xl bg-[#151d2d] border border-[#1d2639] hover:border-[#252f45] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${color}18` }}
                  >
                    <Icon icon={icon} width={20} style={{ color }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white capitalize text-sm">{label}</span>
                      {tx.reference && <span className="text-penny-text-muted text-xs">{tx.reference}</span>}
                    </div>
                    <p className="text-[11px] text-penny-text-disabled mt-0.5">
                      {new Date(tx.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-bold text-sm" style={{ color }}>
                    {isDeposit || isProfit ? "+" : isWithdraw || isLoss ? "-" : ""}
                    {formatUSD(tx.amount)}
                  </p>
                  <div className="mt-1 flex items-center justify-end gap-2">
                    <span
                      className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                      style={{
                        background: `${color}1a`,
                        color,
                      }}
                    >
                      {tx.status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
