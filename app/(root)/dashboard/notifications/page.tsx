"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { usePortfolio } from "@/context/PortfolioContext";
import DepositModal from "@/components/modals/DepositModal";

export default function NotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead, pendingOrders, refetch, ordersLoading, ordersError } = usePortfolio();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [depositOpen, setDepositOpen] = useState(false);
  const [depositKey, setDepositKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>(undefined);
  const [showDebug, setShowDebug] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = filter === "unread"
    ? notifications.filter((n) => !n.read)
    : notifications;

  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setTimeout(() => setRefreshing(false), 600);
    }
  };

  const activeDepositCount = pendingOrders.filter(
    (o) => o.type === "deposit" && o.status !== "completed" && o.status !== "rejected" && o.status !== "expired"
  ).length;

  const handleNotificationClick = (n: AppNotification) => {
    markNotificationRead(n.id);
    if (n.type === "deposit_details") {
      setSelectedOrderId(n.orderId);
      setDepositKey((k) => k + 1);
      setDepositOpen(true);
    }
  };

  const getNotificationStyles = (type: string) => {
    switch (type) {
      case "success":
        return { bg: "rgba(0,212,161,0.12)", color: "#00d4a1", border: "rgba(0,212,161,0.25)" };
      case "deposit_details":
        return { bg: "rgba(33,150,243,0.12)", color: "#2196F3", border: "rgba(33,150,243,0.3)" };
      case "info":
        return { bg: "rgba(33,150,243,0.08)", color: "#64b5f6", border: "rgba(33,150,243,0.2)" };
      case "warning":
        return { bg: "rgba(245,197,24,0.12)", color: "#F5C518", border: "rgba(245,197,24,0.25)" };
      case "error":
        return { bg: "rgba(244,67,54,0.12)", color: "#F44336", border: "rgba(244,67,54,0.25)" };
      default:
        return { bg: "rgba(33,150,243,0.12)", color: "#2196F3", border: "rgba(33,150,243,0.3)" };
    }
  };

  const formatTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          {unreadCount > 0 ? (
            <p className="text-sm mt-0.5" style={{ color: "#6b7785" }}>
              {unreadCount} unread notification{unreadCount > 1 ? "s" : ""}
            </p>
          ) : (
            <p className="text-xs mt-1" style={{ color: "#6b7785" }}>
              {activeDepositCount > 0
                ? `${activeDepositCount} active deposit request${activeDepositCount > 1 ? "s" : ""} — waiting for admin`
                : "No activity yet"}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Manual refresh */}
          <button
            onClick={handleManualRefresh}
            disabled={refreshing || ordersLoading}
            title="Refresh notifications"
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-40 cursor-pointer"
            style={{ background: "#151d2d", border: "1px solid #252f45" }}
          >
            <div
              className="w-4 h-4 border-2 rounded-full"
              style={{
                borderColor: "#00d4a1",
                borderTopColor: "transparent",
                animation: (refreshing || ordersLoading) ? "spin 0.7s linear infinite" : "none",
              }}
            />
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllNotificationsRead}
              className="text-sm font-semibold hover:underline cursor-pointer"
              style={{ color: "#00d4a1" }}
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Debug toggle — for troubleshooting */}
      <button
        onClick={() => setShowDebug((v) => !v)}
        className="text-xs font-mono px-2 py-1 rounded mb-4 cursor-pointer transition-all"
        style={{
          background: showDebug ? "#1d2639" : "transparent",
          color: "#6b7785",
          border: "1px solid #252f45",
        }}
      >
        {showDebug ? "◉ Debug ON" : "○ Debug"} — raw order data
      </button>

      {/* Debug panel — shows exactly what the API returns */}
      {showDebug && (
        <div className="mb-6 p-4 rounded-2xl text-xs font-mono" style={{ background: "#0d1624", border: "1px solid #252f45" }}>
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold" style={{ color: "#00d4a1" }}>RAW API DATA (via usePaymentOrders)</span>
            <button onClick={handleManualRefresh} disabled={refreshing || ordersLoading} className="text-[10px] px-2 py-1 rounded cursor-pointer" style={{ background: "#1d2639", color: "#9aa3b0" }}>
              {refreshing || ordersLoading ? "Loading..." : "Refresh"}
            </button>
          </div>

          <div className="mb-2" style={{ color: "#9aa3b0" }}>
            <strong>pendingOrders count:</strong> <span style={{ color: "#fff" }}>{pendingOrders.length}</span>
          </div>

          {pendingOrders.length === 0 ? (
            <div style={{ color: "#F44336" }}>
              ⚠ No orders returned from API. Check: (1) Are you logged in? (2) Did you submit a deposit as a REGULAR USER?
            </div>
          ) : (
            <div className="space-y-3">
              {pendingOrders.map((order, i) => {
                const hasMethodDetails = Boolean(order.methodDetails || order.isMethodIncluded);
                const hasProof = Boolean(order.proofPaymentDocument);
                const willShowNotification = hasMethodDetails && !hasProof && ["pending", "awaiting_payment", "awaiting_confirmation"].includes(order.status);

                return (
                  <div key={order._id} className="p-3 rounded-xl" style={{ background: "#151d2d", border: "1px solid #252f45" }}>
                    <div className="flex items-center justify-between mb-2">
                      <span style={{ color: "#00d4a1" }}>Order #{i + 1}</span>
                      <span className="px-2 py-0.5 rounded text-[10px]" style={{ background: "#1d2639", color: "#9aa3b0" }}>
                        {order.type} · {order.status}
                      </span>
                    </div>
                    <div style={{ color: "#9aa3b0" }}>
                      <div>amount: <span style={{ color: "#fff" }}>${order.amount}</span></div>
                      <div>method: <span style={{ color: "#fff" }}>{order.method}</span></div>
                      <div>methodDetails: <span style={{ color: order.methodDetails ? "#00d4a1" : "#F44336" }}>{order.methodDetails ? `"${order.methodDetails}"` : "null/undefined"}</span></div>
                      <div>isMethodIncluded: <span style={{ color: order.isMethodIncluded ? "#00d4a1" : "#9aa3b0" }}>{String(order.isMethodIncluded)}</span></div>
                      <div>proofPaymentDocument: <span style={{ color: hasProof ? "#00d4a1" : "#F44336" }}>{hasProof ? "present" : "null/undefined"}</span></div>
                      <div className="mt-2 pt-2" style={{ borderTop: "1px solid #252f45" }}>
                        <div>will show &quot;Payment Details Ready&quot; notification: <span style={{ color: willShowNotification ? "#00d4a1" : "#F44336", fontWeight: "bold" }}>{String(willShowNotification)}</span></div>
                        <div style={{ color: "#6b7785" }}>
                          Reason: {hasMethodDetails ? "✓ has details" : "✗ methodDetails AND isMethodIncluded are both falsy"}
                          {hasProof ? " · ✗ proof already uploaded" : ""}
                          {!["pending", "awaiting_payment", "awaiting_confirmation"].includes(order.status) ? ` · ✗ status is "${order.status}" (not active)` : ""}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-3 pt-3" style={{ borderTop: "1px solid #252f45", color: "#9aa3b0" }}>
            <div>notifications count: <span style={{ color: "#fff" }}>{notifications.length}</span></div>
          </div>
        </div>
      )}

      {/* API error banner — visible when payment-orders query fails */}
      {ordersError && (
        <div className="mb-4 p-3 rounded-xl flex items-start gap-2" style={{ background: "rgba(244,67,54,0.08)", border: "1px solid rgba(244,67,54,0.3)" }}>
          <Icon icon="mdi:alert-circle-outline" width={18} className="shrink-0 mt-0.5" style={{ color: "#F44336" }} />
          <div className="flex-1 text-xs">
            <p className="font-bold" style={{ color: "#F44336" }}>Could not load payment orders</p>
            <p className="mt-0.5" style={{ color: "#9aa3b0" }}>{ordersError}</p>
            <p className="mt-1" style={{ color: "#6b7785" }}>
              If you&apos;re logged in as a regular user, notifications will appear here automatically once the orders API responds.
            </p>
          </div>
          <button
            onClick={handleManualRefresh}
            className="text-[10px] font-bold px-2 py-1 rounded cursor-pointer"
            style={{ background: "rgba(244,67,54,0.15)", color: "#F44336" }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter("all")}
          className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
          style={{
            background: filter === "all" ? "#00d4a1" : "#151d2d",
            color: filter === "all" ? "#0d1624" : "#9aa3b0",
          }}
        >
          All
        </button>
        <button
          onClick={() => setFilter("unread")}
          className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
          style={{
            background: filter === "unread" ? "#00d4a1" : "#151d2d",
            color: filter === "unread" ? "#0d1624" : "#9aa3b0",
          }}
        >
          Unread
          {unreadCount > 0 && (
            <span
              className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
              style={{
                background: filter === "unread" ? "#0d1624" : "#00d4a1",
                color: filter === "unread" ? "#00d4a1" : "#0d1624",
              }}
            >
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-2xl" style={{ background: "#151d2d", border: "1px dashed #252f45" }}>
            <Icon icon="mdi:bell-off-outline" width={48} className="mb-3" style={{ color: "#6b7785" }} />
            <p className="text-white font-semibold">All caught up!</p>
            <p className="text-sm mt-1" style={{ color: "#6b7785" }}>No notifications to show yet</p>

            {/* Debug info — shows deposit order state */}
            {pendingOrders.length === 0 ? (
              <p className="text-xs mt-3" style={{ color: "#4a5568" }}>
                No active deposit requests — submit one from your dashboard.
              </p>
            ) : (
              <div className="mt-4 p-3 rounded-xl text-left w-full max-w-sm" style={{ background: "#0d1624", border: "1px solid #252f45" }}>
                <p className="text-xs font-bold text-penny-text-muted mb-2 uppercase tracking-wider">Active Deposit Requests</p>
                {pendingOrders
                  .filter((o) => o.type === "deposit" && o.status !== "completed" && o.status !== "rejected" && o.status !== "expired")
                  .map((order) => {
                    const hasDetails = Boolean(order.methodDetails || order.isMethodIncluded);
                    const hasProof = Boolean(order.proofPaymentDocument);
                    let step = "Awaiting admin details";
                    if (hasDetails) step = hasProof ? "Proof submitted, under review" : "Payment details ready — action needed";
                    return (
                      <div key={order._id} className="flex items-center justify-between py-2 border-b border-[#1d2639] last:border-0">
                        <div>
                          <p className="text-xs font-bold text-white">${order.amount.toFixed(2)}</p>
                          <p className="text-[10px]" style={{ color: "#6b7785" }}>{order.method}</p>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{
                          background: hasDetails ? (hasProof ? "rgba(33,150,243,0.15)" : "rgba(0,212,161,0.15)") : "rgba(245,197,24,0.15)",
                          color: hasDetails ? (hasProof ? "#2196F3" : "#00d4a1") : "#F5C518",
                        }}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
                <p className="text-[10px] mt-2" style={{ color: "#4a5568" }}>
                  Notifications update automatically. Admin sends payment details to unlock the next step.
                </p>
              </div>
            )}
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const styles = getNotificationStyles(notification.type);
            const isActionable = notification.type === "deposit_details";

            return (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className="rounded-xl p-4 flex gap-3 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer select-none"
                style={{
                  background: notification.read ? "#151d2d" : `linear-gradient(135deg, #151d2d 85%, ${styles.bg})`,
                  border: "1px solid",
                  borderColor: notification.read ? "#252f45" : styles.border,
                }}
              >
                {/* Icon */}
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: styles.bg }}
                >
                  <Icon icon={notification.icon} width={22} style={{ color: styles.color }} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold text-white">{notification.title}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      {!notification.read && (
                        <span className="w-2 h-2 rounded-full" style={{ background: "#00d4a1" }} />
                      )}
                    </div>
                  </div>
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: "#9aa3b0" }}>
                    {notification.message}
                  </p>

                  {/* Deposit details preview */}
                  {notification.type === "deposit_details" && notification.adminPaymentDetails && (
                    <div className="mt-2.5 p-2.5 rounded-lg border text-xs font-mono font-semibold text-white break-all" style={{ background: "#0d1624", borderColor: "#252f45" }}>
                      {notification.adminPaymentDetails}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[10px]" style={{ color: "#6b7785" }}>
                      {formatTime(notification.createdAt)}
                    </p>
                    {isActionable && (
                      <span
                        className="text-[11px] font-bold flex items-center gap-1"
                        style={{ color: styles.color }}
                      >
                        Tap to open & pay
                        <Icon icon="mdi:arrow-right" width={12} />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Deposit Modal (opened from notification tap) */}
      {depositOpen && (
        <DepositModal
          key={depositKey}
          isOpen={depositOpen}
          onClose={() => setDepositOpen(false)}
          initialOrderId={selectedOrderId}
        />
      )}
    </div>
  );
}