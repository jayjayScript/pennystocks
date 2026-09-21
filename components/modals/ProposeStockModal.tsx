"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { useQueryClient } from "@tanstack/react-query";
import { stockProposalsApi } from "@/lib/api/backend";

interface ProposeStockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EXCHANGES = ["NASDAQ", "NYSE", "AMEX", "OTC"];
const CATEGORIES = ["Tech", "Healthcare", "Growth", "Energy", "Finance", "Consumer"];

export default function ProposeStockModal({ isOpen, onClose }: ProposeStockModalProps) {
  const qc = useQueryClient();

  const [companyName, setCompanyName] = useState("");
  const [ticker, setTicker] = useState("");
  const [exchange, setExchange] = useState("NASDAQ");
  const [category, setCategory] = useState("Tech");
  const [initialPrice, setInitialPrice] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setCompanyName("");
      setTicker("");
      setExchange("NASDAQ");
      setCategory("Tech");
      setInitialPrice("");
      setStatus("idle");
      setErrorMessage("");
    }
  }

  React.useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(initialPrice);
    if (!companyName.trim() || !ticker.trim() || isNaN(priceNum) || priceNum <= 0) {
      setStatus("error");
      setErrorMessage("Please fill in all required fields with a valid price.");
      return;
    }

    try {
      setStatus("submitting");
      setErrorMessage("");

      await stockProposalsApi.create({
        companyName: companyName.trim(),
        ticker: ticker.trim().toUpperCase(),
        exchange,
        category,
        initialListingPrice: priceNum,
      });

      qc.invalidateQueries({ queryKey: ["my-stock-proposals"] });
      setStatus("success");
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Failed to submit stock proposal.");
    }
  };

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && status !== "submitting") onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(6,10,18,0.88)", backdropFilter: "blur(10px)" }}
      onClick={handleBackdrop}
    >
      <div
        className="w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #141e30 0%, #0d1624 100%)",
          border: "1px solid #252f45",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4" style={{ borderBottom: "1px solid #1d2639" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "rgba(0,212,161,0.15)" }}>
              <Icon icon="mdi:lightbulb-outline" width={22} style={{ color: "#00d4a1" }} />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">Propose a Stock</h2>
              <p className="text-xs mt-0.5" style={{ color: "#9aa3b0" }}>Submit a company to be listed</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={status === "submitting"}
            className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/10 text-penny-text-muted transition-colors cursor-pointer"
          >
            <Icon icon="mdi:close" width={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {status === "success" ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center" style={{ background: "rgba(0,212,161,0.15)" }}>
                <Icon icon="mdi:check-circle-outline" width={36} style={{ color: "#00d4a1" }} />
              </div>
              <h3 className="text-lg font-bold text-white">Proposal Submitted</h3>
              <p className="text-xs text-penny-text-muted max-w-xs mx-auto">
                Your proposal for <span className="text-white font-semibold">{ticker.toUpperCase()}</span> has been received and is pending admin review.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {status === "error" && errorMessage && (
                <div className="p-3 rounded-xl bg-[#F44336]/10 border border-[#F44336]/20 text-xs text-[#F44336]">
                  {errorMessage}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-penny-text-muted mb-1.5">Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corporation"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-[#0d1624] border border-[#252f45] text-white focus:outline-none focus:border-[#00d4a1]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-penny-text-muted mb-1.5">Ticker Symbol</label>
                  <input
                    type="text"
                    placeholder="e.g. ACM"
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm uppercase bg-[#0d1624] border border-[#252f45] text-white focus:outline-none focus:border-[#00d4a1]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-penny-text-muted mb-1.5">Initial Price ($)</label>
                  <input
                    type="number"
                    step="any"
                    min="0.01"
                    placeholder="0.00"
                    value={initialPrice}
                    onChange={(e) => setInitialPrice(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-[#0d1624] border border-[#252f45] text-white focus:outline-none focus:border-[#00d4a1]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-penny-text-muted mb-1.5">Exchange</label>
                  <select
                    value={exchange}
                    onChange={(e) => setExchange(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm bg-[#0d1624] border border-[#252f45] text-white focus:outline-none focus:border-[#00d4a1]"
                  >
                    {EXCHANGES.map((ex) => (
                      <option key={ex} value={ex} className="bg-[#0d1624] text-white">
                        {ex}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-penny-text-muted mb-1.5">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm bg-[#0d1624] border border-[#252f45] text-white focus:outline-none focus:border-[#00d4a1]"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-[#0d1624] text-white">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full mt-2 py-3 rounded-xl font-bold text-xs bg-[#00d4a1] text-[#0d1624] hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
              >
                {status === "submitting" ? "Submitting..." : "Submit Proposal"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}