"use client";

import { Icon } from "@iconify/react";
import { useTransactions } from "@/hooks/queries";
import { useUserProfile } from "@/hooks/queries";
import { formatUSD } from "@/context/PortfolioContext";
import { useMemo } from "react";

interface StatRow {
  label: string;
  value: string;
  change: string;
  up: boolean;
  icon: string;
}

export default function QuickStats() {
  const { data: profile } = useUserProfile();
  const { data: txData } = useTransactions(1, 50);

  const stats: StatRow[] = useMemo(() => {
    const transactions = txData?.data ?? [];
    const totalDeposit = profile?.totalDeposit ?? 0;
    const totalWithdraw = profile?.totalWithdraw ?? 0;
    const balance = profile?.balance ?? 0;
    const txCount = profile?.transactionCount ?? transactions.length;

    return [
      {
        label: "Balance",
        value: formatUSD(balance),
        change: balance > 0 ? "+" : "—",
        up: balance > 0,
        icon: "mdi:wallet-outline",
      },
      {
        label: "Total Deposits",
        value: formatUSD(totalDeposit),
        change: `${totalDeposit > 0 ? "—" : "0"}`,
        up: totalDeposit > 0,
        icon: "mdi:arrow-down-bold-circle-outline",
      },
      {
        label: "Total Withdrawals",
        value: formatUSD(totalWithdraw),
        change: `${totalWithdraw > 0 ? "—" : "0"}`,
        up: false,
        icon: "mdi:arrow-up-bold-circle-outline",
      },
      {
        label: "Transactions",
        value: txCount.toString(),
        change: "—",
        up: true,
        icon: "mdi:receipt-text-outline",
      },
    ];
  }, [profile, txData]);

  return (
    <div
      className="rounded-2xl p-6 h-full border border-[#252f45] flex flex-col"
      style={{ background: "linear-gradient(180deg, #111b2c 0%, #0d1624 100%)" }}
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 rounded-full border border-[#252f45] flex items-center justify-center">
          <Icon icon="mdi:chart-bar" className="text-white" width={18} />
        </div>
        <h2 className="text-base font-semibold text-white">Quick Stats</h2>
      </div>

      <div className="flex flex-col gap-3 flex-1">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/10 shrink-0">
                <Icon icon={stat.icon} className="text-white" width={18} />
              </div>
              <div>
                <p className="text-[11px] text-penny-text-muted leading-none mb-1">
                  {stat.label}
                </p>
                <p className="text-sm font-bold text-white">{stat.value}</p>
              </div>
            </div>
            <span
              className="text-[11px] font-semibold px-2 py-1 rounded-full shrink-0"
              style={{
                color: stat.up ? "#00d4a1" : "#F44336",
                background: stat.up
                  ? "rgba(0, 212, 161, 0.12)"
                  : "rgba(244, 67, 54, 0.12)",
              }}
            >
              {stat.change}
            </span>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-penny-text-muted mt-4 text-center">
        Live · synced with your account
      </p>
    </div>
  );
}
