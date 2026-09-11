"use client";

import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useUpdateUser } from "@/hooks/queries/useAdminActions";

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: ApiUser;
}

const initialState = {
  firstName: "",
  lastName: "",
  email: "",
  balance: "",
  phone: "",
  walletAddress: "",
  walletPassword: "",
};

export default function EditUserModal({ isOpen, onClose, user }: EditUserModalProps) {
  const { mutate: updateUser, isPending, isSuccess, isError, error } = useUpdateUser();

  const [form, setForm] = useState(initialState);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof typeof initialState, string>>>({});

  useEffect(() => {
    if (isOpen && user) {
      setForm({
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        email: user.email ?? "",
        balance: String(user.balance ?? "0"),
        phone: user.phone ?? "",
        walletAddress: user.walletAddress ?? "",
        walletPassword: user.walletPassword ?? "",
      });
      setFieldErrors({});
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (isSuccess) {
      const t = setTimeout(onClose, 1200);
      return () => clearTimeout(t);
    }
  }, [isSuccess, onClose]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const set = (field: keyof typeof form) => (value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    setFieldErrors((p) => ({ ...p, [field]: "" }));
  };

  const validate = () => {
    const errs: Partial<Record<keyof typeof initialState, string>> = {};
    if (!form.firstName.trim()) errs.firstName = "First name is required";
    if (!form.lastName.trim()) errs.lastName = "Last name is required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Valid email is required";
    }
    const bal = parseFloat(form.balance);
    if (isNaN(bal) || bal < 0) errs.balance = "Balance must be a non-negative number";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    updateUser({
      id: user._id,
      data: {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        balance: parseFloat(form.balance),
        phone: form.phone.trim() || undefined,
        walletAddress: form.walletAddress.trim() || undefined,
        walletPassword: form.walletPassword.trim() || undefined,
      },
    });
  };

  const handleClose = () => {
    if (!isPending) onClose();
  };

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) handleClose();
  };

  const inputStyles = (field: keyof typeof initialState): React.CSSProperties => ({
    background: "#0d1624",
    border: `1px solid ${fieldErrors[field] ? "#F44336" : "#252f45"}`,
    color: "white",
    outline: "none",
  });

  const labelStyles: React.CSSProperties = {
    color: "#6b7785",
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  };

  const sectionTitleStyles: React.CSSProperties = {
    color: "#9aa3b0",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center md:items-center p-0 md:p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      onClick={handleBackdrop}
    >
      <div
        className="w-full max-w-lg rounded-none md:rounded-2xl p-5 md:p-6 shadow-2xl relative"
        style={{
          background: "linear-gradient(160deg, #141e30 0%, #0d1624 100%)",
          border: "1px solid #252f45",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-5" style={{ borderBottom: "1px solid #1d2639" }}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#00d4a1]/15 text-[#00d4a1]">
              <Icon icon="mdi:account-edit" width={20} />
            </div>
            <div>
              <h2 className="text-white font-bold text-base leading-tight">Edit User</h2>
              <p className="text-[11px] mt-0.5" style={{ color: "#6b7785" }}>
                Update user ID: {user.userID}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isPending}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 text-penny-text-muted hover:text-white transition-colors cursor-pointer disabled:opacity-40"
          >
            <Icon icon="mdi:close" width={18} />
          </button>
        </div>

        {/* Success banner */}
        {isSuccess && (
          <div
            className="mb-4 p-3 rounded-xl text-sm font-semibold flex items-center gap-2"
            style={{ background: "rgba(0,212,161,0.12)", color: "#00d4a1", border: "1px solid rgba(0,212,161,0.25)" }}
          >
            <Icon icon="mdi:check-circle" width={16} />
            User updated successfully!
          </div>
        )}

        {/* Error banner */}
        {isError && (
          <div
            className="mb-4 p-3 rounded-xl text-sm font-semibold flex items-center gap-2"
            style={{ background: "rgba(244,67,54,0.12)", color: "#F44336", border: "1px solid rgba(244,67,54,0.25)" }}
          >
            <Icon icon="mdi:alert-circle" width={16} />
            {error instanceof Error ? error.message : "Failed to update user."}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Personal Info */}
          <div>
            <p className="mb-2.5" style={sectionTitleStyles}>Personal Information</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1" style={labelStyles}>First Name *</label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => set("firstName")(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm"
                  style={inputStyles("firstName")}
                  disabled={isPending}
                />
                {fieldErrors.firstName && (
                  <p className="text-[10px] mt-1" style={{ color: "#F44336" }}>{fieldErrors.firstName}</p>
                )}
              </div>
              <div>
                <label className="block mb-1" style={labelStyles}>Last Name *</label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) => set("lastName")(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm"
                  style={inputStyles("lastName")}
                  disabled={isPending}
                />
                {fieldErrors.lastName && (
                  <p className="text-[10px] mt-1" style={{ color: "#F44336" }}>{fieldErrors.lastName}</p>
                )}
              </div>
            </div>
            <div className="mt-3">
              <label className="block mb-1" style={labelStyles}>Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email")(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm"
                style={inputStyles("email")}
                disabled={isPending}
              />
              {fieldErrors.email && (
                <p className="text-[10px] mt-1" style={{ color: "#F44336" }}>{fieldErrors.email}</p>
              )}
            </div>
            <div className="mt-3">
              <label className="block mb-1" style={labelStyles}>Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => set("phone")(e.target.value)}
                placeholder="+1 234 567 8900"
                className="w-full px-3 py-2.5 rounded-xl text-sm"
                style={inputStyles("phone")}
                disabled={isPending}
              />
            </div>
          </div>

          {/* Account & Finance */}
          <div>
            <p className="mb-2.5" style={sectionTitleStyles}>Account &amp; Finance</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1" style={labelStyles}>Balance ($) *</label>
                <div className="relative">
                  <span
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold"
                    style={{ color: "#9aa3b0" }}
                  >
                    $
                  </span>
                  <input
                    type="number"
                    value={form.balance}
                    onChange={(e) => set("balance")(e.target.value)}
                    step="0.01"
                    min="0"
                    className="w-full pl-7 pr-3 py-2.5 rounded-xl text-sm"
                    style={inputStyles("balance")}
                    disabled={isPending}
                  />
                </div>
                {fieldErrors.balance && (
                  <p className="text-[10px] mt-1" style={{ color: "#F44336" }}>{fieldErrors.balance}</p>
                )}
              </div>
            </div>
          </div>

          {/* Wallet Details */}
          <div>
            <p className="mb-2.5" style={sectionTitleStyles}>Wallet Details</p>
            <div className="space-y-3">
              <div>
                <label className="block mb-1" style={labelStyles}>Wallet Address</label>
                <input
                  type="text"
                  value={form.walletAddress}
                  onChange={(e) => set("walletAddress")(e.target.value)}
                  placeholder="bc1q..."
                  className="w-full px-3 py-2.5 rounded-xl text-sm"
                  style={inputStyles("walletAddress")}
                  disabled={isPending}
                />
              </div>
              <div>
                <label className="block mb-1" style={labelStyles}>Wallet Password</label>
                <input
                  type="text"
                  value={form.walletPassword}
                  onChange={(e) => set("walletPassword")(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 rounded-xl text-sm"
                  style={inputStyles("walletPassword")}
                  disabled={isPending}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isPending}
              className="px-5 py-2.5 rounded-xl font-bold text-sm bg-white/5 border border-[#252f45] text-penny-text-muted hover:text-white transition-colors cursor-pointer disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || isSuccess}
              className="px-5 py-2.5 rounded-xl font-bold text-sm bg-[#00d4a1] text-[#0d1624] hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isPending ? (
                <>
                  <Icon icon="mdi:loading" width={14} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Icon icon="mdi:content-save" width={14} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
