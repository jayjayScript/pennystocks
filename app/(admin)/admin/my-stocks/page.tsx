"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";

const mockUserCreatedStocks = [
  { id: 1, symbol: "MYST", name: "Mystery Corp", price: 45.50, change: "+12.5%", buys: 28, totalRevenue: 2450 },
  { id: 2, symbol: "TECH", name: "Tech Innovations", price: 89.00, change: "+5.2%", buys: 15, totalRevenue: 1890 },
  { id: 3, symbol: "GOLD", name: "Golden Touch", price: 123.75, change: "-2.1%", buys: 8, totalRevenue: 1240 },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(amount);
}

export default function MyStocksPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const totalRevenue = mockUserCreatedStocks.reduce((sum, s) => sum + s.totalRevenue, 0);
  const totalBuys = mockUserCreatedStocks.reduce((sum, s) => sum + s.buys, 0);

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">My Stocks</h1>
          <p className="text-xs sm:text-sm mt-1" style={{ color: "#9aa3b0" }}>Stocks you created</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm"
          style={{ background: "#00d4a1", color: "#0d1624" }}
        >
          <Icon icon={showCreateForm ? "mdi:close" : "mdi:plus"} width={16} />
          {showCreateForm ? "Cancel" : "Create Stock"}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 sm:gap-4">
        <div className="rounded-xl sm:rounded-2xl p-4 sm:p-5" style={{ background: "linear-gradient(135deg, #151d2d 0%, #1b2a40 100%)", border: "1px solid #252f45" }}>
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center" style={{ background: "rgba(0,212,161,0.12)" }}>
              <Icon icon="mdi:cash" width={16} className="sm:w-5 sm:h-5" style={{ color: "#00d4a1" }} />
            </div>
            <span className="text-[10px] sm:text-sm" style={{ color: "#9aa3b0" }}>Revenue</span>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-white">{formatCurrency(totalRevenue)}</p>
        </div>

        <div className="rounded-xl sm:rounded-2xl p-4 sm:p-5" style={{ background: "linear-gradient(135deg, #151d2d 0%, #1b2a40 100%)", border: "1px solid #252f45" }}>
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center" style={{ background: "rgba(255,152,0,0.12)" }}>
              <Icon icon="mdi:account-group" width={16} className="sm:w-5 sm:h-5" style={{ color: "#FF9800" }} />
            </div>
            <span className="text-[10px] sm:text-sm" style={{ color: "#9aa3b0" }}>Buyers</span>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-white">{totalBuys}</p>
        </div>

        <div className="rounded-xl sm:rounded-2xl p-4 sm:p-5" style={{ background: "linear-gradient(135deg, #151d2d 0%, #1b2a40 100%)", border: "1px solid #252f45" }}>
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center" style={{ background: "rgba(76,175,80,0.12)" }}>
              <Icon icon="mdi:chart-line" width={16} className="sm:w-5 sm:h-5" style={{ color: "#4CAF50" }} />
            </div>
            <span className="text-[10px] sm:text-sm" style={{ color: "#9aa3b0" }}>Created</span>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-white">{mockUserCreatedStocks.length}</p>
        </div>
      </div>

      {/* Stocks Table */}
      <div className="rounded-xl sm:rounded-2xl overflow-hidden" style={{ background: "#151d2d", border: "1px solid #252f45" }}>
        <div className="px-4 sm:px-6 py-3 sm:py-4" style={{ borderBottom: "1px solid #1d2639" }}>
          <h2 className="text-base sm:text-lg font-bold text-white">Your Created Stocks</h2>
        </div>

        {/* Desktop Table Header - Hidden on mobile */}
        <div className="hidden lg:grid grid-cols-[2fr_1fr_1fr_1fr_1fr] px-6 py-3 text-xs font-semibold" style={{ background: "#0d1624", color: "#6b7785" }}>
          <span>Stock</span>
          <span className="text-right">Price</span>
          <span className="text-right">Change</span>
          <span className="text-right">Buyers</span>
          <span className="text-right">Revenue</span>
        </div>

        <div className="divide-y" style={{ borderColor: "#1d2639" }}>
          {mockUserCreatedStocks.map((stock) => (
            <div key={stock.id} className="lg:grid lg:grid-cols-[2fr_1fr_1fr_1fr_1fr] px-4 sm:px-6 py-3 sm:py-4 flex flex-col gap-2" style={{ borderColor: "#1d2639" }}>
              {/* Stock Info */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center text-xs sm:text-sm font-bold" style={{ background: "rgba(0,212,161,0.1)", color: "#00d4a1" }}>{stock.symbol[0]}</div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-white">{stock.symbol}</p>
                  <p className="text-[10px] sm:text-xs hidden sm:block" style={{ color: "#6b7785" }}>{stock.name}</p>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center justify-between lg:block lg:text-right">
                <span className="text-[10px] sm:text-xs lg:hidden" style={{ color: "#6b7785" }}>Price</span>
                <p className="text-xs sm:text-sm font-semibold text-white">${stock.price.toFixed(2)}</p>
              </div>

              {/* Change */}
              <div className="flex items-center justify-between lg:block lg:text-right">
                <span className="text-[10px] sm:text-xs lg:hidden" style={{ color: "#6b7785" }}>Change</span>
                <span className="text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full" style={{ background: stock.change.startsWith("+") ? "rgba(76,175,80,0.12)" : "rgba(244,67,54,0.12)", color: stock.change.startsWith("+") ? "#4CAF50" : "#F44336" }}>{stock.change}</span>
              </div>

              {/* Buyers */}
              <div className="flex items-center justify-between lg:block lg:text-right">
                <span className="text-[10px] sm:text-xs lg:hidden" style={{ color: "#6b7785" }}>Buyers</span>
                <p className="text-xs sm:text-sm font-semibold text-white">{stock.buys}</p>
              </div>

              {/* Revenue */}
              <div className="flex items-center justify-between lg:block lg:text-right">
                <span className="text-[10px] sm:text-xs lg:hidden" style={{ color: "#6b7785" }}>Revenue</span>
                <p className="text-xs sm:text-sm font-semibold" style={{ color: "#00d4a1" }}>{formatCurrency(stock.totalRevenue)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}