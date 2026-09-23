"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAdminUsers } from "@/hooks/queries";
import { useUpdateUser, useToggleUserSuspend, useToggleUserAdmin } from "@/hooks/queries/useAdminActions";
import { adminApi } from "@/lib/api/backend";
import type { ApiUser, StockPurchase, CopyTradePurchase } from "@/types/api";

function formatUSD(val: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);
}

// (No mock data remains — all sections now use real API calls)

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

  // One-time cleanup: scrub any stale 0-valued balance overrides that may have
  // been written to localStorage by a previous save before portfolio data loaded.
  useEffect(() => {
    if (!userId || typeof window === "undefined") return;
    const keys = [`user_override_${userId}`];
    keys.forEach((key) => {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return;
        const override = JSON.parse(raw);
        let changed = false;
        (["copyTradeBalance", "copyTradeWalletBalance", "balance"] as const).forEach((field) => {
          if (field in override && override[field] === 0) {
            delete override[field];
            changed = true;
          }
        });
        if (changed) {
          if (Object.keys(override).length === 0) {
            localStorage.removeItem(key);
          } else {
            localStorage.setItem(key, JSON.stringify(override));
          }
        }
      } catch {
        // ignore
      }
    });
  }, [userId]);

  const user: ApiUser | undefined = useMemo(() => {
    const raw = usersData?.data.find((u) => u._id === userId || u.userID === userId);
    if (!raw) return undefined;
    if (typeof window === "undefined") return raw;
    try {
      const rawOverride = localStorage.getItem(`user_override_${raw._id}`) || localStorage.getItem(`user_override_${raw.userID}`);
      if (rawOverride) {
        const override = JSON.parse(rawOverride);
        // Don't let 0 form-defaults overwrite real non-zero API values
        const safeOverride = Object.fromEntries(
          Object.entries(override).filter(([_, v]) => {
            if (typeof v === "number") return v !== 0;
            return v !== null && v !== undefined && v !== "";
          })
        );
        return { ...raw, ...safeOverride };
      }
    } catch {
      // ignore
    }
    return raw;
  }, [usersData, userId]);



  // ── Edit state ───────────────────────────────────────────────────────────
  // Declared before the early returns so every render calls hooks in the same order.
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    balance: "0",
    copyTradeBalance: "0",
    walletAddress: "",
    email: "",
    profileImage: "",
    walletPassword: "",
  });
  const [editError, setEditError] = useState("");

  const updateMut = useUpdateUser();
  const suspendMut = useToggleUserSuspend();
  const adminMut = useToggleUserAdmin();
  const qc = useQueryClient();

  const openEdit = () => {
    setEditForm({
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      phone: user?.phone ?? "",
      balance: String(user?.balance ?? 0),
      // Pre-fill with the same value shown in the stats card
      copyTradeBalance: String(resolvedCopyTradeBalance),
      walletAddress: user?.walletAddress ?? "",
      email: user?.email ?? "",
      profileImage: user?.profileImage ?? "",
      walletPassword: user?.walletPassword ?? "",
    });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    setEditError("");
    try {
      const newBalance = Number(editForm.balance) || 0;
      const newCopyTradeBalance = Number(editForm.copyTradeBalance) || 0;

      // 1. Update user record (balance, profile fields, etc.)
      await updateMut.mutateAsync({
        id: user?._id ?? "",
        data: {
          firstName: editForm.firstName || undefined,
          lastName: editForm.lastName || undefined,
          email: editForm.email || undefined,
          phone: editForm.phone || undefined,
          balance: newBalance,
          copyTradeBalance: newCopyTradeBalance,
          copyTradeWalletBalance: newCopyTradeBalance,
          walletAddress: editForm.walletAddress || undefined,
          profileImage: editForm.profileImage || undefined,
          walletPassword: editForm.walletPassword || undefined,
        },
      });

      // 2. Update the copy-trade portfolio record (separate backend document).
      //    Writing to the user record alone does NOT change the portfolio balance
      //    because resolvedCopyTradeBalance prefers the portfolio record.
      try {
        const portfolio = await adminApi.copyTradingPortfolio(userId);
        if (portfolio?._id) {
          await adminApi.updateCopyTradingPortfolio(portfolio._id, {
            balance: newCopyTradeBalance,
          });
        }
      } catch {
        // Portfolio may not exist yet for this user — that's fine.
      }

      // 3. Refresh the portfolio query so the admin stats card shows the new value.
      qc.invalidateQueries({ queryKey: ["admin", "user-copy-trade-portfolio", userId] });

      setEditOpen(false);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Failed to update user.");
    }
  };

  const handleEditBackdrop: React.MouseEventHandler<HTMLDivElement> = () => {
    if (!updateMut.isPending) setEditOpen(false);
  };

  // Real stock holdings and copy trade holdings via admin per-user endpoints
  const { data: stockPurchasesData, isLoading: purchasesLoading } = useQuery({
    queryKey: ["admin", "user-stock-purchases", userId],
    queryFn: () => adminApi.userStockPurchases(userId, { limit: 50 }),
    enabled: !!userId,
  });
  const { data: copyTradePurchasesData, isLoading: copyTradesLoading } = useQuery({
    queryKey: ["admin", "user-copy-trade-purchases", userId],
    queryFn: () => adminApi.userCopyTradePurchases(userId, { limit: 50 }),
    enabled: !!userId,
  });

  const purchasesData: StockPurchase[] = stockPurchasesData?.data ?? [];
  const copyTradesData: CopyTradePurchase[] = copyTradePurchasesData?.data ?? [];

  // Fetch the user's copy-trade portfolio (balance, totalDeposited, etc.)
  // using the same portfolio structure as copyTradingApi.portfolio() on the user side.
  const { data: copyTradePortfolio, isLoading: portfolioLoading } = useQuery({
    queryKey: ["admin", "user-copy-trade-portfolio", userId],
    queryFn: async () => {
      // The admin endpoint fetches all portfolios, so we fetch the list and find this user's portfolio.
      const res = await adminApi.copyTradingPortfolios(1, 100);
      const portfolio = res.data.find(p => 
        p.userId === userId || 
        (typeof p.userId === 'object' && (p.userId as { _id: string })._id === userId)
      );
      return portfolio || null;
    },
    enabled: !!userId,
  });

  // Resolved copy-trade wallet balance:
  // 1. Portfolio balance from the dedicated endpoint (most accurate)
  // 2. Explicit field on user object (set via admin edit + localStorage override)
  const resolvedCopyTradeBalance = (() => {
    if (typeof copyTradePortfolio?.balance === "number") return copyTradePortfolio.balance;
    const fromUser = user?.copyTradeBalance ?? user?.copyTradeWalletBalance;
    if (typeof fromUser === "number") return fromUser;
    return 0;
  })();
  const copyTradeBalanceLoading = portfolioLoading;

  const { data: txData, isLoading: txLoading } = useQuery({
    queryKey: ["admin", "user-transactions", userId],
    queryFn: async () => {
      // The admin endpoint /admin/transactions doesn't accept userId as a query parameter,
      // so we fetch the recent list and filter it client-side for this user.
      const res = await adminApi.transactions(1, 100);
      const filtered = (res.data ?? []).filter(t => 
        t.userId === userId || 
        (typeof t.userId === 'object' && (t.userId as { _id: string })._id === userId)
      );
      return { ...res, data: filtered };
    },
    enabled: !!userId,
  });
  const userTx = txData?.data ?? [];

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
    <>
      {/* Edit Modal */}
      {editOpen && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/80" onClick={handleEditBackdrop} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] w-[95%] sm:w-[400px] max-h-[90vh] overflow-y-auto rounded-2xl p-5 sm:p-6"
            style={{ background: "#151d2d", border: "1px solid #252f45" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Edit User</h2>
              <button
                onClick={() => setEditOpen(false)}
                className="p-2 rounded-lg"
                style={{ background: "#0d1624" }}
              >
                <Icon icon="mdi:close" width={18} style={{ color: "#9aa3b0" }} />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); saveEdit(); }} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] sm:text-xs font-semibold" style={{ color: "#6b7785" }}>First Name</label>
                <input
                  value={editForm.firstName}
                  onChange={(e) => setEditForm(f => ({ ...f, firstName: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm"
                  style={{ background: "#0d1624", border: "1px solid #252f45", color: "white" }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] sm:text-xs font-semibold" style={{ color: "#6b7785" }}>Last Name</label>
                <input
                  value={editForm.lastName}
                  onChange={(e) => setEditForm(f => ({ ...f, lastName: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm"
                  style={{ background: "#0d1624", border: "1px solid #252f45", color: "white" }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] sm:text-xs font-semibold" style={{ color: "#6b7785" }}>Phone</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm"
                  style={{ background: "#0d1624", border: "1px solid #252f45", color: "white" }}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-[10px] sm:text-xs font-semibold" style={{ color: "#6b7785" }}>Cash Balance ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.balance}
                    onChange={(e) => setEditForm(f => ({ ...f, balance: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm"
                    style={{ background: "#0d1624", border: "1px solid #252f45", color: "white" }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] sm:text-xs font-semibold" style={{ color: "#6b7785" }}>Copy-Trade Wallet ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.copyTradeBalance}
                    onChange={(e) => setEditForm(f => ({ ...f, copyTradeBalance: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm"
                    style={{ background: "#0d1624", border: "1px solid #252f45", color: "white" }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] sm:text-xs font-semibold" style={{ color: "#6b7785" }}>Wallet Address</label>
                <input
                  value={editForm.walletAddress}
                  onChange={(e) => setEditForm(f => ({ ...f, walletAddress: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm"
                  style={{ background: "#0d1624", border: "1px solid #252f45", color: "white" }}
                />
              </div>
              {editError && (
                <div className="flex items-start gap-2 p-3 rounded-xl text-xs"
                  style={{ background: "rgba(244,67,54,0.1)", border: "1px solid rgba(244,67,54,0.3)", color: "#F44336" }}>
                  <Icon icon="mdi:alert-circle" width={16} className="shrink-0 mt-0.5" />
                  <span>{editError}</span>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="flex-1 py-3 rounded-xl font-bold"
                  style={{ background: "#0d1624", color: "#9aa3b0", border: "1px solid #252f45" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMut.isPending}
                  className="flex-1 py-3 rounded-xl font-bold"
                  style={{ background: "#00d4a1", color: "#0d1624" }}
                >
                  {updateMut.isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

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
              onClick={() => suspendMut.mutate({ id: user._id, isSuspended: !isSuspended })}
              disabled={suspendMut.isPending}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:opacity-60"
              style={{ background: isSuspended ? "rgba(76,175,80,0.1)" : "rgba(244,67,54,0.1)", color: isSuspended ? "#4CAF50" : "#F44336" }}
            >
              {suspendMut.isPending
                ? <Icon icon="mdi:loading" width={14} className="animate-spin" />
                : <Icon icon={isSuspended ? "mdi:account-check" : "mdi:block-helper"} width={14} className="sm:w-4 sm:h-4" />}
              {isSuspended ? "Reactivate" : "Suspend"}
            </button>
            <button
              type="button"
              onClick={() => adminMut.mutate({ id: user._id, isAdmin: !user.isAdmin })}
              disabled={adminMut.isPending}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:opacity-60"
              style={{ background: user.isAdmin ? "rgba(245,197,24,0.1)" : "rgba(0,212,161,0.1)", color: user.isAdmin ? "#F5C518" : "#00d4a1" }}
            >
              {adminMut.isPending
                ? <Icon icon="mdi:loading" width={14} className="animate-spin" />
                : <Icon icon="mdi:shield-account" width={14} className="sm:w-4 sm:h-4" />}
              {user.isAdmin ? "Remove Admin" : "Make Admin"}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-xl sm:rounded-2xl p-4 sm:p-5" style={{ background: "#151d2d", border: "1px solid #252f45" }}>
          <p className="text-[10px] sm:text-xs mb-2" style={{ color: "#6b7785" }}>Cash Balance</p>
          <p className="text-sm sm:text-base lg:text-lg font-bold" style={{ color: "#00d4a1" }}>{formatUSD(user.balance)}</p>
        </div>
        <div className="rounded-xl sm:rounded-2xl p-4 sm:p-5" style={{ background: "#151d2d", border: "1px solid #252f45" }}>
          <p className="text-[10px] sm:text-xs mb-2" style={{ color: "#6b7785" }}>Copy-Trade Wallet</p>
          <p className="text-sm sm:text-base lg:text-lg font-bold" style={{ color: copyTradeBalanceLoading ? "#6b7785" : "#a78bfa" }}>
            {copyTradeBalanceLoading ? "…" : formatUSD(resolvedCopyTradeBalance)}
          </p>
        </div>
        <div className="rounded-xl sm:rounded-2xl p-4 sm:p-5" style={{ background: "#151d2d", border: "1px solid #252f45" }}>
          <p className="text-[10px] sm:text-xs mb-2" style={{ color: "#6b7785" }}>Transactions</p>
          <p className="text-sm sm:text-base lg:text-lg font-bold text-white">{user.transactionCount ?? 0}</p>
        </div>
        <div className="rounded-xl sm:rounded-2xl p-4 sm:p-5" style={{ background: "#151d2d", border: "1px solid #252f45" }}>
          <p className="text-[10px] sm:text-xs mb-2" style={{ color: "#6b7785" }}>Account Type</p>
          <p className="text-sm sm:text-base font-bold" style={{ color: user.isAdmin ? "#F5C518" : "#9aa3b0" }}>
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
                onClick={openEdit}
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
                <label className="text-[10px] sm:text-xs font-semibold" style={{ color: "#6b7785" }}>Cash Balance</label>
                <p className="text-xs sm:text-sm font-bold" style={{ color: "#00d4a1" }}>{formatUSD(user.balance)}</p>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] sm:text-xs font-semibold" style={{ color: "#6b7785" }}>Copy-Trade Wallet</label>
                <p className="text-xs sm:text-sm font-bold" style={{ color: "#a78bfa" }}>
                  {copyTradeBalanceLoading ? "…" : formatUSD(resolvedCopyTradeBalance)}
                </p>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] sm:text-xs font-semibold" style={{ color: "#6b7785" }}>Wallet Address</label>
                <p className="text-xs sm:text-sm font-medium text-white truncate">{user.walletAddress ?? "—"}</p>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Right Column */}
        <div className="space-y-4 sm:space-y-6">
          <SectionCard title="Recent Transactions" icon="mdi:history"
            action={
              txLoading ? undefined :
              <span className="text-[10px] sm:text-xs font-semibold px-2 py-1 rounded-lg" style={{ background: "#0d1624", color: "#6b7785" }}>
                {userTx.length} tx
              </span>
            }
          >
            {txLoading ? (
              <div className="flex items-center justify-center py-8 gap-2" style={{ color: "#6b7785" }}>
                <Icon icon="mdi:loading" width={18} className="animate-spin" />
                <span className="text-xs">Loading...</span>
              </div>
            ) : userTx.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {userTx.map((tx) => {
                  const typeColor =
                    tx.type === "buy" ? { bg: "rgba(0,212,161,0.12)", text: "#00d4a1" }
                    : tx.type === "sell" ? { bg: "rgba(244,67,54,0.12)", text: "#F44336" }
                    : tx.type === "deposit" ? { bg: "rgba(76,175,80,0.12)", text: "#4CAF50" }
                    : tx.type === "withdraw" ? { bg: "rgba(244,67,54,0.12)", text: "#F44336" }
                    : { bg: "rgba(245,197,24,0.12)", text: "#F5C518" };
                  return (
                    <div key={tx._id} className="flex items-center justify-between p-2 sm:p-3 rounded-lg" style={{ background: "#0d1624" }}>
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <span className="text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded shrink-0" style={{ background: typeColor.bg, color: typeColor.text }}>
                          {tx.type.toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-white truncate">
                            {tx.reference ?? tx.transactionID ?? "—"}
                          </p>
                          <p className="text-[10px] sm:text-xs" style={{ color: "#6b7785" }}>
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <p className="text-xs sm:text-sm font-bold" style={{ color: tx.type === "withdraw" || tx.type === "sell" ? "#F44336" : "#00d4a1" }}>
                          {tx.type === "withdraw" || tx.type === "sell" ? "-" : "+"}{formatUSD(tx.amount)}
                        </p>
                        <StatusBadge status={tx.status} />
                      </div>
                    </div>
                  );
                })}
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
        <SectionCard title="Stock Holdings" icon="mdi:chart-line-variant"
          action={
            purchasesLoading ? undefined :
            <span className="text-[10px] sm:text-xs font-semibold px-2 py-1 rounded-lg" style={{ background: "#0d1624", color: "#6b7785" }}>
              {purchasesData.length} holding{purchasesData.length !== 1 ? "s" : ""}
            </span>
          }
        >
          {purchasesLoading ? (
            <div className="flex items-center justify-center py-8 gap-2" style={{ color: "#6b7785" }}>
              <Icon icon="mdi:loading" width={18} className="animate-spin" />
              <span className="text-xs">Loading...</span>
            </div>
          ) : purchasesData.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {purchasesData.map((purchase) => (
                <div key={purchase._id} className="flex items-center justify-between p-2 sm:p-3 rounded-lg" style={{ background: "#0d1624" }}>
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0" style={{ background: "rgba(0,212,161,0.1)", color: "#00d4a1" }}>
                      {purchase.stockAcronym?.[0] ?? "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-white truncate">{purchase.stockName || purchase.stockAcronym}</p>
                      <p className="text-[10px] sm:text-xs" style={{ color: "#6b7785" }}>
                        {purchase.quantity} shares @ {formatUSD(purchase.pricePerShare)}/share
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="text-xs sm:text-sm font-bold text-white">{formatUSD(purchase.totalAmount)}</p>
                    <p className="text-[10px] sm:text-xs" style={{ color: purchase.status === "closed" ? "#F44336" : "#4CAF50" }}>
                      {purchase.status ?? "open"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-center py-6" style={{ color: "#6b7785" }}>No stock holdings</p>
          )}
        </SectionCard>

        {/* Copy Trade Holdings */}
        <SectionCard title="Copy Trade Holdings" icon="mdi:account-cash"
          action={
            copyTradesLoading ? undefined :
            <span className="text-[10px] sm:text-xs font-semibold px-2 py-1 rounded-lg" style={{ background: "#0d1624", color: "#6b7785" }}>
              {copyTradesData.length} trade{copyTradesData.length !== 1 ? "s" : ""}
            </span>
          }
        >
          {copyTradesLoading ? (
            <div className="flex items-center justify-center py-8 gap-2" style={{ color: "#6b7785" }}>
              <Icon icon="mdi:loading" width={18} className="animate-spin" />
              <span className="text-xs">Loading...</span>
            </div>
          ) : copyTradesData.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {copyTradesData.map((trade) => {
                const isActive = trade.status !== "liquidated";
                return (
                  <div key={trade._id} className="flex items-center justify-between p-2 sm:p-3 rounded-lg" style={{ background: "#0d1624" }}>
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0" style={{ background: "rgba(0,212,161,0.12)", color: "#00d4a1" }}>
                        {trade.traderName?.[0] ?? "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-white truncate">{trade.traderName}</p>
                        <p className="text-[10px] sm:text-xs" style={{ color: "#6b7785" }}>
                          {trade.riskLevel} risk · {trade.duration} · {trade.percentage}%
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <p className="text-xs sm:text-sm font-bold text-white">{formatUSD(trade.amountInvested)}</p>
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{
                          background: isActive ? "rgba(76,175,80,0.12)" : "rgba(107,119,133,0.12)",
                          color: isActive ? "#4CAF50" : "#6b7785",
                        }}
                      >
                        {trade.status ?? "active"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-center py-6" style={{ color: "#6b7785" }}>No active copy trades</p>
          )}
        </SectionCard>
      </div>
    </div>
  </>
);
}