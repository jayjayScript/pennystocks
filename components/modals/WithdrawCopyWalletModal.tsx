"use client";

import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useCopyTrading } from "@/context/CopyTradingContext";
import { usePortfolio } from "@/context/PortfolioContext";

function formatUSD(val: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);
}

interface WithdrawCopyWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (message: string) => void;
}

const initialState = {
  amount: "",
  error: "",
};

export default function WithdrawCopyWalletModal({
  isOpen,
  onClose,
  onSuccess,
}: WithdrawCopyWalletModalProps) {
  const { copyWalletBalance, withdrawCopyWallet } = useCopyTrading();
  const { accountBalance } = usePortfolio();
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const setAmount = (value: string) => {
    setForm((p) => ({ ...p, amount: value, error: "" }));
  };

  const handleWithdrawAll = () => {
    setAmount(String(copyWalletBalance.toFixed(2)));
  };

  const validate = () => {
    const amount = parseFloat(form.amount);
    if (!form.amount || isNaN(amount) || amount <= 0) {
      setForm((p) => ({ ...p, error: "Enter a valid amount" }));
      return false;
    }
    if (amount > copyWalletBalance) {
      setForm((p) => ({
        ...p,
        error: `Insufficient copy wallet balance. You have ${formatUSD(copyWalletBalance)} available.`,
      }));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const amount = parseFloat(form.amount);
    setSubmitting(true);
    const result = await withdrawCopyWallet(amount);
    setSubmitting(false);
    if (!result.success) {
      setForm((p) => ({ ...p, error: result.message }));
      return;
    }
    setForm(initialState);
    onSuccess?.(result.message);
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
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
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
            <div className="p-2 rounded-xl bg-[#F44336]/15 text-[#F44336]">
              <Icon icon="mdi:bank-transfer-out" width={22} />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">Withdraw to Main Wallet</h2>
              <p className="text-xs text-penny-text-muted mt-0.5">
                Copy wallet: {formatUSD(copyWalletBalance)}
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
          {/* Amount */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-penny-text-muted">
                Amount to Withdraw ($)
              </label>
              <button
                type="button"
                onClick={handleWithdrawAll}
                className="text-xs font-bold cursor-pointer"
                style={{ color: "#F5C518" }}
              >
                Withdraw All
              </button>
            </div>
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
            style={{ background: "rgba(244,67,54,0.06)", border: "1px solid rgba(244,67,54,0.15)", color: "#9aa3b0" }}
          >
            <Icon icon="mdi:information-outline" width={14} className="shrink-0 mt-0.5" style={{ color: "#F44336" }} />
            Funds transfer instantly from your copy trading wallet back to your main balance
            ({formatUSD(accountBalance)}).
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
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl font-bold text-sm bg-[#F44336] text-white hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Icon icon="mdi:bank-transfer-out" width={16} />
              {submitting ? "Withdrawing…" : "Withdraw"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
