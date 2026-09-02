"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { useAdminUsers } from "@/hooks/queries";
import { useToggleUserSuspend } from "@/hooks/queries/useAdminActions";
import { formatUSD } from "@/context/PortfolioContext";

type StatusFilter = "all" | "active" | "suspended";

export default function UsersPage() {
  const router = useRouter();
  const { data: pagesData, isLoading } = useAdminUsers(1, 50);
  const { mutate: toggleSuspend } = useToggleUserSuspend();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const users = pagesData?.data ?? [];

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        !search ||
        u.firstName?.toLowerCase().includes(search.toLowerCase()) ||
        u.lastName?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.userID?.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && !u.isSuspended) ||
        (statusFilter === "suspended" && u.isSuspended);
      return matchSearch && matchStatus;
    });
  }, [users, search, statusFilter]);

  const countByStatus = useMemo(() => ({
    all: users.length,
    active: users.filter(u => !u.isSuspended).length,
    suspended: users.filter(u => u.isSuspended).length,
  }), [users]);

  const handleToggleSuspend = (id: string, currentlySuspended: boolean) => {
    toggleSuspend({ id, isSuspended: !currentlySuspended });
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Users</h1>
        <p className="text-xs sm:text-sm mt-1" style={{ color: "#9aa3b0" }}>
          {isLoading ? "Loading..." : `${users.length} users total`}
        </p>
      </div>

      <div className="relative">
        <Icon icon="mdi:magnify" width={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#6b7785" }} />
        <input
          type="text"
          placeholder="Search by name, email, or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-penny-text-muted outline-none"
          style={{ background: "#151d2d", border: "1px solid #252f45" }}
        />
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
        {(["all", "active", "suspended"] as StatusFilter[]).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className="shrink-0 px-4 py-2 rounded-xl text-xs font-semibold capitalize"
            style={{
              background: statusFilter === s ? "#00d4a1" : "#151d2d",
              color: statusFilter === s ? "#0d1624" : "#9aa3b0",
              border: statusFilter === s ? "none" : "1px solid #252f45",
            }}
          >
            {s} ({countByStatus[s]})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl p-5 animate-pulse" style={{ background: "#151d2d", border: "1px solid #252f45" }}>
              <div className="h-12 w-12 rounded-full bg-white/10 mb-4" />
              <div className="h-4 w-24 bg-white/10 rounded mb-2" />
              <div className="h-3 w-16 bg-white/10 rounded" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="col-span-full text-center py-16 text-penny-text-muted">
            No users found.
          </div>
        ) : (
          filtered.map((user) => {
            const isSuspended = user.isSuspended ?? false;
            const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email;
            const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || user.email[0].toUpperCase();

            return (
              <div
                key={user._id}
                className="rounded-xl sm:rounded-2xl p-4 sm:p-5 flex flex-col gap-3 sm:gap-4 transition-all hover:scale-[1.02] cursor-pointer active:scale-0.98"
                style={{ background: "#151d2d", border: "1px solid #252f45" }}
                onClick={() => router.push(`/admin/users/${user._id}`)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shrink-0"
                      style={{ background: "rgba(0,212,161,0.1)", color: "#00d4a1" }}
                    >
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-white truncate">{name}</p>
                      <p className="text-[10px] sm:text-xs" style={{ color: "#6b7785" }}>{user.userID}</p>
                    </div>
                  </div>
                  <span
                    className="text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full shrink-0"
                    style={{
                      background: isSuspended ? "rgba(245,197,24,0.12)" : "rgba(76,175,80,0.12)",
                      color: isSuspended ? "#F5C518" : "#4CAF50",
                    }}
                  >
                    {isSuspended ? "Suspended" : "Active"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div className="rounded-lg sm:rounded-xl p-2 sm:p-3" style={{ background: "#0d1624" }}>
                    <p className="text-[10px] sm:text-xs mb-0.5" style={{ color: "#6b7785" }}>Balance</p>
                    <p className="text-xs sm:text-sm font-bold" style={{ color: "#00d4a1" }}>
                      {formatUSD(user.balance)}
                    </p>
                  </div>
                  <div className="rounded-lg sm:rounded-xl p-2 sm:p-3" style={{ background: "#0d1624" }}>
                    <p className="text-[10px] sm:text-xs mb-0.5" style={{ color: "#6b7785" }}>Transactions</p>
                    <p className="text-xs sm:text-sm font-bold text-white">{user.transactionCount ?? 0}</p>
                  </div>
                </div>

                <p className="text-xs truncate hidden sm:block" style={{ color: "#9aa3b0" }}>{user.email}</p>

                <div className="flex items-center gap-2 pt-2 sm:pt-2" style={{ borderTop: "1px solid #252f45" }}>
                  <button
                    onClick={(e) =>{ e.stopPropagation(); router.push(`/admin/users/${user._id}`); }}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-semibold transition-colors"
                    style={{ background: "rgba(0,212,161,0.1)", color: "#00d4a1" }}
                  >
                    <Icon icon="mdi:eye" width={12} className="sm:w-3.5 sm:h-3.5" />
                    <span className="hidden xs:inline">View</span>
                  </button>
                  <button
                    onClick={(e) =>{ e.stopPropagation(); router.push(`/admin/users/${user._id}`); }}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-semibold transition-colors"
                    style={{ background: "rgba(0,212,161,0.1)", color: "#00d4a1" }}
                  >
                    <Icon icon="mdi:pencil" width={12} className="sm:w-3.5 sm:h-3.5" />
                    <span className="hidden xs:inline">Edit</span>
                  </button>
                  <button
                    onClick={(e) =>{ e.stopPropagation(); handleToggleSuspend(user._id, isSuspended); }}
                    className="p-1.5 sm:p-2 rounded-lg transition-colors"
                    style={{ background: isSuspended ? "rgba(76,175,80,0.1)" : "rgba(244,67,54,0.1)", color: isSuspended ? "#4CAF50" : "#F44336" }}
                    title={isSuspended ? "Reactivate user" : "Suspend user"}
                  >
                    <Icon icon={isSuspended ? "mdi:account-check" : "mdi:block-helper"} width={12} className="sm:w-3.5 sm:h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
