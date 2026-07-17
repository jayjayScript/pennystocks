"use client";

import React from "react";
import { Icon } from "@iconify/react";

const stockTypes = [
  { name: "Blue Chip", icon: "mdi:star-circle", color: "#4CAF50", description: "Established, reliable companies" },
  { name: "Growth", icon: "mdi:trending-up", color: "#2196F3", description: "High growth potential stocks" },
  { name: "Dividend", icon: "mdi:cash-multiple", color: "#FF9800", description: "Regular dividend payments" },
  { name: "Tech", icon: "mdi:chip", color: "#9C27B0", description: "Technology sector stocks" },
  { name: "Healthcare", icon: "mdi:hospital-box", color: "#E91E63", description: "Healthcare and biotech companies" },
  { name: "Finance", icon: "mdi:bank", color: "#607D8B", description: "Financial institutions" },
];

export default function ConfigurationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Marketplace Settings</h1>
        <p className="text-sm mt-1" style={{ color: "#9aa3b0" }}>Configure stock categories and marketplace settings</p>
      </div>

      <div className="rounded-2xl p-6" style={{ background: "#151d2d", border: "1px solid #252f45" }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">Stock Types</h2>
            <p className="text-sm mt-1" style={{ color: "#9aa3b0" }}>Define categories for organizing stocks</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: "rgba(0,212,161,0.1)", color: "#00d4a1", border: "1px solid rgba(0,212,161,0.2)" }}>
            <Icon icon="mdi:add" width={16} />Add Type
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stockTypes.map((type) => (
            <div key={type.name} className="p-4 rounded-xl" style={{ background: "#0d1624", border: "1px solid #1d2639" }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${type.color}20` }}>
                  <Icon icon={type.icon} width={20} style={{ color: type.color }} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{type.name}</h3>
                  <p className="text-xs" style={{ color: "#6b7785" }}>{type.description}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 py-2 rounded-lg text-xs font-medium" style={{ background: "rgba(255,255,255,0.05)", color: "#9aa3b0" }}>
                  <Icon icon="mdi:pencil" width={12} className="inline mr-1" />Edit
                </button>
                <button className="flex-1 py-2 rounded-lg text-xs font-medium" style={{ background: "rgba(244,67,54,0.1)", color: "#F44336" }}>
                  <Icon icon="mdi:delete" width={12} className="inline mr-1" />Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl p-6" style={{ background: "#151d2d", border: "1px solid #252f45" }}>
        <h2 className="text-lg font-bold text-white mb-6">Platform Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#9aa3b0" }}>Transaction Fee (%)</label>
            <input type="number" defaultValue="0.1" step="0.01" min="0" max="10" className="w-full px-4 py-3 rounded-xl text-sm" style={{ background: "#0d1624", border: "1px solid #252f45", color: "white" }} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#9aa3b0" }}>Initial User Balance ($)</label>
            <input type="number" defaultValue="200000" step="1000" min="0" className="w-full px-4 py-3 rounded-xl text-sm" style={{ background: "#0d1624", border: "1px solid #252f45", color: "white" }} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#9aa3b0" }}>Minimum Trade Amount ($)</label>
            <input type="number" defaultValue="1" step="1" min="1" className="w-full px-4 py-3 rounded-xl text-sm" style={{ background: "#0d1624", border: "1px solid #252f45", color: "white" }} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#9aa3b0" }}>Platform Status</label>
            <div className="flex items-center gap-4">
              <div className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm" style={{ background: "rgba(76,175,80,0.15)", color: "#4CAF50", border: "2px solid #4CAF50" }}>
                <Icon icon="mdi:check-circle" width={16} />Active
              </div>
              <div className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm cursor-pointer" style={{ background: "transparent", color: "#6b7785", border: "1px solid #252f45" }}>
                <Icon icon="mdi:pause-circle" width={16} />Maintenance
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <button className="px-6 py-3 rounded-xl font-bold text-sm" style={{ background: "#00d4a1", color: "#0d1624" }}>Save Settings</button>
        </div>
      </div>
    </div>
  );
}