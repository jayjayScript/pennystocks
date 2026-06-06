"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";

export default function ProfileScreen() {
  const [editMode, setEditMode] = useState(false);

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm" style={{ color: "#9aa3b0" }}>Account settings</p>
          <h1 className="text-2xl font-bold text-white mt-0.5">Profile</h1>
        </div>
        <button
          onClick={() => setEditMode(!editMode)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150"
          style={
            editMode
              ? { background: "#00d4a1", color: "#0d1624" }
              : { background: "#151d2d", color: "#9aa3b0", border: "1px solid #252f45" }
          }
        >
          <Icon icon={editMode ? "mdi:check" : "mdi:pencil-outline"} width={16} />
          {editMode ? "Save" : "Edit"}
        </button>
      </div>

      {/* Profile card */}
      <div
        className="rounded-2xl p-6 flex flex-col md:flex-row items-center md:items-start gap-5 relative overflow-hidden"
        style={{ background: "#151d2d", border: "1px solid #252f45" }}
      >
        <div
          className="absolute top-0 right-0 w-40 h-40 opacity-10 rounded-full translate-x-12 -translate-y-12"
          style={{ background: "#00d4a1" }}
        />
        {/* Avatar */}
        <div className="relative">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-extrabold"
            style={{ background: "rgba(0,212,161,0.15)", color: "#00d4a1" }}
          >
            U
          </div>
          {editMode && (
            <button
              className="absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: "#00d4a1" }}
            >
              <Icon icon="mdi:camera" width={12} style={{ color: "#0d1624" }} />
            </button>
          )}
        </div>
        <div className="text-center md:text-left">
          <h2 className="text-lg font-bold text-white">UserID24</h2>
          <p className="text-sm mt-0.5" style={{ color: "#9aa3b0" }}>user@pennystocks.com</p>
          <div className="flex items-center gap-2 mt-2 justify-center md:justify-start">
            <div
              className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: "rgba(0,212,161,0.12)", color: "#00d4a1" }}
            >
              <Icon icon="mdi:shield-check" width={12} />
              Verified
            </div>
            <div
              className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: "rgba(76,175,80,0.12)", color: "#4CAF50" }}
            >
              Active
            </div>
          </div>
        </div>
      </div>

      {/* Account info — 2-col desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: "Full Name",      value: "UserID24",              icon: "mdi:account-outline" },
          { label: "Email",          value: "user@pennystocks.com",  icon: "mdi:email-outline" },
          { label: "Phone",          value: "+1 (555) 000-0000",     icon: "mdi:phone-outline" },
          { label: "Country",        value: "United States",         icon: "mdi:earth" },
        ].map((field) => (
          <div
            key={field.label}
            className="rounded-xl p-4"
            style={{ background: "#151d2d", border: "1px solid #1d2639" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon icon={field.icon} width={14} style={{ color: "#9aa3b0" }} />
              <p className="text-xs font-semibold" style={{ color: "#9aa3b0" }}>{field.label}</p>
            </div>
            {editMode ? (
              <input
                defaultValue={field.value}
                className="w-full bg-transparent outline-none text-sm font-semibold text-white border-b pb-1"
                style={{ borderColor: "#00d4a1" }}
              />
            ) : (
              <p className="text-sm font-semibold text-white">{field.value}</p>
            )}
          </div>
        ))}
      </div>

      {/* Bank card */}
      <div>
        <h2 className="text-sm font-bold text-white mb-3">Linked Bank Account</h2>
        <div
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #1d2e44 0%, #0f1c2e 100%)",
            border: "1px solid #252f45",
          }}
        >
          <div
            className="absolute bottom-0 right-0 w-32 h-32 opacity-10 rounded-full translate-x-8 translate-y-8"
            style={{ background: "#00d4a1" }}
          />
          <div className="flex items-center justify-between mb-6 relative z-10">
            <span className="text-xs font-bold" style={{ color: "#9aa3b0" }}>KUDA BANK</span>
            <Icon icon="mdi:contactless-payment" width={24} style={{ color: "#00d4a1" }} />
          </div>
          <p className="text-base font-mono font-semibold text-white tracking-wider mb-4 relative z-10">
            •••• •••• •••• 4521
          </p>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-[10px]" style={{ color: "#9aa3b0" }}>Account Name</p>
              <p className="text-sm font-bold text-white">UserID24</p>
            </div>
            <div className="text-right">
              <p className="text-[10px]" style={{ color: "#9aa3b0" }}>Status</p>
              <p className="text-sm font-bold" style={{ color: "#4CAF50" }}>Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings rows */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: "1px solid #1d2639" }}
      >
        {[
          { label: "Change Password",    icon: "mdi:lock-outline",           danger: false },
          { label: "Withdrawal Password", icon: "mdi:shield-key-outline",    danger: false },
          { label: "Notifications",      icon: "mdi:bell-outline",           danger: false },
          { label: "Privacy Policy",     icon: "mdi:file-document-outline",  danger: false },
          { label: "Log Out",            icon: "mdi:logout",                 danger: true  },
        ].map((row, i, arr) => (
          <button
            key={row.label}
            className="w-full flex items-center justify-between px-5 py-4 transition-all duration-150 hover:opacity-80"
            style={{
              background: "#151d2d",
              borderBottom: i < arr.length - 1 ? "1px solid #1d2639" : "none",
            }}
          >
            <div className="flex items-center gap-3">
              <Icon
                icon={row.icon}
                width={18}
                style={{ color: row.danger ? "#F44336" : "#9aa3b0" }}
              />
              <span
                className="text-sm font-semibold"
                style={{ color: row.danger ? "#F44336" : "#c8d0dc" }}
              >
                {row.label}
              </span>
            </div>
            {!row.danger && (
              <Icon icon="mdi:chevron-right" width={16} style={{ color: "#6b7785" }} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
