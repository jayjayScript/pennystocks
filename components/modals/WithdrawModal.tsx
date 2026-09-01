"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { usePortfolio } from "@/context/PortfolioContext";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WithdrawModal({ isOpen, onClose }: WithdrawModalProps) {
  const { accountBalance, submitWithdrawOrder, withdrawalPassword, setWithdrawalPassword } = usePortfolio();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "success">("idle");

  const passwordNotSet = withdrawalPassword === "";


  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid withdrawal amount.");
      return;
    }
    if (parsedAmount > accountBalance) {
      setError("Insufficient funds in account balance.");
      return;
    }

    if (passwordNotSet) {
      if (password.trim() === "") {
        setError("Please enter a withdrawal password.");
        return;
      }
      // Save password to backend, then submit withdrawal
      await setWithdrawalPassword(password);
    } else {
      if (password !== withdrawalPassword) {
        setError("Incorrect withdrawal password.");
        return;
      }
    }

    const result = await submitWithdrawOrder(parsedAmount, note);
    if (result.success) {
      setStatus("success");
    } else {
      setError(result.message);
    }
  };

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={handleBackdrop}
    >
      <div
        className="w-full max-w-md rounded-3xl p-6 shadow-2xl relative overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #1a1018 0%, #0d1624 100%)",
          border: "1px solid #2d1a22",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1d2639] mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#F44336]/15 text-[#F44336]">
              <Icon icon="mdi:arrow-up" width={22} />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">Withdraw Funds</h2>
              <p className="text-xs text-penny-text-muted mt-0.5">Submit withdrawal request for admin confirmation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 text-penny-text-muted hover:text-white transition-colors"
          >
            <Icon icon="mdi:close" width={18} />
          </button>
        </div>

        {status === "success" ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#F44336]/15 flex items-center justify-center mb-4">
              <Icon icon="mdi:clock-outline" width={36} className="text-[#F44336]" />
            </div>
            <h3 className="text-white font-bold text-lg mb-1">Withdrawal Requested</h3>
            <p className="text-sm text-penny-text-muted max-w-xs leading-normal mb-6">
              Your withdrawal request of ${parseFloat(amount).toFixed(2)} has been submitted. The Admin will process your request and update your account balance.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl font-bold text-sm bg-white/5 border border-[#252f45] text-white hover:bg-white/10 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5 text-penny-text-muted">
                <span>Withdraw Amount (USD)</span>
                <span>Available: ${accountBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-penny-text-muted font-bold text-lg">$</span>
                <input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 rounded-xl text-base font-bold bg-[#0d1624] border border-[#252f45] text-white focus:outline-none focus:border-[#F44336]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 text-penny-text-muted">Account Details (e.g. Bank Info / Wallet Address)</label>
              <textarea
                placeholder="Enter details where you want the funds sent..."
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-[#0d1624] border border-[#252f45] text-white focus:outline-none focus:border-[#F44336] resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 text-penny-text-muted">
                {passwordNotSet ? "Create Withdrawal Password" : "Withdrawal Password"}
              </label>
              <input
                type="password"
                placeholder={passwordNotSet ? "Set your withdrawal password" : "Enter your withdrawal password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm bg-[#0d1624] border border-[#252f45] text-white focus:outline-none focus:border-[#F44336]"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-[#F44336]/10 border border-[#F44336]/20 text-xs font-medium text-[#F44336]">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl font-bold text-sm bg-white/5 border border-[#252f45] text-penny-text-muted hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl font-bold text-sm bg-[#F44336] text-white hover:opacity-90 active:scale-95 transition-all"
              >
                Request Withdrawal
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
