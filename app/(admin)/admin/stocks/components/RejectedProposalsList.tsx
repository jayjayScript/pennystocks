"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { useStocks } from "@/hooks/queries";

export default function RejectedProposalsList() {
  const { data: stocksData, isLoading } = useStocks(1, 100);
  const [search, setSearch] = useState("");

  const allStocks = stocksData?.data ?? [];
  const rejectedProposals = allStocks.filter((s) => s.isApproved === false);

  const filtered = rejectedProposals.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.acronym?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Search */}
      <div className="relative">
        <Icon icon="mdi:magnify" width={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#6b7785" }} />
        <input
          type="text"
          placeholder="Search rejected proposals..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-penny-text-muted outline-none"
          style={{ background: "#151d2d", border: "1px solid #252f45" }}
        />
      </div>

      {/* Rejected Proposals Table */}
      <div className="rounded-xl sm:rounded-2xl overflow-hidden" style={{ background: "#151d2d", border: "1px solid #252f45" }}>
        <div className="px-4 sm:px-6 py-3 sm:py-4" style={{ borderBottom: "1px solid #1d2639" }}>
          <h2 className="text-base sm:text-lg font-bold text-white">Rejected Proposals</h2>
          <p className="text-[10px] sm:text-xs mt-0.5" style={{ color: "#6b7785" }}>
            Proposals that have been rejected
          </p>
        </div>

        {isLoading ? (
          <div className="py-16 text-center" style={{ color: "#6b7785" }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center" style={{ color: "#6b7785" }}>
            <Icon icon="mdi:check-circle-outline" width={48} className="mx-auto mb-3" style={{ color: "#4CAF50" }} />
            <p className="text-sm font-medium">No rejected proposals</p>
            <p className="text-xs mt-1" style={{ color: "#4a5568" }}>Rejected stock proposals will appear here.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table Header */}
            <div className="hidden lg:grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr] px-6 py-3 text-xs font-semibold" style={{ background: "#0d1624", color: "#6b7785" }}>
              <span>Stock</span>
              <span>Exchange / Category</span>
              <span className="text-right">Proposed Price</span>
              <span className="text-right">Submitted</span>
              <span className="text-right">Status</span>
            </div>

            <div className="divide-y" style={{ borderColor: "#1d2639" }}>
              {filtered.map((stock) => (
                <div
                  key={stock._id}
                  className="lg:grid lg:grid-cols-[2fr_1.5fr_1fr_1fr_1fr] px-4 sm:px-6 py-3 sm:py-4 flex flex-col gap-2"
                  style={{ borderColor: "#1d2639" }}
                >
                  {/* Stock Info */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-xs sm:text-sm font-bold shrink-0" style={{ background: "rgba(244,67,54,0.12)", color: "#F44336" }}>
                      {stock.acronym?.[0] ?? "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-white">{stock.acronym}</p>
                      <p className="text-[10px] sm:text-xs truncate hidden sm:block" style={{ color: "#6b7785" }}>{stock.name}</p>
                    </div>
                  </div>

                  {/* Exchange / Category */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 text-penny-text-muted uppercase">{stock.exchange ?? "—"}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 text-penny-text-muted">{stock.type ?? "—"}</span>
                  </div>

                  {/* Proposed Price */}
                  <div className="flex items-center justify-between lg:block lg:text-right">
                    <span className="text-[10px] lg:hidden" style={{ color: "#6b7785" }}>Proposed Price</span>
                    <p className="text-xs sm:text-sm font-semibold text-white">
                      ${(stock.proposedPrice ?? stock.lastPrice ?? 0).toFixed(2)}
                    </p>
                  </div>

                  {/* Submitted */}
                  <div className="flex items-center justify-between lg:block lg:text-right">
                    <span className="text-[10px] lg:hidden" style={{ color: "#6b7785" }}>Submitted</span>
                    <p className="text-xs sm:text-sm text-penny-text-muted">
                      {new Date(stock.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-end lg:block lg:text-right">
                    <span
                      className="text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 rounded-full"
                      style={{ background: "rgba(244,67,54,0.12)", color: "#F44336" }}
                    >
                      Rejected
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
