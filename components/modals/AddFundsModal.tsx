"use client";

import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useCopyTrading } from "@/context/CopyTradingContext";

interface AddFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  trade: ActiveCopyTrade | null;
}

const initialState = {
  amount: "",
  error: "",
};

export default function AddFundsModal({ isOpen, onClose, trade }: AddFundsModalProps) {
  const { copyWalletBalance, addToActiveTrade, formatUSD } = useCopyTrading();
  const [form, setForm] = useState(initialState);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen || !trade) return null;

  const setAmount = (value: string) => {
    setForm((p) => ({ ...p, amount: value, error: "" }));
  };

  const validate = () => {
    const amount = parseFloat(form.amount);
    if (!form.amount || isNaN(amount) || amount <= 0) {
      setForm((p) => ({ ...p, error: "Enter a valid amount", status: "error" }));
      return false;
    }
    if (amount > copyWalletBalance) {
      setForm((p) => ({
        ...p,
        error: `Insufficient wallet balance. You have ${formatUSD(copyWalletBalance)} available.`,
      }));
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    addToActiveTrade(trade.id, parseFloat(form.amount));
    setForm(initialState);
    onClose();
  };

  const handleClose = () => {
    setForm(initialState);
    onClose();
  };

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) handleClose();
  };

  const inputStyles: React.CSSProperties = {
    background: "#0d1624",
    border: `1px solid ${form.error ? "#F44336" : "#252f45"}`,
    color: "white",
    outline: "none",
  };

  const currentValue = trade.investedAmount + trade.pnl;
  const newAmount = parseFloat(form.amount) || 0;
  const newInvested = trade.investedAmount + newAmount;
  const newPnLPercent = newInvested > 0
    ? parseFloat(((trade.pnl / newInvested) * 100).toFixed(2))
    : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center md:p-4 bg-black/80 backdrop-blur-md"
      onClick={handleBackdrop}
    >
      <div
        className="w-full h-screen md:h-auto md:max-h-[90vh] max-w-sm rounded-none md:rounded-3xl p-6 shadow-2xl relative overflow-y-auto"
        style={{
          background: "linear-gradient(160deg, #141e30 0%, #0d1624 100%)",
          border: "1px solid #252f45",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1d2639] mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#00d4a1]/15 text-[#00d4a1]">
              <Icon icon="mdi:plus-circle" width={22} />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">Add Funds</h2>
              <p className="text-xs text-penny-text-muted mt-0.5">
                Topping up {trade.setup.traderNickname}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 text-penny-text-muted hover:text-white transition-colors cursor-pointer"
          >
            <Icon icon="mdi:close" width={18} />
          </button>
        </div>

        {/* Current trade info */}
        <div
          className="p-3 rounded-xl mb-4"
          style={{ background: "#0d1624", border: "1px solid #252f45" }}
        >
          <div className="flex justify-between text-xs mb-1.5">
            <span style={{ color: "#6b7785" }}>Current Invested</span>
            <span className="text-white font-semibold">{formatUSD(trade.investedAmount)}</span>
          </div>
          <div className="flex justify-between text-xs mb-1.5">
            <span style={{ color: "#6b7785" }}>Current PnL</span>
            <span className="font-semibold" style={{ color: trade.pnl >= 0 ? "#4CAF50" : "#F44336" }}>
              {trade.pnl >= 0 ? "+" : ""}{formatUSD(trade.pnl)}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span style={{ color: "#6b7785" }}>Wallet Balance</span>
            <span className="text-white font-semibold">{formatUSD(copyWalletBalance)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-penny-text-muted">
              Amount to Add ($)
            </label>
            <div className="relative">
              <span
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold"
                style={{ color: "#9aa3b0" }}
              >
                $
              </span>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0.01"
                className="w-full pl-7 pr-3.5 py-2.5 rounded-xl text-sm"
                style={inputStyles}
              />
            </div>
            {form.error && (
              <p className="text-xs mt-1" style={{ color: "#F44336" }}>
                {form.error}
              </p>
            )}
          </div>

          {/* Projection */}
          {newAmount > 0 && (
            <div
              className="p-3 rounded-xl text-xs space-y-1.5"
              style={{ background: "rgba(0,212,161,0.06)", border: "1px solid rgba(0,212,161,0.15)" }}
            >
              <p className="font-semibold text-white mb-1">After adding funds:</p>
              <div className="flex justify-between">
                <span style={{ color: "#6b7785" }}>New Invested Amount</span>
                <span className="text-white font-semibold">{formatUSD(newInvested)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "#6b7785" }}>New PnL %</span>
                <span style={{ color: newPnLPercent >= 0 ? "#4CAF50" : "#F44336", fontWeight: 600 }}>
                  {newPnLPercent >= 0 ? "+" : ""}{newPnLPercent.toFixed(2)}%
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 rounded-xl font-bold text-sm bg-white/5 border border-[#252f45] text-penny-text-muted hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl font-bold text-sm bg-[#00d4a1] text-[#0d1624] hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Icon icon="mdi:plus" width={16} />
              Add Funds
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
