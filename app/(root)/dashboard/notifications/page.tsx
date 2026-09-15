"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import DepositModal from "@/components/modals/DepositModal";

type AppNotification = {
  id: string;
  type: "success" | "deposit_details" | "info" | "warning" | "error";
  title: string;
  message: string;
  icon: string;
  read: boolean;
  createdAt: string;
  adminPaymentDetails?: string;
  orderId?: string;
};

const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: "1",
    type: "success",
    title: "Deposit Approved",
    message: "Your deposit of $2,000.00 via bank transfer has been approved and credited to your account.",
    icon: "mdi:check-circle-outline",
    read: false,
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: "2",
    type: "deposit_details",
    title: "Payment Details Ready",
    message: "Your deposit of $500.00 is ready. Tap to view payment details and upload proof.",
    icon: "mdi:bank-outline",
    read: false,
    createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
    adminPaymentDetails: "Bank: Access Bank\nAccount: 0123456789\nName: Penny Stocks Ltd",
    orderId: "order-mock-1",
  },
  {
    id: "3",
    type: "info",
    title: "Trade Executed",
    message: "Your buy order for 5 shares of AAPL at $175.20 has been executed successfully.",
    icon: "mdi:chart-line",
    read: true,
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: "4",
    type: "warning",
    title: "Withdrawal Pending",
    message: "Your withdrawal request of $300.00 is under review. Expected processing: 1-2 business days.",
    icon: "mdi:clock-outline",
    read: true,
    createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [depositOpen, setDepositOpen] = useState(false);
  const [depositKey, setDepositKey] = useState(0);
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>(undefined);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = filter === "unread"
    ? notifications.filter((n) => !n.read)
    : notifications;

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

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
            <p className="text-xs mt-1" style={{ color: "#6b7785" }}>All caught up</p>
          )}
        </div>
        <div className="flex items-center gap-2">
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
                        Tap to open &amp; pay
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