"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { useStocks } from "@/hooks/queries";
import { useApproveStock, useRejectStock } from "@/hooks/queries/useAdminActions";
import ProposalDetailModal, { type ApprovalData } from "./ProposalDetailModal";

export default function PendingProposalsList() {
  const { data: stocksData, isLoading } = useStocks(1, 100);
  const approveMut = useApproveStock();
  const rejectMut = useRejectStock();

  const [selectedProposal, setSelectedProposal] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const allStocks = stocksData?.data ?? [];
  const pendingProposals = allStocks.filter((s) => s.isApproved === null || s.isApproved === undefined);

  const filtered = pendingProposals.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.acronym?.toLowerCase().includes(q)
    );
  });

  const selected = filtered.find((s) => s._id === selectedProposal) ?? null;

  const handleApprove = async (id: string, data: ApprovalData) => {
    await approveMut.mutateAsync({ id, data });
    setSelectedProposal(null);
  };

  const handleReject = async (id: string) => {
    await rejectMut.mutateAsync(id);
    setSelectedProposal(null);
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Search */}
      <div className="relative">
        <Icon icon="mdi:magnify" width={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#6b7785" }} />
        <input
          type="text"
          placeholder="Search pending proposals..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-penny-text-muted outline-none"
          style={{ background: "#151d2d", border: "1px solid #252f45" }}
        />
      </div>

      {/* Proposals Table */}
      <div className="rounded-xl sm:rounded-2xl overflow-hidden" style={{ background: "#151d2d", border: "1px solid #252f45" }}>
        <div className="px-4 sm:px-6 py-3 sm:py-4" style={{ borderBottom: "1px solid #1d2639" }}>
          <h2 className="text-base sm:text-lg font-bold text-white">Pending Proposals</h2>
          <p className="text-[10px] sm:text-xs mt-0.5" style={{ color: "#6b7785" }}>
            User-submitted stocks awaiting your review
          </p>
        </div>

        {isLoading ? (
          <div className="py-16 text-center" style={{ color: "#6b7785" }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center" style={{ color: "#6b7785" }}>
            <Icon icon="mdi:clock-outline" width={48} className="mx-auto mb-3" style={{ color: "#F5C518" }} />
            <p className="text-sm font-medium">No pending proposals</p>
            <p className="text-xs mt-1" style={{ color: "#4a5568" }}>User-submitted stock proposals will appear here.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table Header */}
            <div className="hidden lg:grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr] px-6 py-3 text-xs font-semibold" style={{ background: "#0d1624", color: "#6b7785" }}>
              <span>Stock</span>
              <span>Exchange / Category</span>
              <span className="text-right">Proposed Price</span>
              <span className="text-right">Volume</span>
              <span className="text-right">Actions</span>
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
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-xs sm:text-sm font-bold shrink-0" style={{ background: "rgba(245,197,24,0.12)", color: "#F5C518" }}>
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
                    <p className="text-xs sm:text-sm font-bold text-[#00d4a1]">
                      ${(stock.proposedPrice ?? stock.lastPrice ?? 0).toFixed(2)}
                    </p>
                  </div>

                  {/* Volume */}
                  <div className="flex items-center justify-between lg:block lg:text-right">
                    <span className="text-[10px] lg:hidden" style={{ color: "#6b7785" }}>Volume</span>
                    <p className="text-xs sm:text-sm font-semibold text-white">{(stock.totalVolume ?? 0).toLocaleString()}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 lg:justify-end">
                    <button
                      onClick={() => setSelectedProposal(stock._id)}
                      className="flex-1 sm:flex-none px-3 py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-colors cursor-pointer"
                      style={{ background: "rgba(0,212,161,0.12)", color: "#00d4a1", border: "1px solid rgba(0,212,161,0.3)" }}
                    >
                      Review
                    </button>
                    <button
                      onClick={() => rejectMut.mutate(stock._id)}
                      disabled={rejectMut.isPending}
                      className="px-2 sm:px-3 py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-colors disabled:opacity-40 cursor-pointer"
                      style={{ background: "rgba(244,67,54,0.1)", color: "#F44336", border: "1px solid rgba(244,67,54,0.2)" }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Proposal Detail Modal */}
      <ProposalDetailModal
        proposal={selected}
        isOpen={selected !== null}
        onClose={() => setSelectedProposal(null)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
