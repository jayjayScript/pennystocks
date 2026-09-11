"use client";

import { Icon } from "@iconify/react";
import { useState, useEffect } from "react";
import { useUserProfile } from "@/hooks/queries";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/lib/api/backend";
import SetWithdrawalPasswordModal from "@/components/modals/SetWithdrawalPasswordModal";
import ChangePasswordModal from "@/components/modals/ChangePasswordModal";
import DepositModal from "@/components/modals/DepositModal";

export default function ProfileScreen() {
  const { user: authUser, logout } = useAuth();
  const { data: profile, refetch, isLoading } = useUserProfile();

  const [editMode, setEditMode] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [openModal, setOpenModal] = useState<"withdraw-pw" | "change-pw" | "deposit" | null>(null);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName ?? "");
      setLastName(profile.lastName ?? "");
      setPhone(profile.phone ?? "");
      setWalletAddress(profile.walletAddress ?? "");
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      await authApi.updateProfile({ firstName, lastName, phone, walletAddress });
      await refetch();
      setSaveMsg({ kind: "ok", text: "Profile updated." });
      setEditMode(false);
    } catch (err) {
      setSaveMsg({ kind: "err", text: err instanceof Error ? err.message : "Failed to save." });
    } finally {
      setSaving(false);
    }
  };

  const initials = (profile?.firstName?.[0] ?? profile?.email?.[0] ?? "U").toUpperCase();
  const displayName = profile
    ? `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() || profile.email
    : authUser?.email ?? "User";
  const email = profile?.email ?? authUser?.email ?? "";
  const userId = profile?.userID ?? "—";
  const verified = !!(profile && !profile.isSuspended);

  const fields = [
    { label: "First Name",   value: firstName,      set: setFirstName,      icon: "mdi:account-outline" },
    { label: "Last Name",    value: lastName,       set: setLastName,       icon: "mdi:account-outline" },
    { label: "Email",        value: email,          set: () => {},          icon: "mdi:email-outline",  readOnly: true },
    { label: "Phone",        value: phone,          set: setPhone,          icon: "mdi:phone-outline" },
    { label: "Wallet Address", value: walletAddress, set: setWalletAddress, icon: "mdi:wallet-outline" },
  ];

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
              onClick={() =>{ setEditMode(false); refetch(); }}
              className="px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ background: "#151d2d", color: "#9aa3b0", border: "1px solid #252f45" }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 cursor-pointer"
              style={{ background: "#00d4a1", color: "#0d1624" }}
            >
              <Icon icon="mdi:check" width={16} />
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditMode(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150"
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

      <div
        className="rounded-2xl p-6 flex flex-col md:flex-row items-center md:items-start gap-5 relative overflow-hidden"
        style={{ background: "#151d2d", border: "1px solid #252f45" }}
      >
        <div
          className="absolute top-0 right-0 w-40 h-40 opacity-10 rounded-full translate-x-12 -translate-y-12"
          style={{ background: "#00d4a1" }}
        />
        <div className="relative">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-extrabold"
            style={{ background: "rgba(0,212,161,0.15)", color: "#00d4a1" }}
          >
            {isLoading ? "..." : initials}
          </div>
        </div>
        <div className="text-center md:text-left flex-1">
          <h2 className="text-lg font-bold text-white">{isLoading ? "..." : displayName}</h2>
          <p className="text-sm mt-0.5" style={{ color: "#9aa3b0" }}>{email}</p>
          <p className="text-xs mt-0.5" style={{ color: "#6b7785" }}>ID: {userId}</p>
          <div className="flex items-center gap-2 mt-2 justify-center md:justify-start">
            <div
              className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold"
              style={{
                background: verified ? "rgba(0,212,161,0.12)" : "rgba(244,67,54,0.12)",
                color: verified ? "#00d4a1" : "#F44336",
              }}
            >
              <Icon icon={verified ? "mdi:shield-check" : "mdi:shield-alert"} width={12} />
              {verified ? "Verified" : "Suspended"}
            </div>
            <div
              className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: "rgba(76,175,80,0.12)", color: "#4CAF50" }}
            >
              Active
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs" style={{ color: "#6b7785" }}>Balance</p>
          <p className="text-2xl font-extrabold text-white">${(profile?.balance ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field) => (
          <div
            key={field.label}
            className="rounded-xl p-4"
            style={{ background: "#151d2d", border: "1px solid #1d2639" }}
          >
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

      <div>
        <h2 className="text-sm font-bold text-white mb-3">Linked Wallet</h2>
        <div
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #1d2e44 0%, #0f1c2e 100%)",
            border: "1px solid #252f45",
          }}
        >
          <div
            className="absolute bottom-0 right-0 w-32 h-32 opacity-10 rounded-full translate-x-8 translate-y-8"
            style={{ background: "#00d4a1" }}
          />
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
              <p className="text-sm font-bold" style={{ color: "#4CAF50" }}>
                {profile?.walletPassword ? "Set" : "Not Set"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #1d2639" }}>
        {[
          { label: "Change Password",      icon: "mdi:lock-outline",            danger: false, action: () => setOpenModal("change-pw") },
          { label: "Withdrawal Password",  icon: "mdi:shield-key-outline",      danger: false, action: () => setOpenModal("withdraw-pw") },
          { label: "Notifications",        icon: "mdi:bell-outline",            danger: false, action: () => setOpenModal("deposit") },
          { label: "Privacy Policy",       icon: "mdi:file-document-outline",   danger: false, action: () => window.open("/privacy", "_blank") },
          { label: "Log Out",              icon: "mdi:logout",                  danger: true,  action: () => logout() },
        ].map((row, i, arr) => (
          <button
            key={row.label}
            onClick={row.action}
            className="w-full flex items-center justify-between px-5 py-4 transition-all duration-150 hover:opacity-80 cursor-pointer"
            style={{
              background: "#151d2d",
              borderBottom: i < arr.length - 1 ? "1px solid #1d2639" : "none",
            }}
          >
            <div className="flex items-center gap-3">
              <Icon icon={row.icon} width={18} style={{ color: row.danger ? "#F44336" : "#9aa3b0" }} />
              <span className="text-sm font-semibold" style={{ color: row.danger ? "#F44336" : "#c8d0dc" }}>
                {row.label}
              </span>
            </div>
            {!row.danger && <Icon icon="mdi:chevron-right" width={16} style={{ color: "#6b7785" }} />}
          </button>
        ))}
      </div>

      {openModal === "withdraw-pw" && (
        <SetWithdrawalPasswordModal
          isOpen
          onClose={() => setOpenModal(null)}
        />
      )}
      {openModal === "change-pw" && (
        <ChangePasswordModal
          isOpen
          onClose={() => setOpenModal(null)}
        />
      )}
      {openModal === "deposit" && (
        <DepositModal
          isOpen
          onClose={() => setOpenModal(null)}
        />
      )}
    </div>
  );
}
