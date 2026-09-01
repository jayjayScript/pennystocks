"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { useStocks } from "@/hooks/queries";
import { useDeleteStock } from "@/hooks/queries/useAdminActions";
import { formatUSD } from "@/context/PortfolioContext";

export default function MarketplacePage() {
  const { data: stocksData, isLoading } = useStocks(1, 100);
  const deleteMut = useDeleteStock();

  const stocks = stocksData?.data ?? [];
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = stocks.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.acronym?.toLowerCase().includes(q)
    );
  });

  const handleDelete = (id: string) => {
    deleteMut.mutate(id, { onSuccess: () => setDeleteConfirm(null) });
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Marketplace</h1>
        <p className="text-xs sm:text-sm mt-1" style={{ color: "#9aa3b0" }}>
          Approved stocks for trading
        </p>
      </div>

      {/* Summary Card */}
      <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6" style={{ background: "linear-gradient(135deg, #151d2d 0%, #1b2a40 100%)", border: "1px solid #252f45" }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm" style={{ color: "#9aa3b0" }}>Total Approved Stocks</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {isLoading ? "—" : stocks.length}
            </p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,212,161,0.12)" }}>
            <Icon icon="mdi:chart-line" width={20} className="sm:w-6 sm:h-6" style={{ color: "#00d4a1" }} />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Icon icon="mdi:magnify" width={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#6b7785" }} />
        <input
          type="text"
          placeholder="Search by name or ticker..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-penny-text-muted outline-none"
          style={{ background: "#151d2d", border: "1px solid #252f45" }}
        />
      </div>

      {/* Stocks List */}
      <div className="rounded-xl sm:rounded-2xl overflow-hidden" style={{ background: "#151d2d", border: "1px solid #252f45" }}>
        <div className="px-4 sm:px-6 py-3 sm:py-4" style={{ borderBottom: "1px solid #1d2639" }}>
          <h2 className="text-base sm:text-lg font-bold text-white">All Stocks</h2>
        </div>

        {isLoading ? (
          <div className="py-16 text-center" style={{ color: "#6b7785" }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center" style={{ color: "#6b7785" }}>
            <Icon icon="mdi:chart-line-variant" width={48} className="mx-auto" />
            <p className="text-sm font-medium mt-3">No approved stocks yet</p>
          </div>
        ) : (
          <>
            {/* Desktop Table Header */}
            <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr] px-6 py-3 text-xs font-semibold" style={{ background: "#0d1624", color: "#6b7785" }}>
              <span>Stock</span>
              <span className="text-right">Price</span>
              <span className="text-right">24h Change</span>
              <span className="text-right">Status</span>
              <span className="text-right">Actions</span>
            </div>

            <div className="divide-y" style={{ borderColor: "#1d2639" }}>
              {filtered.map((stock) => {
                const isPositive = (stock.rateOfChange ?? 0) >= 0;
                return (
                  <div key={stock._id} className="md:grid md:grid-cols-[2fr_1fr_1fr_1fr_1fr] px-4 sm:px-6 py-3 sm:py-4 flex flex-col gap-2" style={{ borderColor: "#1d2639" }}>
                    {/* Stock Info */}
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center text-xs sm:text-sm font-bold shrink-0" style={{ background: "rgba(0,212,161,0.1)", color: "#00d4a1" }}>
                        {stock.acronym?.[0] ?? "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-white">{stock.acronym}</p>
                        <p className="text-[10px] sm:text-xs truncate hidden sm:block" style={{ color: "#6b7785" }}>{stock.name}</p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between md:block md:text-right">
                      <span className="text-[10px] sm:text-xs md:hidden" style={{ color: "#6b7785" }}>Price</span>
                      <p className="text-xs sm:text-sm font-semibold text-white">{formatUSD(stock.lastPrice)}</p>
                    </div>

                    {/* Change */}
                    <div className="flex items-center justify-between md:block md:text-right">
                      <span className="text-[10px] sm:text-xs md:hidden" style={{ color: "#6b7785" }}>Change</span>
                      <p
                        className="text-xs sm:text-sm font-semibold"
                        style={{ color: isPositive ? "#4CAF50" : "#F44336" }}
                      >
                        {isPositive ? "+" : ""}{stock.rateOfChange?.toFixed(2) ?? "0.00"}%
                      </p>
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-between md:block md:text-right">
                      <span className="text-[10px] sm:text-xs md:hidden" style={{ color: "#6b7785" }}>Status</span>
                      <span className="text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full inline-block" style={{ background: "rgba(76,175,80,0.12)", color: "#4CAF50" }}>Active</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 md:justify-end">
                      <button
                        onClick={() => setDeleteConfirm(stock._id)}
                        className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-semibold transition-colors"
                        style={{ background: "rgba(244,67,54,0.1)", color: "#F44336", border: "1px solid rgba(244,67,54,0.2)" }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Delete Confirm */}
      {deleteConfirm && (
        <>
          <div className="fixed inset-0 z-50 bg-black/80" onClick={() => setDeleteConfirm(null)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-sm rounded-2xl p-6"
            style={{ background: "#151d2d", border: "1px solid #252f45" }}
          >
            <h3 className="text-lg font-bold text-white mb-3">Remove Stock?</h3>
            <p className="text-sm text-penny-text-muted mb-5">
              This will remove the stock from the marketplace. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 rounded-xl font-bold"
                style={{ background: "#0d1624", color: "#9aa3b0", border: "1px solid #252f45" }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleteMut.isPending}
                className="flex-1 py-3 rounded-xl font-bold"
                style={{ background: "#F44336", color: "#fff" }}
              >
                {deleteMut.isPending ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
