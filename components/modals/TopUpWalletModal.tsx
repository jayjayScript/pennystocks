"use client";

import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { usePortfolio } from "@/context/PortfolioContext";
import { useCopyTrading } from "@/context/CopyTradingContext";

interface TopUpWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_AMOUNTS = [50, 100, 250, 500];

const initialState = {
  amount: "",
  error: "",
  status: "idle" as "idle" | "error",
};

export default function TopUpWalletModal({ isOpen, onClose }: TopUpWalletModalProps) {
  const { accountBalance } = usePortfolio();
  const { topUpCopyWallet, formatUSD } = useCopyTrading();
  const [form, setForm] = useState(initialState);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const setAmount = (value: string) => {
    setForm((p) => ({ ...p, amount: value, error: "", status: "idle" }));
  };

  const handlePreset = (preset: number) => {
    setAmount(String(preset));
  };

  const validate = () => {
    const amount = parseFloat(form.amount);
    if (!form.amount || isNaN(amount) || amount <= 0) {
      setForm((p) => ({ ...p, error: "Enter a valid amount", status: "error" }));
      return false;
    }
    if (amount > accountBalance) {
      setForm((p) => ({
        ...p,
        error: `Insufficient balance. You have ${formatUSD(accountBalance)} available.`,
        status: "error",
      }));
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const amount = parseFloat(form.amount);
    topUpCopyWallet(amount);
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

  if (!isOpen) return null;

  const inputStyles: React.CSSProperties = {
    background: "#0d1624",
    border: `1px solid ${form.error ? "#F44336" : "#252f45"}`,
    color: "white",
    outline: "none",
  };

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
            <div className="p-2 rounded-xl bg-[#F5C518]/15 text-[#F5C518]">
              <Icon icon="mdi:wallet-plus" width={22} />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">Top Up Copy Wallet</h2>
              <p className="text-xs text-penny-text-muted mt-0.5">
                Available: {formatUSD(accountBalance)}
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Preset amounts */}
          <div>
            <label className="block text-xs font-semibold mb-2 text-penny-text-muted">
              Quick Add
            </label>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_AMOUNTS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handlePreset(String(preset))}
                  className="py-2 rounded-xl text-xs font-semibold transition-all"
                  style={{
                    background:
                      form.amount === String(preset) ? "rgba(245,197,24,0.15)" : "#0d1624",
                    border: `1px solid ${form.amount === String(preset) ? "#F5C518" : "#252f45"}`,
                    color: form.amount === String(preset) ? "#F5C518" : "#9aa3b0",
                  }}
                >
                  ${preset}
                </button>
              ))}
            </div>
          </div>

          {/* Custom amount */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-penny-text-muted">
              Or enter custom amount
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

          {/* Info note */}
          <div
            className="p-3 rounded-xl text-xs flex items-start gap-2"
            style={{ background: "rgba(0,212,161,0.06)", border: "1px solid rgba(0,212,161,0.15)", color: "#9aa3b0" }}
          >
            <Icon icon="mdi:information-outline" width={14} className="shrink-0 mt-0.5" style={{ color: "#00d4a1" }} />
            Funds transfer instantly from your main balance to your copy trading wallet.
          </div>

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
              className="px-5 py-2.5 rounded-xl font-bold text-sm bg-[#F5C518] text-[#0d1624] hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Icon icon="mdi:wallet-plus" width={16} />
              Top Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
