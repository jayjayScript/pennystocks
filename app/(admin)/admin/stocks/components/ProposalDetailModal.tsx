"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import type { Stock } from "@/types/api";

interface ProposalDetailModalProps {
  proposal: Stock | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string, data: ApprovalData) => Promise<void> | void;
  onReject: (id: string) => Promise<void> | void;
}

export interface ApprovalData {
  lastPrice: number;
  change24h: number;
  rateOfChange: number;
  name: string;
  acronym: string;
  description?: string;
  exchange?: string;
  type?: string;
  supply?: number;
}

const inputStyles = {
  background: "#0d1624",
  border: "1px solid #252f45",
  color: "white",
  outline: "none",
};

export default function ProposalDetailModal({
  proposal,
  isOpen,
  onClose,
  onApprove,
  onReject,
}: ProposalDetailModalProps) {
  // Form state — all fields admin can edit
  const [form, setForm] = useState<ApprovalData>({
    lastPrice: 0,
    change24h: 0,
    rateOfChange: 0,
    name: "",
    acronym: "",
    description: "",
    exchange: "",
    type: "",
    supply: 0,
  });
  const [submitting, setSubmitting] = useState<"approve" | "reject" | null>(null);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);

  useEffect(() => {
    if (isOpen && proposal) {
      // Pre-fill from proposal; admin can adjust anything
      const proposedPrice = proposal.proposedPrice ?? proposal.lastPrice;
      setForm({
        lastPrice: proposedPrice,
        change24h: proposal.change24h ?? 0,
        rateOfChange: proposal.rateOfChange ?? 0,
        name: proposal.name ?? "",
        acronym: proposal.acronym ?? "",
        description: proposal.description ?? "",
        exchange: proposal.exchange ?? "",
        type: proposal.type ?? "",
        supply: proposal.supply ?? 0,
      });
      setShowRejectConfirm(false);
    }
  }, [isOpen, proposal]);

  if (!isOpen || !proposal) return null;

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.lastPrice <= 0) return;
    setSubmitting("approve");
    try {
      await onApprove(proposal._id, form);
      onClose();
    } finally {
      setSubmitting(null);
    }
  };

  const handleReject = async () => {
    setSubmitting("reject");
    try {
      await onReject(proposal._id);
      onClose();
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-2xl rounded-3xl p-5 sm:p-6 shadow-2xl relative my-auto border border-[#252f45]"
        style={{ background: "linear-gradient(160deg, #141e30 0%, #0d1624 100%)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1d2639] mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center font-extrabold text-lg" style={{ background: "rgba(0,212,161,0.12)", color: "#00d4a1" }}>
              {proposal.acronym?.[0] ?? "?"}
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">Review Stock Proposal</h2>
              <p className="text-xs text-penny-text-muted mt-0.5">View the user&apos;s submission and finalize listing details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 text-penny-text-muted hover:text-white transition-colors cursor-pointer"
          >
            <Icon icon="mdi:close" width={18} />
          </button>
        </div>

        {/* User-submitted summary */}
        <div className="mb-5 p-3.5 rounded-xl border border-[#252f45]" style={{ background: "#0d1624" }}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-penny-text-muted mb-2">User Submitted</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <p className="text-penny-text-muted text-[10px]">Company</p>
              <p className="text-white font-semibold mt-0.5">{proposal.name}</p>
            </div>
            <div>
              <p className="text-penny-text-muted text-[10px]">Ticker</p>
              <p className="text-white font-semibold mt-0.5">{proposal.acronym}</p>
            </div>
            <div>
              <p className="text-penny-text-muted text-[10px]">Exchange</p>
              <p className="text-white font-semibold mt-0.5">{proposal.exchange ?? "—"}</p>
            </div>
            <div>
              <p className="text-penny-text-muted text-[10px]">Category</p>
              <p className="text-white font-semibold mt-0.5">{proposal.type ?? "—"}</p>
            </div>
            <div>
              <p className="text-penny-text-muted text-[10px]">Proposed Price</p>
              <p className="text-[#00d4a1] font-bold mt-0.5">${(proposal.proposedPrice ?? proposal.lastPrice ?? 0).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-penny-text-muted text-[10px]">Submitted</p>
              <p className="text-white font-semibold mt-0.5">{new Date(proposal.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          {proposal.description && (
            <div className="mt-3 pt-3 border-t border-[#1d2639]">
              <p className="text-penny-text-muted text-[10px] mb-1">Description</p>
              <p className="text-xs text-penny-text-secondary leading-relaxed">{proposal.description}</p>
            </div>
          )}
        </div>

        {showRejectConfirm ? (
          /* Reject confirmation */
          <div className="space-y-4">
            <div className="p-4 rounded-xl flex items-start gap-2" style={{ background: "rgba(244,67,54,0.08)", border: "1px solid rgba(244,67,54,0.3)" }}>
              <Icon icon="mdi:alert-circle-outline" width={20} className="shrink-0 mt-0.5" style={{ color: "#F44336" }} />
              <div>
                <p className="text-sm font-bold" style={{ color: "#F44336" }}>Reject this proposal?</p>
                <p className="text-xs mt-1 text-penny-text-muted">
                  The user will see this stock as &quot;rejected&quot; in their My Stocks page. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowRejectConfirm(false)}
                disabled={submitting === "reject"}
                className="flex-1 py-3 rounded-xl font-bold text-sm"
                style={{ background: "#0d1624", color: "#9aa3b0", border: "1px solid #252f45" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={submitting === "reject"}
                className="flex-1 py-3 rounded-xl font-bold text-sm cursor-pointer"
                style={{ background: "#F44336", color: "#fff" }}
              >
                {submitting === "reject" ? "Rejecting..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        ) : (
          /* Edit + Approve form */
          <form onSubmit={handleApprove} className="space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-penny-text-muted">Finalize Listing Details</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-penny-text-muted">Company Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm"
                  style={inputStyles}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-penny-text-muted">Ticker Symbol</label>
                <input
                  type="text"
                  value={form.acronym}
                  onChange={(e) => setForm({ ...form, acronym: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm"
                  style={inputStyles}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-penny-text-muted">Exchange</label>
                <input
                  type="text"
                  value={form.exchange}
                  onChange={(e) => setForm({ ...form, exchange: e.target.value })}
                  placeholder="e.g. NASDAQ"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm"
                  style={inputStyles}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-penny-text-muted">Category</label>
                <input
                  type="text"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  placeholder="e.g. Tech"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm"
                  style={inputStyles}
                />
              </div>

              {/* Listing price — the key field admin sets */}
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-penny-text-muted">
                  Final Listing Price ($) <span className="text-[#F44336]">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={form.lastPrice}
                  onChange={(e) => setForm({ ...form, lastPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm"
                  style={{ ...inputStyles, borderColor: form.lastPrice > 0 ? "#00d4a1" : "#F44336" }}
                  required
                />
                {proposal.proposedPrice != null && form.lastPrice !== proposal.proposedPrice && (
                  <p className="text-[10px] mt-1" style={{ color: "#F5C518" }}>
                    User proposed ${proposal.proposedPrice.toFixed(2)} — you&apos;re setting a different price.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-penny-text-muted">Total Supply</label>
                <input
                  type="number"
                  min="0"
                  value={form.supply}
                  onChange={(e) => setForm({ ...form, supply: parseInt(e.target.value) || 0 })}
                  placeholder="e.g. 1000000"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm"
                  style={inputStyles}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-penny-text-muted">24h Change ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.change24h}
                  onChange={(e) => setForm({ ...form, change24h: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm"
                  style={inputStyles}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-penny-text-muted">Rate of Change (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.rateOfChange}
                  onChange={(e) => setForm({ ...form, rateOfChange: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm"
                  style={inputStyles}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 text-penny-text-muted">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm resize-none"
                style={inputStyles}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRejectConfirm(true)}
                disabled={submitting === "approve"}
                className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 transition-all"
                style={{ background: "rgba(244,67,54,0.1)", color: "#F44336", border: "1px solid rgba(244,67,54,0.25)" }}
              >
                <Icon icon="mdi:close" width={16} />
                Reject Proposal
              </button>
              <button
                type="submit"
                disabled={submitting === "approve" || form.lastPrice <= 0}
                className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                style={{ background: "#00d4a1", color: "#0d1624" }}
              >
                {submitting === "approve" ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    <span>Approving...</span>
                  </>
                ) : (
                  <>
                    <Icon icon="mdi:check" width={16} />
                    <span>Approve & List</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
