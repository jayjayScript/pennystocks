"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";

const notifications = [
  {
    id: 1,
    type: "success",
    title: "Order Approved",
    message: "Your buy order for 0.5 BTC has been approved and executed.",
    time: "2 minutes ago",
    read: false,
    icon: "mdi:check-circle",
  },
  {
    id: 2,
    type: "info",
    title: "Copy Trade Update",
    message: "George's BTC trade just made a new trade. Check your copy portfolio!",
    time: "15 minutes ago",
    read: false,
    icon: "mdi:robot",
  },
  {
    id: 3,
    type: "warning",
    title: "Price Alert",
    message: "ETH has dropped below $3,000. Your watchlist items are affected.",
    time: "1 hour ago",
    read: true,
    icon: "mdi:alert-circle",
  },
  {
    id: 4,
    type: "success",
    title: "Deposit Successful",
    message: "Your deposit of $5,000 has been credited to your account.",
    time: "2 hours ago",
    read: true,
    icon: "mdi:wallet",
  },
  {
    id: 5,
    type: "info",
    title: "Pending Order",
    message: "Your sell order for 2.5 ETH is awaiting admin approval.",
    time: "3 hours ago",
    read: true,
    icon: "mdi:clock-outline",
  },
  {
    id: 6,
    type: "success",
    title: "Trade Closed",
    message: "Your copy trade with CryptoKing has been stopped. +$45.00 profit returned.",
    time: "5 hours ago",
    read: true,
    icon: "mdi:currency-usd",
  },
  {
    id: 7,
    type: "warning",
    title: "KYC Reminder",
    message: "Complete your KYC verification to unlock higher trading limits.",
    time: "1 day ago",
    read: true,
    icon: "mdi:shield-alert",
  },
  {
    id: 8,
    type: "info",
    title: "New Feature",
    message: "Check out our new Copy Trading feature! Start earning with expert traders.",
    time: "2 days ago",
    read: true,
    icon: "mdi:star",
  },
];

export default function NotificationsPage() {
  const [notificationsList, setNotificationsList] = useState(notifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = notificationsList.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    setNotificationsList(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotificationsList(prev => prev.map(n => ({ ...n, read: true })));
  };

  const filteredNotifications = filter === "unread"
    ? notificationsList.filter(n => !n.read)
    : notificationsList;

  const getNotificationStyles = (type: string) => {
    switch (type) {
      case "success":
        return { bg: "rgba(0,212,161,0.1)", color: "#00d4a1" };
      case "warning":
        return { bg: "rgba(245,197,24,0.1)", color: "#F5C518" };
      case "error":
        return { bg: "rgba(244,67,54,0.1)", color: "#F44336" };
      default:
        return { bg: "rgba(33,150,243,0.1)", color: "#2196F3" };
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm" style={{ color: "#6b7785" }}>
              {unreadCount} unread notification{unreadCount > 1 ? "s" : ""}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm font-semibold"
            style={{ color: "#00d4a1" }}
          >
            Mark all as read
          </button>
        )}
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
            <span className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center" style={{ background: filter === "unread" ? "#0d1624" : "#00d4a1", color: filter === "unread" ? "#00d4a1" : "#0d1624" }}>
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-16">
            <Icon icon="mdi:bell-off-outline" width={48} className="mx-auto mb-3" style={{ color: "#6b7785" }} />
            <p className="text-white font-semibold">All caught up!</p>
            <p className="text-sm mt-1" style={{ color: "#6b7785" }}>No notifications to show</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const styles = getNotificationStyles(notification.type);
            return (
              <div
                key={notification.id}
                onClick={() => markAsRead(notification.id)}
                className="rounded-xl p-4 flex gap-3 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  background: "#151d2d",
                  border: "1px solid",
                  borderColor: notification.read ? "#252f45" : "#00d4a1" + "44",
                }}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: styles.bg }}>
                  <Icon icon={notification.icon} width={20} style={{ color: styles.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-white">{notification.title}</p>
                    {!notification.read && (
                      <span className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ background: "#00d4a1" }} />
                    )}
                  </div>
                  <p className="text-xs mt-1" style={{ color: "#6b7785" }}>{notification.message}</p>
                  <p className="text-[10px] mt-2" style={{ color: "#6b7785" }}>{notification.time}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}