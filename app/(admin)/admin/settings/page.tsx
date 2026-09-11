"use client";

import React from "react";
import { Icon } from "@iconify/react";

export default function SettingsPage() {
  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Settings</h1>
        <p className="text-xs sm:text-sm mt-1" style={{ color: "#9aa3b0" }}>Platform configuration</p>
      </div>

      {/* General Settings */}
      <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6" style={{ background: "#151d2d", border: "1px solid #252f45" }}>
        <h2 className="text-base sm:text-lg font-bold text-white mb-4 sm:mb-6">General</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-2" style={{ color: "#9aa3b0" }}>Platform Name</label>
            <input type="text" defaultValue="Pennystocks" className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm" style={{ background: "#0d1624", border: "1px solid #252f45", color: "white" }} />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-2" style={{ color: "#9aa3b0" }}>Support Email</label>
            <input type="email" defaultValue="support@pennystocks.com" className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm" style={{ background: "#0d1624", border: "1px solid #252f45", color: "white" }} />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-2" style={{ color: "#9aa3b0" }}>Transaction Fee (%)</label>
            <input type="number" defaultValue="0.1" step="0.01" min="0" max="10" className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm" style={{ background: "#0d1624", border: "1px solid #252f45", color: "white" }} />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-2" style={{ color: "#9aa3b0" }}>Initial Balance ($)</label>
            <input type="number" defaultValue="200000" step="1000" min="0" className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm" style={{ background: "#0d1624", border: "1px solid #252f45", color: "white" }} />
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6" style={{ background: "#151d2d", border: "1px solid #252f45" }}>
        <h2 className="text-base sm:text-lg font-bold text-white mb-4 sm:mb-6">Security</h2>
        <div className="space-y-3 sm:space-y-4">
          {/* 2FA Toggle */}
          <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl" style={{ background: "#0d1624", border: "1px solid #1d2639" }}>
            <div className="flex items-center gap-2 sm:gap-3">
              <Icon icon="mdi:shield-check" width={20} className="sm:w-6 sm:h-6" style={{ color: "#4CAF50" }} />
              <div>
                <p className="text-xs sm:text-sm font-semibold text-white">Two-Factor Auth</p>
                <p className="text-[10px] sm:text-xs hidden sm:block" style={{ color: "#6b7785" }}>Require 2FA for admin login</p>
              </div>
            </div>
            <div className="w-11 h-6 sm:w-12 sm:h-6 rounded-full relative cursor-pointer flex items-center" style={{ background: "#00d4a1" }}>
              <div className="absolute right-1 w-4 h-4 sm:w-4 sm:h-4 rounded-full" style={{ background: "white" }} />
            </div>
          </div>

          {/* Session Timeout */}
          <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl" style={{ background: "#0d1624", border: "1px solid #1d2639" }}>
            <div className="flex items-center gap-2 sm:gap-3">
              <Icon icon="mdi:lock-check" width={20} className="sm:w-6 sm:h-6" style={{ color: "#F5C518" }} />
              <div>
                <p className="text-xs sm:text-sm font-semibold text-white">Session Timeout</p>
                <p className="text-[10px] sm:text-xs hidden sm:block" style={{ color: "#6b7785" }}>Auto logout after inactivity</p>
              </div>
            </div>
            <select className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm" style={{ background: "#151d2d", border: "1px solid #252f45", color: "white" }}>
              <option>15 min</option>
              <option>30 min</option>
              <option>1 hour</option>
              <option>4 hours</option>
            </select>
          </div>

          {/* Audit Logs */}
          <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl" style={{ background: "#0d1624", border: "1px solid #1d2639" }}>
            <div className="flex items-center gap-2 sm:gap-3">
              <Icon icon="mdi:history" width={20} className="sm:w-6 sm:h-6" style={{ color: "#2196F3" }} />
              <div>
                <p className="text-xs sm:text-sm font-semibold text-white">Audit Logs</p>
                <p className="text-[10px] sm:text-xs hidden sm:block" style={{ color: "#6b7785" }}>Track all admin actions</p>
              </div>
            </div>
            <div className="w-11 h-6 sm:w-12 sm:h-6 rounded-full relative cursor-pointer flex items-center" style={{ background: "#00d4a1" }}>
              <div className="absolute right-1 w-4 h-4 sm:w-4 sm:h-4 rounded-full" style={{ background: "white" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm cursor-pointer" style={{ background: "#00d4a1", color: "#0d1624" }}>
          <Icon icon="mdi:content-save" width={16} className="inline mr-2" />
          Save Changes
        </button>
      </div>
    </div>
  );
}