"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { useStocks } from "@/hooks/queries";
import { useAuth } from "@/context/AuthContext";
import { formatUSD } from "@/context/PortfolioContext";
import CreateStockModal from "@/components/modals/CreateStockModal";

export default function MyStocksPage() {
  const { data: stocksData, isLoading } = useStocks(1, 100);
  const { user } = useAuth();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Only show stocks created by the logged-in admin
  const stocks = (stocksData?.data ?? []).filter((s) => s.submittedBy === user?._id);
  const totalRevenue = stocks.reduce((sum, s) => sum + (s.lastPrice * (s.totalVolume ?? 0)), 0);

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">My Stocks</h1>
          <p className="text-xs sm:text-sm mt-1" style={{ color: "#9aa3b0" }}>Stocks created by you</p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-[#00d4a1] text-[#0d1624] hover:opacity-90 active:scale-95 transition-all"
        >
          <Icon icon="mdi:plus" width={16} />
          Create Stock
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
          <p className="text-xl sm:text-2xl font-extrabold text-white">{formatUSD(totalRevenue)}</p>
        </div>
        <div className="rounded-xl sm:rounded-2xl p-4 sm:p-5" style={{ background: "linear-gradient(135deg, #151d2d 0%, #1b2a40 100%)", border: "1px solid #252f45" }}>
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center" style={{ background: "rgba(255,152,0,0.12)" }}>
              <Icon icon="mdi:chart-line" width={16} className="sm:w-5 sm:h-5" style={{ color: "#FF9800" }} />
            </div>
            <span className="text-[10px] sm:text-sm" style={{ color: "#9aa3b0" }}>Total Volume</span>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-white">
            {isLoading ? "—" : stocks.reduce((sum, s) => sum + (s.totalVolume ?? 0), 0).toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl sm:rounded-2xl p-4 sm:p-5" style={{ background: "linear-gradient(135deg, #151d2d 0%, #1b2a40 100%)", border: "1px solid #252f45" }}>
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center" style={{ background: "rgba(76,175,80,0.12)" }}>
              <Icon icon="mdi:chart-line-variant" width={16} className="sm:w-5 sm:h-5" style={{ color: "#4CAF50" }} />
            </div>
            <span className="text-[10px] sm:text-sm" style={{ color: "#9aa3b0" }}>Created</span>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-white">{isLoading ? "—" : stocks.length}</p>
        </div>
      </div>

      {/* Stocks Table */}
      <div className="rounded-xl sm:rounded-2xl overflow-hidden" style={{ background: "#151d2d", border: "1px solid #252f45" }}>
        <div className="px-4 sm:px-6 py-3 sm:py-4" style={{ borderBottom: "1px solid #1d2639" }}>
          <h2 className="text-base sm:text-lg font-bold text-white">Your Created Stocks</h2>
        </div>

        {/* Desktop Table Header */}
        <div className="hidden lg:grid grid-cols-[2fr_1fr_1fr_1fr_1fr] px-6 py-3 text-xs font-semibold" style={{ background: "#0d1624", color: "#6b7785" }}>
          <span>Stock</span>
          <span className="text-right">Price</span>
          <span className="text-right">Change</span>
          <span className="text-right">Volume</span>
          <span className="text-right">Market Cap</span>
        </div>

        {isLoading ? (
          <div className="py-16 text-center" style={{ color: "#6b7785" }}>Loading...</div>
        ) : stocks.length === 0 ? (
          <div className="py-16 text-center" style={{ color: "#6b7785" }}>
            <Icon icon="mdi:chart-line-variant" width={48} className="mx-auto" />
            <p className="text-sm font-medium mt-3">No stocks yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "#1d2639" }}>
            {stocks.map((stock) => {
              const isPositive = (stock.rateOfChange ?? 0) >= 0;
              return (
                <div key={stock._id} className="lg:grid lg:grid-cols-[2fr_1fr_1fr_1fr_1fr] px-4 sm:px-6 py-3 sm:py-4 flex flex-col gap-2" style={{ borderColor: "#1d2639" }}>
                  {/* Stock Info */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center text-xs sm:text-sm font-bold shrink-0" style={{ background: "rgba(0,212,161,0.1)", color: "#00d4a1" }}>
                      {stock.acronym?.[0] ?? "?"}
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-white">{stock.acronym}</p>
                      <p className="text-[10px] sm:text-xs hidden sm:block truncate" style={{ color: "#6b7785" }}>{stock.name}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between lg:block lg:text-right">
                    <span className="text-[10px] sm:text-xs lg:hidden" style={{ color: "#6b7785" }}>Price</span>
                    <p className="text-xs sm:text-sm font-semibold text-white">{formatUSD(stock.lastPrice)}</p>
                  </div>

                  {/* Change */}
                  <div className="flex items-center justify-between lg:block lg:text-right">
                    <span className="text-[10px] sm:text-xs lg:hidden" style={{ color: "#6b7785" }}>Change</span>
                    <span className="text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full inline-block" style={{
                      background: isPositive ? "rgba(76,175,80,0.12)" : "rgba(244,67,54,0.12)",
                      color: isPositive ? "#4CAF50" : "#F44336",
                    }}>
                      {isPositive ? "+" : ""}{stock.rateOfChange?.toFixed(2) ?? "0.00"}%
                    </span>
                  </div>

                  {/* Volume */}
                  <div className="flex items-center justify-between lg:block lg:text-right">
                    <span className="text-[10px] sm:text-xs lg:hidden" style={{ color: "#6b7785" }}>Volume</span>
                    <p className="text-xs sm:text-sm font-semibold text-white">{(stock.totalVolume ?? 0).toLocaleString()}</p>
                  </div>

                  {/* Market Cap */}
                  <div className="flex items-center justify-between lg:block lg:text-right">
                    <span className="text-[10px] sm:text-xs lg:hidden" style={{ color: "#6b7785" }}>Market Cap</span>
                    <p className="text-xs sm:text-sm font-semibold" style={{ color: "#00d4a1" }}>
                      {formatUSD(stock.lastPrice * (stock.totalVolume ?? 0))}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Stock Modal */}
      <CreateStockModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </div>
  );
}
