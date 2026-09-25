"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useCreateStock } from "@/hooks/queries";

interface CreateStockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EXCHANGES = ["NASDAQ", "NYSE", "AMEX", "OTC"];
const CATEGORIES = ["Tech", "Healthcare", "Growth", "Energy", "Finance", "Consumer"];

export default function CreateStockModal({ isOpen, onClose }: CreateStockModalProps) {
  const createStockMut = useCreateStock();

  const [name, setName] = useState("");
  const [acronym, setAcronym] = useState("");
  const [lastPrice, setLastPrice] = useState("");
  const [initialListingPrice, setInitialListingPrice] = useState("");
  const [category, setCategory] = useState("Tech");
  const [exchange, setExchange] = useState("NASDAQ");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setName("");
      setAcronym("");
      setLastPrice("");
      setInitialListingPrice("");
      setCategory("Tech");
      setExchange("NASDAQ");
      setDescription("");
      setStatus("idle");
      setErrorMessage("");
    }
  }

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(lastPrice);
    const initialPrice = initialListingPrice ? parseFloat(initialListingPrice) : price;

    if (!name.trim()) {
      setStatus("error");
      setErrorMessage("Stock name is required.");
      return;
    }
    if (!acronym.trim()) {
      setStatus("error");
      setErrorMessage("Stock ticker/acronym is required.");
      return;
    }
    if (isNaN(price) || price <= 0) {
      setStatus("error");
      setErrorMessage("Please enter a valid price greater than 0.");
      return;
    }

    const change24h = initialPrice > 0 ? parseFloat((price - initialPrice).toFixed(4)) : 0;
    const rateOfChange = initialPrice > 0 ? parseFloat((((price - initialPrice) / initialPrice) * 100).toFixed(2)) : 0;

    try {
      setStatus("submitting");
      setErrorMessage("");

      await createStockMut.mutateAsync({
        name: name.trim(),
        acronym: acronym.trim().toUpperCase(),
        lastPrice: price,
        initialListingPrice: initialPrice,
        change24h,
        rateOfChange,
        category,
        exchange,
        currency: "USD",
        ...(description.trim() ? { description: description.trim() } : {}),
      });

      setStatus("success");
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Failed to create stock.");
    }
  };

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && status !== "submitting") onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
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
        <div className="flex items-center justify-between p-6 border-b border-[#1d2639]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,212,161,0.12)", color: "#00d4a1" }}>
              <Icon icon="mdi:chart-box-plus-outline" width={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">Create New Stock</h2>
              <p className="text-xs" style={{ color: "#6b7785" }}>List a new stock directly on the market</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={status === "submitting"}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 text-penny-text-muted hover:text-white transition-colors cursor-pointer"
          >
            <Icon icon="mdi:close" width={18} />
          </button>
        </div>

        {/* Content */}
        {status === "success" ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center" style={{ background: "rgba(76,175,80,0.15)", color: "#4CAF50" }}>
              <Icon icon="mdi:check-circle" width={36} />
            </div>
            <h3 className="text-lg font-bold text-white">Stock Created Successfully!</h3>
            <p className="text-xs" style={{ color: "#9aa3b0" }}>
              {acronym.toUpperCase()} - {name} is now listed on the market.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {status === "error" && errorMessage && (
              <div
                className="p-3 rounded-xl text-xs flex items-center gap-2"
                style={{ background: "rgba(244,67,54,0.1)", border: "1px solid rgba(244,67,54,0.3)", color: "#F44336" }}
              >
                <Icon icon="mdi:alert-circle" width={16} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#9aa3b0" }}>
                Company Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Apex BioTech Inc."
                className="w-full px-4 py-2.5 rounded-xl text-sm"
                style={{ background: "#0d1624", border: "1px solid #252f45", color: "white", outline: "none" }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#9aa3b0" }}>
                  Ticker / Acronym *
                </label>
                <input
                  type="text"
                  value={acronym}
                  onChange={(e) => setAcronym(e.target.value.toUpperCase())}
                  placeholder="e.g. APEX"
                  maxLength={6}
                  className="w-full px-4 py-2.5 rounded-xl text-sm uppercase"
                  style={{ background: "#0d1624", border: "1px solid #252f45", color: "white", outline: "none" }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#9aa3b0" }}>
                  Exchange
                </label>
                <select
                  value={exchange}
                  onChange={(e) => setExchange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm"
                  style={{ background: "#0d1624", border: "1px solid #252f45", color: "white", outline: "none" }}
                >
                  {EXCHANGES.map((ex) => (
                    <option key={ex} value={ex} style={{ background: "#0d1624", color: "white" }}>
                      {ex}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#9aa3b0" }}>
                  Listing Price ($) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm" style={{ color: "#6b7785" }}>$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.0001"
                    value={lastPrice}
                    onChange={(e) => setLastPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-7 pr-3 py-2.5 rounded-xl text-sm"
                    style={{ background: "#0d1624", border: "1px solid #252f45", color: "white", outline: "none" }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#9aa3b0" }}>
                  Initial Price ($)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm" style={{ color: "#6b7785" }}>$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.0001"
                    value={initialListingPrice}
                    onChange={(e) => setInitialListingPrice(e.target.value)}
                    placeholder="Same as listing"
                    className="w-full pl-7 pr-3 py-2.5 rounded-xl text-sm"
                    style={{ background: "#0d1624", border: "1px solid #252f45", color: "white", outline: "none" }}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#9aa3b0" }}>
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm"
                style={{ background: "#0d1624", border: "1px solid #252f45", color: "white", outline: "none" }}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} style={{ background: "#0d1624", color: "white" }}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#9aa3b0" }}>
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Briefly describe this company..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm resize-none"
                style={{ background: "#0d1624", border: "1px solid #252f45", color: "white", outline: "none" }}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={status === "submitting"}
                className="flex-1 py-3 rounded-xl font-bold text-sm bg-white/5 border border-[#252f45] text-penny-text-muted hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={status === "submitting"}
                className="flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                style={{
                  background: status === "submitting" ? "#252f45" : "#00d4a1",
                  color: status === "submitting" ? "#9aa3b0" : "#0d1624",
                }}
              >
                {status === "submitting" ? (
                  <>
                    <Icon icon="mdi:loading" className="animate-spin" width={16} />
                    Creating...
                  </>
                ) : (
                  <>
                    <Icon icon="mdi:plus" width={16} />
                    Create Stock
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
