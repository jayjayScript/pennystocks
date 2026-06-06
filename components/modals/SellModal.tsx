"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { usePortfolio, formatUSD } from "@/context/PortfolioContext";

// ─── Props ────────────────────────────────────────────────────────────────────

interface SellModalProps {
  asset: PortfolioAsset;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void; // called when the full position is sold
}

type InputMode = "units" | "usd";
const FEE_RATE = 0.001;

function parsePrice(price: string): number {
  return parseFloat(price.replace(/[$,]/g, "")) || 0;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SellModal({
  asset,
  isOpen,
  onClose,
  onSuccess,
}: SellModalProps) {
  const { submitSellOrder } = usePortfolio();

  const [mode, setMode]           = useState<InputMode>("units");
  const [inputValue, setInputValue] = useState("");
  const [status, setStatus]       = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  // Pre-computed asset values
  const stockPrice  = parsePrice(asset.price);
  const ownedUnits  = parseFloat(asset.amount);
  const totalUSD    = ownedUnits * stockPrice;

  // ── Reset on open ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (isOpen) {
      setInputValue("");
      setMode("units");
      setStatus("idle");
      setStatusMessage("");
    }
  }, [isOpen]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else         document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // ── Derived calculations ──────────────────────────────────────────────────

  const numericInput  = parseFloat(inputValue) || 0;
  const unitsToSell   = mode === "units" ? numericInput : (stockPrice > 0 ? numericInput / stockPrice : 0);
  const usdEquiv      = mode === "usd"   ? numericInput : numericInput * stockPrice;
  const grossValue    = unitsToSell * stockPrice;
  const fee           = grossValue * FEE_RATE;
  const netReceive    = grossValue - fee;
  const positionPct   = ownedUnits > 0 ? Math.min((unitsToSell / ownedUnits) * 100, 100) : 0;
  const isSellAll     = positionPct >= 99.9999;
  const isInvalid     = numericInput <= 0 || unitsToSell > ownedUnits + 0.000001;

  // ── Handlers ─────────────────────────────────────────────────────────────

  const applyPct = (pct: number) => {
    if (mode === "units") {
      setInputValue(parseFloat((ownedUnits * pct / 100).toFixed(8)).toString());
    } else {
      setInputValue(parseFloat((totalUSD * pct / 100).toFixed(2)).toString());
    }
  };

  const handleSell = () => {
    if (isInvalid) return;
    const result = submitSellOrder(asset, unitsToSell);
    setStatus(result.success ? "success" : "error");
    setStatusMessage(result.message);
    if (result.success) {
      setTimeout(() => {
        onClose();
      }, 3000);
    }
  };

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  const accentColor = asset.bgColor
    ? asset.bgColor.replace("0.1)", "1)")
    : "#00d4a1";

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(6,10,18,0.88)", backdropFilter: "blur(10px)" }}
      onClick={handleBackdrop}
    >
      <div
        className="w-full max-w-md rounded-3xl shadow-2xl"
        style={{
          background: "linear-gradient(160deg, #1a1018 0%, #0d1624 100%)",
          border: "1px solid #2d1a22",
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
              style={{ background: asset.bgColor || "rgba(244,67,54,0.12)" }}
            >
              {asset.icon && <Icon icon={asset.icon} width={24} />}
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">
                Sell {asset.symbol}
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "#9aa3b0" }}>
                {asset.name} · {asset.price}
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
              {/* ── Position pill ── */}
              <div
                className="flex items-center justify-between px-4 py-3 rounded-2xl"
                style={{ background: "#0b0d18", border: "1px solid #1d2639" }}
              >
                <div>
                  <p className="text-xs mb-0.5" style={{ color: "#9aa3b0" }}>
                    You own
                  </p>
                  <p className="text-white font-bold text-sm">
                    {asset.amount} {asset.symbol}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs mb-0.5" style={{ color: "#9aa3b0" }}>
                    Total value
                  </p>
                  <p className="font-bold text-sm" style={{ color: accentColor }}>
                    {asset.value}
                  </p>
                </div>
              </div>

              {/* ── Mode toggle ── */}
              <div
                className="flex rounded-xl p-1 gap-1"
                style={{ background: "#0b121d", border: "1px solid #1d2639" }}
              >
                {(["units", "usd"] as InputMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => { setMode(m); setInputValue(""); }}
                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
                    style={{
                      background: mode === m ? "#F44336" : "transparent",
                      color: mode === m ? "#fff" : "#9aa3b0",
                    }}
                  >
                    {m === "units" ? `Units (${asset.symbol})` : "USD Amount"}
                  </button>
                ))}
              </div>

              {/* ── Input ── */}
              <div>
                <div
                  className="flex items-center rounded-2xl overflow-hidden transition-all duration-200"
                  style={{
                    background: "#0b121d",
                    border: `1.5px solid ${
                      numericInput > 0
                        ? unitsToSell > ownedUnits
                          ? "#F44336"
                          : "#F44336aa"
                        : "#252f45"
                    }`,
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
                    {mode === "units" ? asset.symbol : "USD"}
                  </span>
                </div>

                {/* Equivalent value */}
                {numericInput > 0 && (
                  <p className="text-xs mt-2 text-center" style={{ color: "#9aa3b0" }}>
                    ≈{" "}
                    {mode === "units"
                      ? formatUSD(usdEquiv)
                      : `${parseFloat(unitsToSell.toFixed(8))} ${asset.symbol}`}
                  </p>
                )}

                {/* Over-limit warning */}
                {unitsToSell > ownedUnits + 0.000001 && (
                  <p className="text-xs mt-2 text-center font-medium" style={{ color: "#F44336" }}>
                    You only own {asset.amount} {asset.symbol}
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
                    style={{
                      background: pct === 100 ? "rgba(244,67,54,0.15)" : "#1a2438",
                      color: pct === 100 ? "#F44336" : "#9aa3b0",
                      border: `1px solid ${pct === 100 ? "rgba(244,67,54,0.3)" : "#252f45"}`,
                    }}
                  >
                    {pct === 100 ? "Max" : `${pct}%`}
                  </button>
                ))}
              </div>

              {/* ── Summary card ── */}
              <div
                className="rounded-2xl p-4 space-y-3"
                style={{ background: "#0b121d", border: "1px solid #1d2639" }}
              >
                <div className="flex justify-between items-center text-sm">
                  <span style={{ color: "#9aa3b0" }}>Selling</span>
                  <span className="font-semibold text-white">
                    {numericInput > 0
                      ? `${parseFloat(unitsToSell.toFixed(6))} ${asset.symbol}`
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span style={{ color: "#9aa3b0" }}>Gross Value</span>
                  <span className="font-semibold text-white">
                    {numericInput > 0 ? formatUSD(grossValue) : "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span style={{ color: "#9aa3b0" }}>Fee (0.1%)</span>
                  <span style={{ color: "#F5C518" }}>
                    {numericInput > 0 ? `−${formatUSD(fee)}` : "—"}
                  </span>
                </div>
                <div style={{ height: "1px", background: "#1d2639" }} />
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white text-sm">You&apos;ll Receive</span>
                  <span className="font-bold text-lg" style={{ color: "#4CAF50" }}>
                    {numericInput > 0 ? formatUSD(netReceive) : "—"}
                  </span>
                </div>

                {/* Position progress bar */}
                {numericInput > 0 && (
                  <div>
                    <div
                      className="flex justify-between text-xs mb-1.5"
                      style={{ color: "#6b7785" }}
                    >
                      <span>
                        {positionPct.toFixed(1)}% of position
                        {isSellAll && (
                          <span className="ml-1.5 font-semibold" style={{ color: "#F44336" }}>
                            (Selling All)
                          </span>
                        )}
                      </span>
                      <span>
                        {!isSellAll &&
                          `${parseFloat((ownedUnits - unitsToSell).toFixed(6))} ${asset.symbol} remaining`}
                      </span>
                    </div>
                    <div
                      className="w-full h-1.5 rounded-full overflow-hidden"
                      style={{ background: "#1d2639" }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(positionPct, 100)}%`,
                          background:
                            positionPct >= 100
                              ? "#F44336"
                              : positionPct > 75
                              ? "#F5C518"
                              : "#4CAF50",
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* ── CTA ── */}
              <button
                onClick={handleSell}
                disabled={isInvalid}
                className="w-full py-4 rounded-2xl font-bold text-base transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                style={{
                  background: isInvalid ? "#1a2438" : "#F44336",
                  color: isInvalid ? "#4a5568" : "#fff",
                  border: `2px solid ${isInvalid ? "#252f45" : "#F44336"}`,
                  boxShadow: !isInvalid ? "0 12px 30px -8px rgba(244,67,54,0.45)" : "none",
                }}
              >
                {numericInput > 0 && !isInvalid
                  ? `Sell ${parseFloat(unitsToSell.toFixed(6))} ${asset.symbol} · ${formatUSD(netReceive)}`
                  : `Sell ${asset.symbol}`}
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
