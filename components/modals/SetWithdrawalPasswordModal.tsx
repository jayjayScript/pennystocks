"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { usePortfolio } from "@/context/PortfolioContext";

interface SetWithdrawalPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SetWithdrawalPasswordModal({ isOpen, onClose }: SetWithdrawalPasswordModalProps) {
  const { setWithdrawalPassword } = usePortfolio();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "success">("idle");

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const result = await setWithdrawalPassword(password);
    if (result && !result.success) {
      setError(result.message);
    } else {
      setStatus("success");
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
              <Icon icon="mdi:shield-key-outline" width={22} />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">Create Withdrawal Password</h2>
              <p className="text-xs text-penny-text-muted mt-0.5">Set a secure password for withdrawal transactions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 text-penny-text-muted hover:text-white transition-colors cursor-pointer"
          >
            <Icon icon="mdi:close" width={18} />
          </button>
        </div>

        {status === "success" ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#00d4a1]/15 flex items-center justify-center mb-4">
              <Icon icon="mdi:shield-check-outline" width={36} className="text-[#00d4a1]" />
            </div>
            <h3 className="text-white font-bold text-lg mb-1">Password Set Successfully</h3>
            <p className="text-sm text-penny-text-muted max-w-xs leading-normal mb-6">
              Your withdrawal password has been created. You will need this password for all future withdrawal transactions.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl font-bold text-sm bg-white/5 border border-[#252f45] text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-penny-text-muted">New Password</label>
              <input
                type="password"
                placeholder="Enter your new withdrawal password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm bg-[#0d1624] border border-[#252f45] text-white focus:outline-none focus:border-[#F44336]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 text-penny-text-muted">Confirm Password</label>
              <input
                type="password"
                placeholder="Re-enter your withdrawal password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                className="flex-1 py-3 rounded-xl font-bold text-sm bg-white/5 border border-[#252f45] text-penny-text-muted hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl font-bold text-sm bg-[#F44336] text-white hover:opacity-90 active:scale-95 transition-all cursor-pointer"
              >
                Set Password
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}