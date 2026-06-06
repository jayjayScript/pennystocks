"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { usePortfolio, formatUSD } from "@/context/PortfolioContext";

// ─── Props ────────────────────────────────────────────────────────────────────

interface BuyModalProps {
  stock: Stock;
  isOpen: boolean;
  onClose: () => void;
}

type InputMode = "usd" | "units";

const FEE_RATE = 0.001;

function parsePrice(price: string): number {
  return parseFloat(price.replace(/[$,]/g, "")) || 0;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BuyModal({ stock, isOpen, onClose }: BuyModalProps) {
  const { accountBalance, submitBuyOrder } = usePortfolio();

  const [mode, setMode] = useState<InputMode>("usd");
  const [inputValue, setInputValue] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const stockPrice = parsePrice(stock.price);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setInputValue("");
      setMode("usd");
      setStatus("idle");
      setStatusMessage("");
    }
  }, [isOpen]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // ── Derived calculations ──────────────────────────────────────────────────

  const numericInput = parseFloat(inputValue) || 0;
  const usdAmount   = mode === "usd"   ? numericInput : numericInput * stockPrice;
  const unitsAmount = mode === "units" ? numericInput : stockPrice > 0 ? numericInput / stockPrice : 0;
  const fee         = usdAmount * FEE_RATE;
  const totalCost   = usdAmount + fee;
  const balancePct  = Math.min((totalCost / accountBalance) * 100, 100);
  const isInvalid   = numericInput <= 0 || totalCost > accountBalance;

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleConfirm = () => {
    if (isInvalid) return;
    const result = submitBuyOrder(stock, usdAmount);
    setStatus(result.success ? "success" : "error");
    setStatusMessage(result.message);
    if (result.success) setTimeout(onClose, 3000);
  };

  const applyPct = (pct: number) => {
    const pctBalance = (accountBalance * pct) / 100;
    setInputValue(
      mode === "usd"
        ? pctBalance.toFixed(2)
        : (pctBalance / stockPrice).toFixed(6)
    );
  };

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  // ─── Render ───────────────────────────────────────────────────────────────

  const accentColor = stock.bgColor
    ? stock.bgColor.replace("0.1)", "1)")
    : "#00d4a1";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
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
        {/* ── Header ── */}
        <div
          className="flex items-center justify-between px-6 pt-6 pb-4"
          style={{ borderBottom: "1px solid #1d2639" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: stock.bgColor || "rgba(0,212,161,0.15)" }}
            >
              {stock.icon && <Icon icon={stock.icon} width={24} />}
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">
                Buy {stock.symbol}
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "#9aa3b0" }}>
                {stock.name} · {stock.price}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-white/10"
            style={{ color: "#9aa3b0" }}
          >
            <Icon icon="mdi:close" width={20} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="px-6 py-5 space-y-4">

          {/* ── Success / Error ── */}
          {status !== "idle" ? (
            <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: status === "success"
                    ? "rgba(245,197,24,0.15)"
                    : "rgba(244,67,54,0.15)",
                }}
              >
                <Icon
                  icon={status === "success" ? "mdi:clock-outline" : "mdi:alert-circle-outline"}
                  width={42}
                  style={{ color: status === "success" ? "#F5C518" : "#F44336" }}
                />
              </div>
              <div>
                <p className="text-white font-bold text-base">
                  {status === "success" ? "Order Submitted" : statusMessage}
                </p>
                {status === "success" && (
                  <>
                    <p className="text-sm mt-1 font-medium" style={{ color: "#F5C518" }}>
                      Pending admin approval
                    </p>
                    <p className="text-xs mt-1" style={{ color: "#9aa3b0" }}>
                      {statusMessage}
                    </p>
                  </>
                )}
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
              {/* ── Mode toggle ── */}
              <div
                className="flex rounded-xl p-1 gap-1"
                style={{ background: "#0b121d", border: "1px solid #1d2639" }}
              >
                {(["usd", "units"] as InputMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => { setMode(m); setInputValue(""); }}
                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
                    style={{
                      background: mode === m ? accentColor : "transparent",
                      color: mode === m ? "#0d1624" : "#9aa3b0",
                    }}
                  >
                    {m === "usd" ? "USD Amount" : `Units (${stock.symbol})`}
                  </button>
                ))}
              </div>

              {/* ── Input ── */}
              <div>
                <div
                  className="flex items-center rounded-2xl overflow-hidden transition-all duration-200"
                  style={{
                    background: "#0b121d",
                    border: `1.5px solid ${numericInput > 0 ? accentColor : "#252f45"}`,
                  }}
                >
                  <span className="pl-5 text-xl font-bold shrink-0" style={{ color: "#4a5568" }}>
                    {mode === "usd" ? "$" : ""}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0.00"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="flex-1 bg-transparent py-4 px-2 text-2xl font-bold text-white focus:outline-none placeholder:text-[#2d3a52]"
                    style={{ minWidth: 0 }}
                  />
                  <span className="pr-5 text-sm font-semibold shrink-0" style={{ color: "#4a5568" }}>
                    {mode === "usd" ? "USD" : stock.symbol}
                  </span>
                </div>

                {/* Calculated equivalent */}
                {numericInput > 0 && (
                  <p className="text-xs mt-2 text-center" style={{ color: "#9aa3b0" }}>
                    ≈{" "}
                    {mode === "usd"
                      ? `${parseFloat(unitsAmount.toFixed(8))} ${stock.symbol}`
                      : formatUSD(usdAmount)}
                  </p>
                )}
              </div>

              {/* ── Quick % buttons ── */}
              <div className="flex gap-2">
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => applyPct(pct)}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-150 hover:opacity-80 active:scale-95"
                    style={{ background: "#1a2438", color: "#9aa3b0", border: "1px solid #252f45" }}
                  >
                    {pct}%
                  </button>
                ))}
              </div>

              {/* ── Summary ── */}
              <div
                className="rounded-2xl p-4 space-y-3"
                style={{ background: "#0b121d", border: "1px solid #1d2639" }}
              >
                <div className="flex justify-between items-center text-sm">
                  <span style={{ color: "#9aa3b0" }}>Available Balance</span>
                  <span className="font-bold text-white">{formatUSD(accountBalance)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span style={{ color: "#9aa3b0" }}>Est. Fee (0.1%)</span>
                  <span className="font-medium" style={{ color: "#F5C518" }}>
                    {numericInput > 0 ? formatUSD(fee) : "—"}
                  </span>
                </div>
                <div style={{ height: "1px", background: "#1d2639" }} />
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-white">Total Cost</span>
                  <span
                    className="font-bold text-base"
                    style={{ color: totalCost > accountBalance ? "#F44336" : accentColor }}
                  >
                    {numericInput > 0 ? formatUSD(totalCost) : "—"}
                  </span>
                </div>

                {/* Progress bar */}
                {numericInput > 0 && (
                  <div>
                    <div className="flex justify-between text-xs mb-1.5" style={{ color: "#6b7785" }}>
                      <span>{balancePct.toFixed(1)}% of balance used</span>
                      <span>{formatUSD(Math.max(accountBalance - totalCost, 0))} left</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "#1d2639" }}>
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${balancePct}%`,
                          background:
                            totalCost > accountBalance
                              ? "#F44336"
                              : balancePct > 75
                              ? "#F5C518"
                              : accentColor,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Insufficient balance warning */}
              {totalCost > accountBalance && numericInput > 0 && (
                <p className="text-xs text-center font-medium" style={{ color: "#F44336" }}>
                  You need {formatUSD(totalCost - accountBalance)} more to complete this purchase.
                </p>
              )}

              {/* ── CTA ── */}
              <button
                onClick={handleConfirm}
                disabled={isInvalid}
                className="w-full py-4 rounded-2xl font-bold text-base transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                style={{
                  background: isInvalid ? "#1a2438" : accentColor,
                  color: isInvalid ? "#4a5568" : "#0d1624",
                  boxShadow: !isInvalid ? `0 12px 30px -8px ${accentColor}55` : "none",
                }}
              >
                {numericInput > 0 && !isInvalid
                  ? `Buy ${parseFloat(unitsAmount.toFixed(6))} ${stock.symbol} · ${formatUSD(totalCost)}`
                  : `Buy ${stock.symbol}`}
              </button>

              <button
                onClick={onClose}
                className="w-full pb-1 text-sm font-medium transition-colors hover:text-white"
                style={{ color: "#6b7785" }}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
