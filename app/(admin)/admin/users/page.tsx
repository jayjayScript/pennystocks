"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";

const mockUsers = [
  { id: "USR-1024", name: "John Smith", email: "john@example.com", balance: 24500, stocks: 5, joinDate: "2024-01-15", status: "active" },
  { id: "USR-1025", name: "Sarah Johnson", email: "sarah@example.com", balance: 83200, stocks: 12, joinDate: "2024-01-18", status: "active" },
  { id: "USR-1026", name: "Michael Chen", email: "michael@example.com", balance: 15200, stocks: 3, joinDate: "2024-02-01", status: "active" },
  { id: "USR-1027", name: "Emily Davis", email: "emily@example.com", balance: 45800, stocks: 8, joinDate: "2024-02-10", status: "frozen" },
  { id: "USR-1028", name: "Robert Wilson", email: "robert@example.com", balance: 9800, stocks: 2, joinDate: "2024-02-15", status: "active" },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(amount);
}

export default function UsersPage() {
  const router = useRouter();

  return (
    <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
      {/* Header Section */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Users</h1>
        <p className="text-xs sm:text-sm mt-1" style={{ color: "#9aa3b0" }}>Manage all users</p>
      </div>

      {/* Search/Filter Bar */}
      <div className="relative">
        <Icon icon="mdi:magnify" width={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#6b7785" }} />
        <input
          type="text"
          placeholder="Search users..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-penny-text-muted outline-none"
          style={{ background: "#151d2d", border: "1px solid #252f45" }}
        />
      </div>

      {/* Stats Summary */}
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
        <button className="shrink-0 px-4 py-2 rounded-xl text-xs font-semibold" style={{ background: "#00d4a1", color: "#0d1624" }}>
          All ({mockUsers.length})
        </button>
        <button className="shrink-0 px-4 py-2 rounded-xl text-xs font-semibold" style={{ background: "#151d2d", color: "#9aa3b0", border: "1px solid #252f45" }}>
          Active ({mockUsers.filter(u => u.status === "active").length})
        </button>
        <button className="shrink-0 px-4 py-2 rounded-xl text-xs font-semibold" style={{ background: "#151d2d", color: "#9aa3b0", border: "1px solid #252f45" }}>
          Frozen ({mockUsers.filter(u => u.status === "frozen").length})
        </button>
      </div>

      {/* Grid - 1 col on mobile, 2 on sm, 3 on lg, 4 on xl */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {mockUsers.map((user) => (
          <div
            key={user.id}
            className="rounded-xl sm:rounded-2xl p-4 sm:p-5 flex flex-col gap-3 sm:gap-4 transition-all hover:scale-[1.02] cursor-pointer active:scale-[0.98]"
            style={{ background: "#151d2d", border: "1px solid #252f45" }}
            onClick={() => router.push(`/admin/users/${user.id}`)}
          >
            {/* Header: Avatar + Name + Status */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shrink-0" style={{ background: "rgba(0,212,161,0.1)", color: "#00d4a1" }}>
                  {user.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-white truncate">{user.name}</p>
                  <p className="text-[10px] sm:text-xs" style={{ color: "#6b7785" }}>{user.id}</p>
                </div>
              </div>
              <span className="text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full shrink-0" style={{ background: user.status === "active" ? "rgba(76,175,80,0.12)" : "rgba(245,197,24,0.12)", color: user.status === "active" ? "#4CAF50" : "#F5C518" }}>
                {user.status === "active" ? "Active" : "Frozen"}
              </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className="rounded-lg sm:rounded-xl p-2 sm:p-3" style={{ background: "#0d1624" }}>
                <p className="text-[10px] sm:text-xs mb-0.5" style={{ color: "#6b7785" }}>Balance</p>
                <p className="text-xs sm:text-sm font-bold" style={{ color: "#00d4a1" }}>{formatCurrency(user.balance)}</p>
              </div>
              <div className="rounded-lg sm:rounded-xl p-2 sm:p-3" style={{ background: "#0d1624" }}>
                <p className="text-[10px] sm:text-xs mb-0.5" style={{ color: "#6b7785" }}>Stocks</p>
                <p className="text-xs sm:text-sm font-bold text-white">{user.stocks}</p>
              </div>
            </div>

            {/* Email */}
            <p className="text-xs truncate hidden sm:block" style={{ color: "#9aa3b0" }}>{user.email}</p>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2 sm:pt-2" style={{ borderTop: "1px solid #252f45" }}>
              <button
                onClick={(e) => { e.stopPropagation(); router.push(`/admin/users/${user.id}`); }}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-semibold transition-colors" style={{ background: "rgba(0,212,161,0.1)", color: "#00d4a1" }}
              >
                <Icon icon="mdi:eye" width={12} className="sm:w-3.5 sm:h-3.5" />
                <span className="hidden xs:inline">View</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); router.push(`/admin/users/${user.id}`); }}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-semibold transition-colors" style={{ background: "rgba(0,212,161,0.1)", color: "#00d4a1" }}
              >
                <Icon icon="mdi:pencil" width={12} className="sm:w-3.5 sm:h-3.5" />
                <span className="hidden xs:inline">Edit</span>
              </button>
              <button
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 sm:p-2 rounded-lg transition-colors" style={{ background: "rgba(244,67,54,0.1)", color: "#F44336" }}
              >
                <Icon icon="mdi:block-helper" width={12} className="sm:w-3.5 sm:h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

          </div>
  );
}