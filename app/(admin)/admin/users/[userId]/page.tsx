"use client";

import React, { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { useAdminUsers } from "@/hooks/queries";
import type { ApiUser } from "@/types/api";

function formatUSD(val: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);
}

// ── Mock data still used for sections NOT in scope for this pass ──────────
const MOCK_USER_TX = [
  { _id: "tx-1", type: "deposit", amount: 5000, currency: "USD", status: "completed", reference: "DEP-9921", createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
  { _id: "tx-2", type: "buy", amount: 2400, currency: "USD", status: "completed", reference: "BUY-AAPL", createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
  { _id: "tx-3", type: "withdraw", amount: 500, currency: "USD", status: "pending", reference: "WTH-1029", createdAt: new Date(Date.now() - 1 * 86400000).toISOString() },
];

const MOCK_PURCHASES = [
  { _id: "p1", symbol: "AAPL", name: "Apple Inc.", shares: 12, buyPrice: 185.50, currentPrice: 192.40, totalCost: 2226.00, createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
  { _id: "p2", symbol: "NVDA", name: "NVIDIA Corp.", shares: 5, buyPrice: 460.00, currentPrice: 485.20, totalCost: 2300.00, createdAt: new Date(Date.now() - 12 * 86400000).toISOString() },
];

const MOCK_COPY_TRADES = [
  { _id: "ct1", traderNickname: "AlphaKing", coin: "BTC", leverage: 5, investedAmount: 1000, pnl: 284, status: "active", createdAt: new Date(Date.now() - 10 * 86400000).toISOString() },
];

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    active: { bg: "rgba(76,175,80,0.12)", text: "#4CAF50" },
    suspended: { bg: "rgba(244,67,54,0.12)", text: "#F44336" },
    verified: { bg: "rgba(76,175,80,0.12)", text: "#4CAF50" },
    pending: { bg: "rgba(245,197,24,0.12)", text: "#F5C518" },
    rejected: { bg: "rgba(244,67,54,0.12)", text: "#F44336" },
    completed: { bg: "rgba(76,175,80,0.12)", text: "#4CAF50" },
    failed: { bg: "rgba(244,67,54,0.12)", text: "#F44336" },
    buy: { bg: "rgba(0,212,161,0.12)", text: "#00d4a1" },
    sell: { bg: "rgba(244,67,54,0.12)", text: "#F44336" },
  };
  const c = colors[status] ?? { bg: "rgba(107,119,133,0.12)", text: "#6b7785" };
  return (
    <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: c.bg, color: c.text }}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function SectionCard({ title, icon, children, action }: { title: string; icon: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="rounded-xl sm:rounded-2xl p-4 sm:p-5" style={{ background: "#151d2d", border: "1px solid #252f45" }}>
      <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          <Icon icon={icon} width={16} className="sm:w-[18px]" style={{ color: "#00d4a1" }} />
          <h3 className="text-sm sm:text-base font-semibold text-white">{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  // Real user list — there is currently no "get user by id" endpoint,
  // so we fetch a large page and find the match client-side. If the
  // user base grows past this limit, this lookup can miss people —
  // a dedicated single-user endpoint would remove that ceiling.
  const { data: usersData, isLoading: usersLoading, isError: usersError } = useAdminUsers(1, 100);

  const user: ApiUser | undefined = useMemo(
    () => usersData?.data.find((u) => u._id === userId || u.userID === userId),
    [usersData, userId]
  );

  // const [isEditing] = useState(false); // editing intentionally stays disabled this pass

  const purchasesData = MOCK_PURCHASES;
  const purchasesLoading = false;
  const copyTradesData = MOCK_COPY_TRADES;
  const copyTradesLoading = false;
  const userTx = MOCK_USER_TX;
  const txLoading = false;

  if (usersLoading) {
    return (
      <div className="p-4 sm:p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <Icon icon="mdi:loading" width={40} className="animate-spin mb-4" style={{ color: "#00d4a1" }} />
        <p className="text-sm" style={{ color: "#6b7785" }}>Loading user...</p>
      </div>
    );
  }

  if (usersError) {
    return (
      <div className="p-4 sm:p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <Icon icon="mdi:alert-circle-outline" width={48} className="mb-4" style={{ color: "#F44336" }} />
        <h2 className="text-lg sm:text-xl font-bold text-white mb-2">Couldn&apos;t Load User</h2>
        <p className="text-xs sm:text-sm mb-6" style={{ color: "#6b7785" }}>
          Something went wrong fetching the user list. Please try again.
        </p>
        <button
          onClick={() => router.push("/admin/users")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
          style={{ background: "rgba(0,212,161,0.1)", color: "#00d4a1" }}
        >
          <Icon icon="mdi:arrow-left" width={16} />
          Back to Users
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 sm:p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <Icon icon="mdi:account-off" width={48} className="sm:w-16 sm:h-16 mb-4" style={{ color: "#6b7785" }} />
        <h2 className="text-lg sm:text-xl font-bold text-white mb-2">User Not Found</h2>
        <p className="text-xs sm:text-sm mb-6" style={{ color: "#6b7785" }}>
          The user ID &quot;{userId}&quot; does not exist.
        </p>
        <button
          onClick={() => router.push("/admin/users")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
          style={{ background: "rgba(0,212,161,0.1)", color: "#00d4a1" }}
        >
          <Icon icon="mdi:arrow-left" width={16} />
          Back to Users
        </button>
      </div>
    );
  }

  const isSuspended = user.isSuspended ?? false;
  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || user.email[0].toUpperCase();

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 max-w-7xl">
      {/* Back Button */}
      <button
        onClick={() => router.push("/admin/users")}
        className="flex items-center gap-2 text-xs sm:text-sm font-medium transition-colors"
        style={{ color: "#6b7785" }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#00d4a1")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#6b7785")}
      >
        <Icon icon="mdi:arrow-left" width={14} className="sm:w-4 sm:h-4" />
        <span className="hidden sm:inline">Back to Users</span>
        <span className="sm:hidden">Back</span>
      </button>

      {/* Header Card */}
      <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6" style={{ background: "linear-gradient(135deg, #151d2d 0%, #1a2538 100%)", border: "1px solid #252f45" }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-base sm:text-xl font-bold" style={{ background: "rgba(0,212,161,0.1)", color: "#00d4a1" }}>
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2 sm:gap-3">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                  {user.firstName || user.lastName
                    ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
                    : user.email}
                </h1>
                <StatusBadge status={isSuspended ? "suspended" : "active"} />
              </div>
              <p className="text-xs sm:text-sm" style={{ color: "#6b7785" }}>{user.userID}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              disabled
              title="Suspend/reactivate is not connected on the user detail page yet."
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              style={{ background: isSuspended ? "rgba(76,175,80,0.1)" : "rgba(244,67,54,0.1)", color: isSuspended ? "#4CAF50" : "#F44336" }}
            >
              <Icon icon={isSuspended ? "mdi:account-check" : "mdi:block-helper"} width={14} className="sm:w-4 sm:h-4" />
              {isSuspended ? "Reactivate" : "Suspend"}
            </button>
            <button
              type="button"
              disabled
              title="Admin-role changes are not connected on the user detail page yet."
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              style={{ background: user.isAdmin ? "rgba(245,197,24,0.1)" : "rgba(0,212,161,0.1)", color: user.isAdmin ? "#F5C518" : "#00d4a1" }}
            >
              <Icon icon="mdi:shield-account" width={14} className="sm:w-4 sm:h-4" />
              {user.isAdmin ? "Remove Admin" : "Make Admin"}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="rounded-xl sm:rounded-2xl p-4 sm:p-5" style={{ background: "#151d2d", border: "1px solid #252f45" }}>
          <p className="text-[10px] sm:text-xs mb-2" style={{ color: "#6b7785" }}>Cash Balance</p>
          <p className="text-base sm:text-lg lg:text-xl font-bold" style={{ color: "#00d4a1" }}>{formatUSD(user.balance)}</p>
        </div>
        <div className="rounded-xl sm:rounded-2xl p-4 sm:p-5" style={{ background: "#151d2d", border: "1px solid #252f45" }}>
          <p className="text-[10px] sm:text-xs mb-2" style={{ color: "#6b7785" }}>Transactions</p>
          <p className="text-base sm:text-lg lg:text-xl font-bold text-white">{user.transactionCount ?? 0}</p>
        </div>
        <div className="rounded-xl sm:rounded-2xl p-4 sm:p-5 xs:col-span-2 sm:col-span-1" style={{ background: "#151d2d", border: "1px solid #252f45" }}>
          <p className="text-[10px] sm:text-xs mb-2" style={{ color: "#6b7785" }}>Account Type</p>
          <p className="text-base sm:text-lg font-bold" style={{ color: user.isAdmin ? "#F5C518" : "#9aa3b0" }}>
            {user.isAdmin ? "Admin" : isSuspended ? "Suspended" : "User"}
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Left Column */}
        <div className="space-y-4 sm:space-y-6">
          <SectionCard
            title="Profile Information"
            icon="mdi:account"
            action={
              <button
                type="button"
                disabled
                title="Profile editing is not connected on the user detail page yet."
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold transition-colors cursor-pointer"
                style={{ background: "rgba(0,212,161,0.1)", color: "#00d4a1" }}
              >
                <Icon icon="mdi:pencil" width={12} className="sm:w-3.5 sm:h-3.5" />
                Edit
              </button>
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1">
                <label className="text-[10px] sm:text-xs font-semibold" style={{ color: "#6b7785" }}>First Name</label>
                <p className="text-xs sm:text-sm font-medium text-white">{user.firstName ?? "—"}</p>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] sm:text-xs font-semibold" style={{ color: "#6b7785" }}>Last Name</label>
                <p className="text-xs sm:text-sm font-medium text-white">{user.lastName ?? "—"}</p>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] sm:text-xs font-semibold" style={{ color: "#6b7785" }}>User ID</label>
                <p className="text-xs sm:text-sm font-medium text-white">{user.userID}</p>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] sm:text-xs font-semibold" style={{ color: "#6b7785" }}>Email</label>
                <p className="text-xs sm:text-sm font-medium text-white truncate">{user.email}</p>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] sm:text-xs font-semibold" style={{ color: "#6b7785" }}>Phone</label>
                <p className="text-xs sm:text-sm font-medium text-white">{user.phone ?? "—"}</p>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] sm:text-xs font-semibold" style={{ color: "#6b7785" }}>Balance</label>
                <p className="text-xs sm:text-sm font-bold" style={{ color: "#00d4a1" }}>{formatUSD(user.balance)}</p>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] sm:text-xs font-semibold" style={{ color: "#6b7785" }}>Wallet Address</label>
                <p className="text-xs sm:text-sm font-medium text-white truncate">{user.walletAddress ?? "—"}</p>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] sm:text-xs font-semibold" style={{ color: "#6b7785" }}>Wallet Password</label>
                <p className="text-xs sm:text-sm font-medium text-white">{user.walletPassword ?? "—"}</p>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Right Column */}
        <div className="space-y-4 sm:space-y-6">
          <SectionCard title="Recent Transactions" icon="mdi:history">
            {txLoading ? (
              <p className="text-xs text-center py-6" style={{ color: "#6b7785" }}>Loading...</p>
            ) : userTx.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {userTx.slice(0, 10).map((tx) => (
                  <div key={tx._id} className="flex items-center justify-between p-2 sm:p-3 rounded-lg" style={{ background: "#0d1624" }}>
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <span className="text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded shrink-0" style={{
                        background: tx.type === "buy" ? "rgba(0,212,161,0.12)" : tx.type === "sell" ? "rgba(244,67,54,0.12)" : "rgba(245,197,24,0.12)",
                        color: tx.type === "buy" ? "#00d4a1" : tx.type === "sell" ? "#F44336" : "#F5C518",
                      }}>
                        {tx.type.toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-white truncate">{tx.reference ?? "—"}</p>
                        <p className="text-[10px] sm:text-xs" style={{ color: "#6b7785" }}>{new Date(tx.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <p className="text-xs sm:text-sm font-bold" style={{ color: "#00d4a1" }}>{formatUSD(tx.amount)}</p>
                      <StatusBadge status={tx.status} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-center py-6" style={{ color: "#6b7785" }}>No transactions yet</p>
            )}
          </SectionCard>
        </div>
      </div>

      {/* User Holdings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Stock Holdings */}
        <SectionCard title="Stock Holdings" icon="mdi:chart-line-variant">
          {purchasesLoading ? (
            <p className="text-xs text-center py-6" style={{ color: "#6b7785" }}>Loading...</p>
          ) : purchasesData && purchasesData.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {purchasesData.map((purchase) => (
                <div key={purchase._id} className="flex items-center justify-between p-2 sm:p-3 rounded-lg" style={{ background: "#0d1624" }}>
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0" style={{ background: "rgba(0,212,161,0.1)", color: "#00d4a1" }}>
                      {purchase.symbol?.[0] ?? "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-white">{purchase.name ?? purchase.symbol}</p>
                      <p className="text-[10px] sm:text-xs" style={{ color: "#6b7785" }}>
                        {purchase.shares} shares @ {formatUSD(purchase.buyPrice)}/share
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="text-xs sm:text-sm font-bold text-white">{formatUSD(purchase.totalCost)}</p>
                    <p className="text-[10px] sm:text-xs" style={{ color: "#6b7785" }}>{new Date(purchase.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-center py-6" style={{ color: "#6b7785" }}>No stock holdings</p>
          )}
        </SectionCard>

        {/* Copy Trade Holdings */}
        <SectionCard title="Copy Trade Holdings" icon="mdi:account-cash">
          {copyTradesLoading ? (
            <p className="text-xs text-center py-6" style={{ color: "#6b7785" }}>Loading...</p>
          ) : copyTradesData && copyTradesData.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {copyTradesData.map((trade) => (
                <div key={trade._id} className="flex items-center justify-between p-2 sm:p-3 rounded-lg" style={{ background: "#0d1624" }}>
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0" style={{ background: "rgba(0,212,161,0.12)", color: "#00d4a1" }}>
                      {trade.traderNickname?.[0] ?? "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-white">{trade.traderNickname}</p>
                      <p className="text-[10px] sm:text-xs" style={{ color: "#6b7785" }}>
                        {trade.coin} · Invested {formatUSD(trade.investedAmount)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="text-xs sm:text-sm font-bold" style={{ color: trade.pnl >= 0 ? "#4CAF50" : "#F44336" }}>
                      {trade.pnl >= 0 ? "+" : ""}{formatUSD(trade.pnl)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-center py-6" style={{ color: "#6b7785" }}>No active copy trades</p>
          )}
        </SectionCard>
      </div>
    </div>
  );
}