"use client";

import { Icon } from "@iconify/react";
import { useUserProfile } from "@/hooks/queries";

interface StatRow {
  label: string;
  value: string;
  change: string;
  up: boolean;
  icon: string;
}

function formatUSD(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export default function QuickStats() {
  const { data: profile, isLoading } = useUserProfile();

  const balance = profile?.balance ?? 0;
  const totalDeposits = profile?.totalDeposit ?? 0;
  const totalWithdrawals = profile?.totalWithdraw ?? 0;
  const transactionCount = profile?.transactionCount ?? 0;

  // Growth of the current balance relative to everything the user has deposited.
  // Positive => balance grew beyond deposits (profit/net gains); negative => drawn down.
  const growthPct =
    totalDeposits > 0 ? ((balance - totalDeposits) / totalDeposits) * 100 : 0;
  const growthLabel = `${growthPct >= 0 ? "+" : ""}${growthPct.toFixed(1)}%`;

  const stats: StatRow[] = [
    { label: "Balance",           value: formatUSD(balance),          change: growthLabel, up: growthPct >= 0, icon: "mdi:wallet-outline" },
    { label: "Total Deposits",    value: formatUSD(totalDeposits),    change: "—",         up: true,           icon: "mdi:arrow-down-bold-circle-outline" },
    { label: "Total Withdrawals", value: formatUSD(totalWithdrawals), change: "—",         up: false,          icon: "mdi:arrow-up-bold-circle-outline" },
    { label: "Transactions",      value: String(transactionCount),    change: "—",         up: true,           icon: "mdi:receipt-text-outline" },
  ];

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
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.03] animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/10 shrink-0" />
                  <div>
                    <div className="h-2.5 w-16 rounded bg-white/10 mb-2" />
                    <div className="h-3.5 w-20 rounded bg-white/10" />
                  </div>
                </div>
                <div className="h-5 w-12 rounded-full bg-white/10" />
              </div>
            ))
          : stats.map((stat, i) => (
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
        Updated live from your account
      </p>
    </div>
  );
}
