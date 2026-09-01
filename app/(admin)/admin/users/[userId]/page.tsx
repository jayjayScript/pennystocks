"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { useAdminUsers, useAdminTransactions } from "@/hooks/queries";
import { useToggleUserSuspend, useToggleUserAdmin } from "@/hooks/queries/useAdminActions";
import { formatUSD } from "@/context/PortfolioContext";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

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

function SectionCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl sm:rounded-2xl p-4 sm:p-5" style={{ background: "#151d2d", border: "1px solid #252f45" }}>
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <Icon icon={icon} width={16} className="sm:w-[18px]" style={{ color: "#00d4a1" }} />
        <h3 className="text-sm sm:text-base font-semibold text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  const { data: usersData, isLoading: usersLoading } = useAdminUsers(1, 50);
  const { data: txData, isLoading: txLoading } = useAdminTransactions(1, 50);
  const toggleSuspend = useToggleUserSuspend();
  const toggleAdmin = useToggleUserAdmin();

  const users = usersData?.data ?? [];
  const user = users.find((u) => u._id === userId);

  const userTx = useMemo(() => {
    if (!user || !txData?.data) return [];
    return txData.data.filter((t) => t.email === user.email || t.userId === user.userID);
  }, [user, txData]);

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || user.email[0].toUpperCase()
    : "?";

  const handleSuspend = () => {
    if (!user) return;
    toggleSuspend.mutate({ id: user._id, isSuspended: !user.isSuspended });
  };

  const handleToggleAdmin = () => {
    if (!user) return;
    toggleAdmin.mutate({ id: user._id, isAdmin: !user.isAdmin });
  };

  if (usersLoading) {
    return (
      <div className="p-4 sm:p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <p style={{ color: "#6b7785" }}>Loading user...</p>
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
              onClick={handleSuspend}
              disabled={toggleSuspend.isPending}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors"
              style={{ background: isSuspended ? "rgba(76,175,80,0.1)" : "rgba(244,67,54,0.1)", color: isSuspended ? "#4CAF50" : "#F44336" }}
            >
              <Icon icon={isSuspended ? "mdi:account-check" : "mdi:block-helper"} width={14} className="sm:w-4 sm:h-4" />
              {isSuspended ? "Reactivate" : "Suspend"}
            </button>
            <button
              onClick={handleToggleAdmin}
              disabled={toggleAdmin.isPending}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors"
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
          <SectionCard title="Profile Information" icon="mdi:account">
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
    </div>
  );
}
