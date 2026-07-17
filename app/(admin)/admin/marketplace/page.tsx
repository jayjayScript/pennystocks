"use client";

import React from "react";
import { Icon } from "@iconify/react";
import { marketAssets } from "@/constants/data";

export default function MarketplacePage() {
  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Marketplace</h1>
        <p className="text-xs sm:text-sm mt-1" style={{ color: "#9aa3b0" }}>Approved stocks for trading</p>
      </div>

      {/* Summary Card */}
      <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6" style={{ background: "linear-gradient(135deg, #151d2d 0%, #1b2a40 100%)", border: "1px solid #252f45" }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm" style={{ color: "#9aa3b0" }}>Total Approved Stocks</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-white mt-1">{marketAssets.length}</p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,212,161,0.12)" }}>
            <Icon icon="mdi:chart-line" width={20} className="sm:w-6 sm:h-6" style={{ color: "#00d4a1" }} />
          </div>
        </div>
      </div>

      {/* Stocks List */}
      <div className="rounded-xl sm:rounded-2xl overflow-hidden" style={{ background: "#151d2d", border: "1px solid #252f45" }}>
        <div className="px-4 sm:px-6 py-3 sm:py-4" style={{ borderBottom: "1px solid #1d2639" }}>
          <h2 className="text-base sm:text-lg font-bold text-white">All Stocks</h2>
        </div>

        {/* Desktop Table Header */}
        <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr] px-6 py-3 text-xs font-semibold" style={{ background: "#0d1624", color: "#6b7785" }}>
          <span>Stock</span>
          <span className="text-right">Price</span>
          <span className="text-right">24h Change</span>
          <span className="text-right">Status</span>
          <span className="text-right">Actions</span>
        </div>

        <div className="divide-y" style={{ borderColor: "#1d2639" }}>
          {marketAssets.map((stock, index) => (
            <div key={index} className="md:grid md:grid-cols-[2fr_1fr_1fr_1fr_1fr] px-4 sm:px-6 py-3 sm:py-4 flex flex-col gap-2" style={{ borderColor: "#1d2639" }}>
              {/* Stock Info */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center text-xs sm:text-lg font-bold shrink-0" style={{ background: stock.bgColor || "rgba(0,212,161,0.1)" }}>{stock.symbol[0]}</div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-white">{stock.symbol}</p>
                  <p className="text-[10px] sm:text-xs truncate hidden sm:block" style={{ color: "#6b7785" }}>{stock.name}</p>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center justify-between md:block md:text-right">
                <span className="text-[10px] sm:text-xs md:hidden" style={{ color: "#6b7785" }}>Price</span>
                <p className="text-xs sm:text-sm font-semibold text-white">{stock.price}</p>
              </div>

              {/* Change */}
              <div className="flex items-center justify-between md:block md:text-right">
                <span className="text-[10px] sm:text-xs md:hidden" style={{ color: "#6b7785" }}>Change</span>
                <p className="text-xs sm:text-sm" style={{ color: "#9aa3b0" }}>{stock.change}</p>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between md:block md:text-right">
                <span className="text-[10px] sm:text-xs md:hidden" style={{ color: "#6b7785" }}>Status</span>
                <span className="text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full" style={{ background: "rgba(76,175,80,0.12)", color: "#4CAF50" }}>Active</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 md:justify-end">
                <button className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-semibold transition-colors" style={{ background: "rgba(0,212,161,0.1)", color: "#00d4a1", border: "1px solid rgba(0,212,161,0.2)" }}>Edit</button>
                <button className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-semibold transition-colors" style={{ background: "rgba(244,67,54,0.1)", color: "#F44336", border: "1px solid rgba(244,67,54,0.2)" }}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}