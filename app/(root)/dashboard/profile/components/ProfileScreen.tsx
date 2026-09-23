"use client";

import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import ChangePasswordModal from "@/components/modals/ChangePasswordModal";
import DepositModal from "@/components/modals/DepositModal";
import { useUserProfile } from "@/hooks/queries";
import { authApi } from "@/lib/api/backend";

const formatUSD = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n);

export default function ProfileScreen() {
  const { data: profile, isLoading } = useUserProfile();
  const queryClient = useQueryClient();

  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [saveMsg, setSaveMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [openModal, setOpenModal] = useState<"change-pw" | "deposit" | null>(null);

  // Seed the editable fields from the real profile once it loads / updates.
  useEffect(() => {
    if (!profile) return;
    setFirstName(profile.firstName ?? "");
    setLastName(profile.lastName ?? "");
    setPhone(profile.phone ?? "");
    setWalletAddress(profile.walletAddress ?? "");
  }, [profile]);

  const resetFieldsFromProfile = () => {
    if (!profile) return;
    setFirstName(profile.firstName ?? "");
    setLastName(profile.lastName ?? "");
    setPhone(profile.phone ?? "");
    setWalletAddress(profile.walletAddress ?? "");
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      await authApi.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        walletAddress: walletAddress.trim(),
      });
      await queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      setSaveMsg({ kind: "ok", text: "Profile updated." });
      setEditMode(false);
      setTimeout(() => setSaveMsg(null), 3000);
    } catch (err) {
      setSaveMsg({
        kind: "err",
        text: err instanceof Error ? err.message : "Failed to update profile.",
      });
    } finally {
      setSaving(false);
    }
  };

  const email = profile?.email ?? "";
  const userID = profile?.userID ?? "";
  const balance = profile?.balance ?? 0;
  const isActive = !profile?.isSuspended;

  const displayName = `${firstName} ${lastName}`.trim() || email;
  const initials = ((firstName[0] ?? lastName[0] ?? email[0]) ?? "U").toUpperCase();

  const fields = [
    { label: "First Name",     value: firstName,     set: setFirstName,     icon: "mdi:account-outline",   readOnly: false },
    { label: "Last Name",      value: lastName,      set: setLastName,      icon: "mdi:account-outline",   readOnly: false },
    { label: "Email",          value: email,         set: () => {},         icon: "mdi:email-outline",     readOnly: true  },
    { label: "Phone",          value: phone,         set: setPhone,         icon: "mdi:phone-outline",     readOnly: false },
    { label: "Wallet Address", value: walletAddress, set: setWalletAddress, icon: "mdi:wallet-outline",    readOnly: false },
  ];

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-40 rounded-lg bg-white/10" />
          <div className="h-40 rounded-2xl bg-white/5" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-white/5" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm" style={{ color: "#9aa3b0" }}>Account settings</p>
          <h1 className="text-2xl font-bold text-white mt-0.5">Profile</h1>
        </div>
        {editMode ? (
          <div className="flex gap-2">
            <button
              onClick={() => { setEditMode(false); setSaveMsg(null); resetFieldsFromProfile(); }}
              className="px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer"
              style={{ background: "#151d2d", color: "#9aa3b0", border: "1px solid #252f45" }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: "#00d4a1", color: "#0d1624" }}
            >
              <Icon icon={saving ? "mdi:loading" : "mdi:check"} width={16} className={saving ? "animate-spin" : undefined} />
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditMode(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer"
            style={{ background: "#151d2d", color: "#9aa3b0", border: "1px solid #252f45" }}
          >
            <Icon icon="mdi:pencil-outline" width={16} />
            Edit
          </button>
        )}
      </div>

      {saveMsg && (
        <div
          className="rounded-xl p-3 text-sm"
          style={{
            background: saveMsg.kind === "ok" ? "rgba(76,175,80,0.12)" : "rgba(244,67,54,0.12)",
            color: saveMsg.kind === "ok" ? "#4CAF50" : "#F44336",
            border: `1px solid ${saveMsg.kind === "ok" ? "#4CAF5033" : "#F4433633"}`,
          }}
        >
          {saveMsg.text}
        </div>
      )}

      {/* Avatar Card */}
      <div
        className="rounded-2xl p-6 flex flex-col md:flex-row items-center md:items-start gap-5 relative overflow-hidden"
        style={{ background: "#151d2d", border: "1px solid #252f45" }}
      >
        <div className="absolute top-0 right-0 w-40 h-40 opacity-10 rounded-full translate-x-12 -translate-y-12" style={{ background: "#00d4a1" }} />
        <div className="relative">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-extrabold" style={{ background: "rgba(0,212,161,0.15)", color: "#00d4a1" }}>
            {initials}
          </div>
        </div>
        <div className="text-center md:text-left flex-1">
          <h2 className="text-lg font-bold text-white">{displayName}</h2>
          <p className="text-sm mt-0.5" style={{ color: "#9aa3b0" }}>{email}</p>
          {userID && <p className="text-xs mt-0.5" style={{ color: "#6b7785" }}>ID: {userID}</p>}
          <div className="flex items-center gap-2 mt-2 justify-center md:justify-start">
            <div className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold" style={{ background: "rgba(0,212,161,0.12)", color: "#00d4a1" }}>
              <Icon icon="mdi:shield-check" width={12} />
              Verified
            </div>
            <div
              className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold"
              style={
                isActive
                  ? { background: "rgba(76,175,80,0.12)", color: "#4CAF50" }
                  : { background: "rgba(244,67,54,0.12)", color: "#F44336" }
              }
            >
              {isActive ? "Active" : "Suspended"}
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs" style={{ color: "#6b7785" }}>Balance</p>
          <p className="text-2xl font-extrabold text-white">{formatUSD(balance)}</p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field) => (
          <div key={field.label} className="rounded-xl p-4" style={{ background: "#151d2d", border: "1px solid #1d2639" }}>
            <div className="flex items-center gap-2 mb-2">
              <Icon icon={field.icon} width={14} style={{ color: "#9aa3b0" }} />
              <p className="text-xs font-semibold" style={{ color: "#9aa3b0" }}>{field.label}</p>
            </div>
            {editMode && !field.readOnly ? (
              <input
                value={field.value}
                onChange={(e) => field.set(e.target.value)}
                className="w-full bg-transparent outline-none text-sm font-semibold text-white border-b pb-1"
                style={{ borderColor: "#00d4a1" }}
              />
            ) : (
              <p className="text-sm font-semibold text-white">{field.value || "—"}</p>
            )}
          </div>
        ))}
      </div>

      {/* Linked Wallet */}
      <div>
        <h2 className="text-sm font-bold text-white mb-3">Linked Wallet</h2>
        <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1d2e44 0%, #0f1c2e 100%)", border: "1px solid #252f45" }}>
          <div className="absolute bottom-0 right-0 w-32 h-32 opacity-10 rounded-full translate-x-8 translate-y-8" style={{ background: "#00d4a1" }} />
          <div className="flex items-center justify-between mb-6 relative z-10">
            <span className="text-xs font-bold" style={{ color: "#9aa3b0" }}>CRYPTO WALLET</span>
            <Icon icon="mdi:contactless-payment" width={24} style={{ color: "#00d4a1" }} />
          </div>
          <p className="text-base font-mono font-semibold text-white tracking-wider mb-4 relative z-10 break-all">
            {walletAddress || "No wallet address set"}
          </p>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-[10px]" style={{ color: "#9aa3b0" }}>Account Name</p>
              <p className="text-sm font-bold text-white">{displayName}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px]" style={{ color: "#9aa3b0" }}>Status</p>
              <p className="text-sm font-bold" style={{ color: isActive ? "#4CAF50" : "#F44336" }}>{isActive ? "Active" : "Suspended"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Rows */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #1d2639" }}>
        {[
          { label: "Change Password",      icon: "mdi:lock-outline",          danger: false, action: () => setOpenModal("change-pw") },
          { label: "Notifications",        icon: "mdi:bell-outline",          danger: false, action: () => setOpenModal("deposit") },
          { label: "Privacy Policy",       icon: "mdi:file-document-outline", danger: false, action: () => window.open("/privacy", "_blank") },
          { label: "Log Out",              icon: "mdi:logout",                danger: true,  action: () => { /* disconnected: no-op */ } },
        ].map((row, i, arr) => (
          <button
            key={row.label}
            onClick={row.action}
            className="w-full flex items-center justify-between px-5 py-4 transition-all duration-150 hover:opacity-80 cursor-pointer"
            style={{ background: "#151d2d", borderBottom: i < arr.length - 1 ? "1px solid #1d2639" : "none" }}
          >
            <div className="flex items-center gap-3">
              <Icon icon={row.icon} width={18} style={{ color: row.danger ? "#F44336" : "#9aa3b0" }} />
              <span className="text-sm font-semibold" style={{ color: row.danger ? "#F44336" : "#c8d0dc" }}>{row.label}</span>
            </div>
            {!row.danger && <Icon icon="mdi:chevron-right" width={16} style={{ color: "#6b7785" }} />}
          </button>
        ))}
      </div>

      {openModal === "change-pw"   && <ChangePasswordModal isOpen onClose={() => setOpenModal(null)} />}
      {openModal === "deposit"     && <DepositModal isOpen onClose={() => setOpenModal(null)} />}
    </div>
  );
}
