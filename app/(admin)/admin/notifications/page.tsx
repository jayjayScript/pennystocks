"use client";

import React from "react";
import { Icon } from "@iconify/react";

const mockNotifications = [
  { id: 1, title: "New user registered", message: "Sarah Johnson just joined the platform", time: "5 min ago", type: "user" },
  { id: 2, title: "Stock approved", message: "MYST stock has been approved and listed", time: "15 min ago", type: "stock" },
  { id: 3, title: "Large transaction", message: "John Smith bought $15,000 worth of AAPL", time: "1 hour ago", type: "transaction" },
  { id: 4, title: "New support ticket", message: "Emily Davis submitted a support request", time: "2 hours ago", type: "support" },
  { id: 5, title: "Stock price alert", message: "TECH stock increased by 10%", time: "3 hours ago", type: "alert" },
];

const typeColors: Record<string, string> = {
  user: "#2196F3",
  stock: "#4CAF50",
  transaction: "#F5C518",
  support: "#9C27B0",
  alert: "#FF9800",
};

const typeIcons: Record<string, string> = {
  user: "mdi:account-plus",
  stock: "mdi:chart-line",
  transaction: "mdi:swap-horizontal",
  support: "mdi:headset",
  alert: "mdi:bell",
};

export default function NotificationsPage() {
  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Notifications</h1>
          <p className="text-xs sm:text-sm mt-1" style={{ color: "#9aa3b0" }}>Platform alerts</p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold" style={{ background: "#151d2d", color: "#9aa3b0", border: "1px solid #252f45" }}>
            <Icon icon="mdi:check-all" width={14} className="sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Mark All Read</span>
            <span className="sm:hidden">Read All</span>
          </button>
          <button className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold" style={{ background: "rgba(244,67,54,0.1)", color: "#F44336", border: "1px solid rgba(244,67,54,0.2)" }}>
            <Icon icon="mdi:delete" width={14} className="sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Clear All</span>
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="rounded-xl sm:rounded-2xl overflow-hidden" style={{ background: "#151d2d", border: "1px solid #252f45" }}>
        <div className="divide-y" style={{ borderColor: "#1d2639" }}>
          {mockNotifications.map((notification) => (
            <div key={notification.id} className="flex items-start gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 hover:bg-opacity-50 transition-colors" style={{ borderColor: "#1d2639" }}>
              {/* Icon */}
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0" style={{ background: `${typeColors[notification.type]}20` }}>
                <Icon icon={typeIcons[notification.type]} width={16} className="sm:w-5 sm:h-5" style={{ color: typeColors[notification.type] }} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 sm:mb-1 flex-wrap">
                  <h3 className="text-xs sm:text-sm font-semibold text-white">{notification.title}</h3>
                  <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full first-letter:uppercase" style={{ background: `${typeColors[notification.type]}20`, color: typeColors[notification.type] }}>{notification.type}</span>
                </div>
                <p className="text-[10px] sm:text-sm truncate" style={{ color: "#9aa3b0" }}>{notification.message}</p>
              </div>

              {/* Time */}
              <span className="text-[10px] sm:text-xs shrink-0" style={{ color: "#6b7785" }}>{notification.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}