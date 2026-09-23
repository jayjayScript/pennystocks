"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { useQueryClient } from "@tanstack/react-query";
import { stocksApi } from "@/lib/api/backend";

function formatUSD(val: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);
}

export interface SellStockAsset {
  purchaseId?: string;
  stockId?: string;
  symbol: string;
  name: string;
  amount?: string;
  availableShares?: number;
  price?: string | number;
  bgColor?: string;
  icon?: string;
}

interface SellModalProps {
  asset: SellStockAsset;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function SellModal({ asset, isOpen, onClose, onSuccess }: SellModalProps) {
  const qc = useQueryClient();

  const [quantityInput, setQuantityInput] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setQuantityInput("");
      setStatus("idle");
      setStatusMessage("");
      setIsSubmitting(false);
    }
  }

  // Lock body scroll
  React.useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentPrice =
    typeof asset.price === "number"
      ? asset.price
      : parseFloat((asset.price ?? "0").replace(/[$,]/g, "")) || 0;

  const maxShares = asset.availableShares ?? 0;
  const numShares = parseFloat(quantityInput) || 0;
  const estimatedProceeds = numShares * currentPrice;
  const isInvalid = numShares <= 0 || numShares > maxShares;

  const handleApplyPct = (pct: number) => {
    const qty = (maxShares * pct) / 100;
    setQuantityInput(qty > 0 ? (Number.isInteger(qty) ? qty.toString() : qty.toFixed(4)) : "");
  };

  const handleConfirm = async () => {
    if (isInvalid) return;
    if (!asset.purchaseId) {
      setStatus("error");
      setStatusMessage("Cannot complete sale: purchase ID is missing.");
      return;
    }

    try {
      setIsSubmitting(true);
      const qty = parseFloat(numShares.toFixed(6));
      const res = await stocksApi.sell(asset.purchaseId, qty);

      qc.invalidateQueries({ queryKey: ["my-stock-purchases"] });
      qc.invalidateQueries({ queryKey: ["user-profile"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });

      setStatus("success");
      setStatusMessage(`Sold ${qty} shares. Proceeds: ${formatUSD(res.proceeds ?? estimatedProceeds)}.`);
      setTimeout(() => {
        onClose();
        onSuccess?.();
      }, 2000);
    } catch (err) {
      setStatus("error");
      setStatusMessage(err instanceof Error ? err.message : "Sell order failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(6,10,18,0.88)", backdropFilter: "blur(10px)" }}
      onClick={handleBackdrop}
    >
      <div
        className="w-full max-w-md rounded-3xl shadow-2xl"
        style={{
          background: "linear-gradient(160deg, #141e30 0%, #0d1624 100%)",
          border: "1px solid #252f45",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 pt-6 pb-4"
          style={{ borderBottom: "1px solid #1d2639" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: asset.bgColor || "rgba(244,67,54,0.15)" }}
            >
              <Icon icon={asset.icon || "mdi:chart-line"} width={24} style={{ color: "#F44336" }} />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">
                Sell {asset.symbol}
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "#9aa3b0" }}>
                {asset.name} · {formatUSD(currentPrice)}/share
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-white/10 cursor-pointer"
            style={{ color: "#9aa3b0" }}
          >
            <Icon icon="mdi:close" width={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {status !== "idle" ? (
            <div className="flex flex-col items-center justify-center py-8 text-center gap-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: status === "success" ? "rgba(0,212,161,0.15)" : "rgba(244,67,54,0.15)",
                }}
              >
                <Icon
                  icon={status === "success" ? "mdi:check-circle-outline" : "mdi:alert-circle-outline"}
                  width={36}
                  style={{ color: status === "success" ? "#00d4a1" : "#F44336" }}
                />
              </div>
              <div>
                <p className="text-white font-bold text-base">
                  {status === "success" ? "Sale Complete" : "Sale Failed"}
                </p>
                <p className="text-sm mt-1" style={{ color: "#9aa3b0" }}>
                  {statusMessage}
                </p>
              </div>
              {status === "error" && (
                <button
                  onClick={() => setStatus("idle")}
                  className="text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors hover:bg-white/10"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    color: "#fff",
                    border: "1px solid #252f45",
                  }}
                >
                  Try Again
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Available Shares Card */}
              <div
                className="rounded-2xl p-4 flex items-center justify-between"
                style={{ background: "#0d1624", border: "1px solid #1d2639" }}
              >
                <div>
                  <p className="text-xs" style={{ color: "#6b7785" }}>Available to Sell</p>
                  <p className="text-lg font-bold text-white mt-0.5">
                    {maxShares} <span className="text-xs font-normal" style={{ color: "#9aa3b0" }}>shares</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs" style={{ color: "#6b7785" }}>Total Value</p>
                  <p className="text-lg font-bold text-white mt-0.5">
                    {formatUSD(maxShares * currentPrice)}
                  </p>
                </div>
              </div>

              {/* Shares input */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#9aa3b0" }}>
                  Shares to Sell
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max={maxShares}
                    step="any"
                    placeholder="0.00"
                    value={quantityInput}
                    onChange={(e) => setQuantityInput(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-white text-base font-semibold bg-[#0d1624] border border-[#252f45] focus:outline-none focus:border-[#F44336]"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold" style={{ color: "#6b7785" }}>
                    SHARES
                  </span>
                </div>
                {numShares > maxShares && (
                  <p className="text-xs mt-1 font-medium" style={{ color: "#F44336" }}>
                    Cannot sell more than your {maxShares} available shares.
                  </p>
                )}
              </div>

              {/* Percentage Presets */}
              <div className="grid grid-cols-4 gap-2">
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handleApplyPct(pct)}
                    className="py-2 rounded-xl text-xs font-bold transition-all hover:bg-white/10"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      color: "#9aa3b0",
                      border: "1px solid #252f45",
                    }}
                  >
                    {pct === 100 ? "MAX" : `${pct}%`}
                  </button>
                ))}
              </div>

              {/* Order Summary */}
              <div
                className="rounded-2xl p-4 space-y-2 text-xs"
                style={{ background: "#0d1624", border: "1px solid #1d2639" }}
              >
                <div className="flex justify-between" style={{ color: "#9aa3b0" }}>
                  <span>Price per Share</span>
                  <span className="font-semibold text-white">{formatUSD(currentPrice)}</span>
                </div>
                <div className="flex justify-between" style={{ color: "#9aa3b0" }}>
                  <span>Shares</span>
                  <span className="font-semibold text-white">{numShares || 0}</span>
                </div>
                <div className="pt-2 border-t border-[#1d2639] flex justify-between text-sm">
                  <span className="font-bold text-white">Estimated Proceeds</span>
                  <span className="font-bold" style={{ color: "#00d4a1" }}>
                    {formatUSD(estimatedProceeds)}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleConfirm}
                disabled={isInvalid || isSubmitting}
                className="w-full py-3.5 rounded-xl font-bold text-sm transition-all disabled:cursor-not-allowed cursor-pointer hover:-translate-y-0.5 active:translate-y-0 disabled:hover:translate-y-0"
                style={{
                  background: isInvalid ? "#1a2438" : "#F44336",
                  color: isInvalid ? "#6b7785" : "#ffffff",
                  boxShadow: !isInvalid ? "0 12px 30px -8px rgba(244,67,54,0.55)" : "none",
                }}
              >
                {isSubmitting ? "Executing Sale..." : `Sell ${asset.symbol}`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
