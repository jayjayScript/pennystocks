"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Icon } from "@iconify/react";
import { usePortfolio } from "@/context/PortfolioContext";
import { formatUSD } from "@/context/PortfolioContext";
import type { PaymentOrder, PaymentMethod } from "@/types/api";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderId?: string;
}

interface PaymentSystem {
  id: string;
  name: string;
  apiValue: PaymentMethod;
  icon: string;
  description: string;
}

const PAYMENT_METHODS: PaymentSystem[] = [
  { id: "crypto", name: "Crypto (BTC / USDT)", apiValue: "crypto", icon: "cryptocurrency:usdt", description: "Deposit using USDT or Bitcoin" },
  { id: "cashapp", name: "Cash App", apiValue: "Cash App", icon: "simple-icons:cashapp", description: "Instant transfer via Cash App" },
  { id: "paypal", name: "PayPal", apiValue: "PayPal", icon: "logos:paypal", description: "Send funds via PayPal" },
  { id: "venmo", name: "Venmo", apiValue: "Venmo", icon: "simple-icons:venmo", description: "Quick transfer using Venmo" },
  { id: "zelle", name: "Zelle", apiValue: "Zelle", icon: "simple-icons:zelle", description: "Direct transfer with Zelle" },
  { id: "wire", name: "Wire Transfer", apiValue: "Wire Transfer", icon: "mdi:bank-transfer", description: "Domestic & international wire transfer" },
  { id: "bank", name: "Bank Transfer", apiValue: "Bank Transfer", icon: "mdi:bank", description: "Direct local bank deposit" },
];

// Map backend status → user-facing step
function stepForOrder(order: PaymentOrder): "awaiting_admin_details" | "awaiting_user_proof" | "pending_approval" | "completed" {
  if (order.status === "completed") return "completed";
  if (order.status === "rejected") return "completed";
  if (order.proofPaymentDocument) return "pending_approval";
  if (order.methodDetails || order.isMethodIncluded) return "awaiting_user_proof";
  return "awaiting_admin_details";
}

export default function DepositModal({ isOpen, onClose, initialOrderId }: DepositModalProps) {
  const { pendingOrders, submitDepositOrder, submitDepositProof, refetch } = usePortfolio();

  // Only show deposits that are not permanently closed (completed/rejected/expired)
  // The modal shows the 3-step flow: awaiting-details → awaiting-proof → pending-approval
  const activeDepositOrders = useMemo(
    () => pendingOrders.filter(
      (o) =>
        o.type === "deposit" &&
        o.status !== "completed" &&
        o.status !== "rejected" &&
        o.status !== "expired"
    ),
    [pendingOrders]
  );

  const [activeTab, setActiveTab] = useState<"new" | "active">("new");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const [amount, setAmount] = useState("");
  const [selectedMethodId, setSelectedMethodId] = useState("crypto");
  const [newNote, setNewNote] = useState("");

  const [proofImage, setProofImage] = useState<string | null>(null);
  const [proofNote, setProofNote] = useState("");

  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [status, setStatus] = useState<"idle" | "request_submitted" | "proof_submitted">("idle");
  const [submitting, setSubmitting] = useState(false);

  const currentMethod = PAYMENT_METHODS.find((m) => m.id === selectedMethodId) || PAYMENT_METHODS[0];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      if (activeDepositOrders.length > 0) {
        setActiveTab("active");
        if (initialOrderId && activeDepositOrders.some((o) => o._id === initialOrderId)) {
          setSelectedOrderId(initialOrderId);
        } else {
          // Default to order awaiting user proof first, otherwise the first active order
          const readyOrder = activeDepositOrders.find((o) => stepForOrder(o) === "awaiting_user_proof");
          setSelectedOrderId(readyOrder ? readyOrder._id : activeDepositOrders[0]._id);
        }
      } else {
        setActiveTab("new");
      }
    } else {
      document.body.style.overflow = "";
      setStatus("idle");
      setError("");
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen, activeDepositOrders, initialOrderId]);

  const selectedOrder = activeDepositOrders.find((o) => o._id === selectedOrderId) || activeDepositOrders[0];
  const selectedStep = selectedOrder ? stepForOrder(selectedOrder) : null;

  const handleCopyDetails = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyAmount = (num: number) => {
    navigator.clipboard.writeText(num.toString());
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Proof file size must be under 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result as string);
        setError("");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 0.01) {
      setError("Minimum deposit amount is $0.01.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await submitDepositOrder(parsedAmount, currentMethod.apiValue, newNote);
      if (result.success) {
        setStatus("request_submitted");
        setError("");
        setAmount("");
        setNewNote("");
        refetch();
      } else {
        setError(result.message);
      }
    } catch {
      setError("Failed to submit deposit request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    if (!proofImage) {
      setError("Please select or upload your payment transfer screenshot / receipt.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await submitDepositProof(selectedOrder._id, proofImage, proofNote);
      if (result.success) {
        setStatus("proof_submitted");
        setError("");
        setProofImage(null);
        setProofNote("");
        refetch();
      } else {
        setError(result.message);
      }
    } catch {
      setError("Failed to submit proof. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      onClick={handleBackdrop}
    >
      <div
        className="w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden my-auto border border-[#252f45]"
        style={{ background: "linear-gradient(160deg, #141e30 0%, #0d1624 100%)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1d2639] mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#00d4a1]/15 text-[#00d4a1]">
              <Icon icon="mdi:arrow-down-bold" width={22} />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">Deposit Funds</h2>
              <p className="text-xs text-penny-text-muted mt-0.5">Request deposit, view details & upload proof</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 text-penny-text-muted hover:text-white transition-colors cursor-pointer"
          >
            <Icon icon="mdi:close" width={18} />
          </button>
        </div>

        {/* Status Views */}
        {status === "request_submitted" && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#00d4a1]/15 flex items-center justify-center mb-4">
              <Icon icon="mdi:clock-fast" width={32} className="text-[#00d4a1]" />
            </div>
            <h3 className="text-white font-bold text-lg mb-1">Deposit Request Sent!</h3>
            <p className="text-sm text-penny-text-muted max-w-sm leading-normal mb-6">
              Your request to deposit <span className="text-white font-bold">{amount ? formatUSD(parseFloat(amount)) : ""}</span> via{" "}
              <span className="text-[#00d4a1] font-bold">{currentMethod.name}</span> has been sent to Admin.
              <br /><br />
              Admin will send you the account/wallet details shortly. You can check back here or watch your notifications to upload payment proof.
            </p>
            <button
              onClick={() =>{ setStatus("idle"); setActiveTab("active"); }}
              className="px-8 py-3 rounded-xl font-bold text-sm bg-[#00d4a1] text-[#0d1624] hover:opacity-90 transition-all cursor-pointer"
            >
              View Active Requests
            </button>
          </div>
        )}

        {status === "proof_submitted" && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#00d4a1]/15 flex items-center justify-center mb-4">
              <Icon icon="mdi:check-circle" width={32} className="text-[#00d4a1]" />
            </div>
            <h3 className="text-white font-bold text-lg mb-1">Proof Submitted!</h3>
            <p className="text-sm text-penny-text-muted max-w-sm leading-normal mb-6">
              Your proof of payment was received. Admin is verifying your payment and will approve your balance credit shortly.
            </p>
            <button
              onClick={onClose}
              className="px-8 py-3 rounded-xl font-bold text-sm bg-[#00d4a1] text-[#0d1624] hover:opacity-90 transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        )}

        {status === "idle" && (
          <div>
            {/* Tabs */}
            {activeDepositOrders.length > 0 && (
              <div className="flex p-1 rounded-xl bg-[#0d1624] border border-[#252f45] mb-4">
                <button
                  type="button"
                  onClick={() => setActiveTab("new")}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "new" ? "bg-[#00d4a1] text-[#0d1624]" : "text-penny-text-muted hover:text-white"
                  }`}
                >
                  + New Request
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("active")}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === "active" ? "bg-[#00d4a1] text-[#0d1624]" : "text-penny-text-muted hover:text-white"
                  }`}
                >
                  <span>Active Requests</span>
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/30 font-bold">
                    {activeDepositOrders.length}
                  </span>
                </button>
              </div>
            )}

            {/* TAB: NEW DEPOSIT */}
            {activeTab === "new" && (
              <form onSubmit={handleCreateRequest} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-penny-text-muted">Deposit Amount (USD)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-penny-text-muted font-bold text-lg">$</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      min="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-9 pr-4 py-3 rounded-xl text-base font-bold bg-[#0d1624] border border-[#252f45] text-white focus:outline-none focus:border-[#00d4a1]"
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    {[100, 500, 1000, 5000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setAmount(preset.toString())}
                        className="flex-1 py-1 rounded-lg text-xs font-semibold bg-white/5 border border-[#252f45] text-penny-text-muted hover:text-white hover:border-[#00d4a1]/50 transition-colors"
                      >
                        +${preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-penny-text-muted">Select Payment Method</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto pr-1">
                    {PAYMENT_METHODS.map((method) => {
                      const isSelected = method.id === selectedMethodId;
                      return (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() =>{ setSelectedMethodId(method.id); setError(""); }}
                          className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#00d4a1]/15 border-[#00d4a1] text-white"
                              : "bg-[#0d1624] border-[#252f45] text-penny-text-muted hover:text-white hover:border-white/20"
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <Icon icon={method.icon} width={18} className={isSelected ? "text-[#00d4a1]" : ""} />
                            <span className="text-xs font-bold truncate">{method.name.split(" ")[0]}</span>
                          </div>
                          <span className="text-[10px] opacity-75 truncate">{method.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#0d1624]/70 border border-[#252f45] text-xs text-penny-text-muted flex items-start gap-2">
                  <Icon icon="mdi:information-outline" width={16} className="text-[#00d4a1] flex-shrink-0 mt-0.5" />
                  <p>
                    After submitting, Admin will respond with the payment details for{" "}
                    <span className="text-white font-semibold">{currentMethod.name}</span>. You can then view details & upload your proof of payment.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-penny-text-muted">Note for Admin (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Prefer USDT TRC-20, or sending from account name"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-[#0d1624] border border-[#252f45] text-white focus:outline-none focus:border-[#00d4a1]"
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
                    disabled={submitting}
                    className="flex-1 py-3 rounded-xl font-bold text-sm bg-[#00d4a1] text-[#0d1624] hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {submitting ? "Sending..." : "Send Request to Admin"}
                  </button>
                </div>
              </form>
            )}

            {/* TAB: ACTIVE REQUESTS */}
            {activeTab === "active" && selectedOrder && (
              <div className="space-y-4 text-left">
                {/* Order Selector (if multiple) */}
                {activeDepositOrders.length > 1 && (
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-penny-text-muted">Select Order</label>
                    <select
                      value={selectedOrder._id}
                      onChange={(e) => setSelectedOrderId(e.target.value)}
                      className="w-full p-2.5 rounded-xl text-xs font-bold bg-[#0d1624] border border-[#252f45] text-white focus:outline-none focus:border-[#00d4a1]"
                    >
                      {activeDepositOrders.map((o) => {
                        const step = stepForOrder(o);
                        const label =
                          step === "awaiting_user_proof"
                            ? "Ready for Payment"
                            : step === "pending_approval"
                            ? "Proof Under Review"
                            : "Awaiting Admin Details";
                        return (
                          <option key={o._id} value={o._id}>
                            {formatUSD(o.amount)} - {o.method} ({label})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}

                {/* Order Summary Header */}
                <div className="p-3.5 rounded-xl bg-[#0d1624] border border-[#252f45] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#00d4a1] px-2 py-0.5 rounded bg-[#00d4a1]/15">
                      {selectedOrder.method}
                    </span>
                    <h4 className="text-white font-bold text-lg mt-1">{formatUSD(selectedOrder.amount)} USD</h4>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        selectedStep === "awaiting_user_proof"
                          ? "bg-[#00d4a1]/20 text-[#00d4a1] border border-[#00d4a1]/30 animate-pulse"
                          : selectedStep === "pending_approval"
                          ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {selectedStep === "awaiting_admin_details" && "Awaiting Details"}
                      {selectedStep === "awaiting_user_proof" && "Payment Details Ready"}
                      {selectedStep === "pending_approval" && "Proof Under Review"}
                    </span>
                  </div>
                </div>

                {/* STEP 1: Awaiting Admin Details */}
                {selectedStep === "awaiting_admin_details" && (
                  <div className="p-5 rounded-2xl bg-[#0d1624] border border-[#252f45] text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center mx-auto">
                      <Icon icon="mdi:clock-outline" width={24} />
                    </div>
                    <h4 className="text-white font-bold text-base">Awaiting Admin Response</h4>
                    <p className="text-xs text-penny-text-muted leading-relaxed max-w-xs mx-auto">
                      Your deposit request for <span className="text-white font-semibold">{formatUSD(selectedOrder.amount)}</span> via{" "}
                      <span className="text-white font-semibold">{selectedOrder.method}</span> was received.
                      <br /><br />
                      The Admin is preparing the payment details for your transaction. As soon as details are sent, you can copy them and upload your transfer proof here!
                    </p>
                  </div>
                )}

                {/* STEP 2: Awaiting User Proof (Admin has provided details!) */}
                {selectedStep === "awaiting_user_proof" && (
                  <form onSubmit={handleUploadProof} className="space-y-4">
                    {/* Admin Payment Details Box */}
                    <div className="p-4 rounded-2xl bg-[#00d4a1]/10 border border-[#00d4a1]/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-[#00d4a1] flex items-center gap-1.5 uppercase tracking-wide">
                          <Icon icon="mdi:bank-check" width={18} />
                          Admin Payment Details
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyDetails(selectedOrder.methodDetails || "")}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#00d4a1] text-[#0d1624] hover:bg-[#00b88c] transition-colors cursor-pointer"
                        >
                          <Icon icon={copied ? "mdi:check" : "mdi:content-copy"} width={14} />
                          <span>{copied ? "Copied!" : "Copy Details"}</span>
                        </button>
                      </div>

                      {/* Display Amount to Send */}
                      <div className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/10 text-xs">
                        <span className="text-penny-text-muted">Exact Amount to Send:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{formatUSD(selectedOrder.amount)}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyAmount(selectedOrder.amount)}
                            className="text-[10px] text-[#00d4a1] hover:underline"
                          >
                            {copiedAmount ? "Copied" : "Copy"}
                          </button>
                        </div>
                      </div>

                      {/* Monospace Details */}
                      <div className="bg-black/50 p-3 rounded-xl border border-white/10">
                        <p className="text-xs font-mono font-bold text-white break-all whitespace-pre-wrap select-all leading-relaxed">
                          {selectedOrder.methodDetails}
                        </p>
                      </div>

                      <p className="text-[11px] text-penny-text-muted leading-tight">
                        💡 <strong>Step 1:</strong> Send payment to the address / account above.<br />
                        💡 <strong>Step 2:</strong> Take a screenshot / save receipt and upload it below.
                      </p>
                    </div>

                    {/* Upload Proof */}
                    <div>
                      <label className="block text-xs font-semibold mb-1.5 text-penny-text-muted">
                        Upload Transfer Screenshot / Receipt <span className="text-[#F44336]">*</span>
                      </label>

                      {proofImage ? (
                        <div className="relative rounded-xl overflow-hidden border border-[#00d4a1] bg-[#0d1624] p-3 flex items-center justify-between">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <img src={proofImage} alt="Payment Proof" className="w-14 h-14 object-cover rounded-lg flex-shrink-0 border border-white/10" />
                            <div>
                              <span className="text-xs font-bold text-white block">Receipt Attached</span>
                              <span className="text-[10px] text-emerald-400">Ready to submit</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setProofImage(null)}
                            className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                            title="Remove image"
                          >
                            <Icon icon="mdi:trash-can-outline" width={18} />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-[#252f45] hover:border-[#00d4a1] bg-[#0d1624] cursor-pointer transition-all group">
                          <div className="w-10 h-10 rounded-full bg-[#00d4a1]/10 flex items-center justify-center text-[#00d4a1] mb-2 group-hover:scale-110 transition-transform">
                            <Icon icon="mdi:cloud-upload-outline" width={24} />
                          </div>
                          <span className="text-xs font-bold text-white">Click or drag receipt image here</span>
                          <span className="text-[10px] text-penny-text-muted mt-0.5">Supports PNG, JPG, JPEG, WEBP (Max 5MB)</span>
                          <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                        </label>
                      )}
                    </div>

                    {/* Optional Note */}
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-penny-text-muted">Note / Transaction ID (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. TX hash, Cash App handle, or reference #"
                        value={proofNote}
                        onChange={(e) => setProofNote(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#0d1624] border border-[#252f45] text-white focus:outline-none focus:border-[#00d4a1]"
                      />
                    </div>

                    {error && (
                      <div className="p-3 rounded-xl bg-[#F44336]/10 border border-[#F44336]/20 text-xs font-medium text-[#F44336] flex items-center gap-2">
                        <Icon icon="mdi:alert-circle-outline" width={16} className="shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl font-bold text-sm bg-white/5 border border-[#252f45] text-penny-text-muted hover:text-white transition-colors cursor-pointer"
                      >
                        Close
                      </button>
                      <button
                        type="submit"
                        disabled={submitting || !proofImage}
                        className="flex-1 py-3 rounded-xl font-bold text-sm bg-[#00d4a1] text-[#0d1624] hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                      >
                        {submitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Icon icon="mdi:check" width={18} />
                            <span>Submit Proof of Payment</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {/* STEP 3: Proof Under Review */}
                {selectedStep === "pending_approval" && (
                  <div className="p-5 rounded-2xl bg-[#0d1624] border border-[#252f45] text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-[#00d4a1]/15 text-[#00d4a1] flex items-center justify-center mx-auto">
                      <Icon icon="mdi:check-decagram-outline" width={28} />
                    </div>
                    <h4 className="text-white font-bold text-base">Proof Uploaded & Under Review</h4>
                    <p className="text-xs text-penny-text-muted leading-relaxed max-w-xs mx-auto">
                      You have submitted proof of payment for <span className="text-white font-semibold">{formatUSD(selectedOrder.amount)}</span>.
                      <br /><br />
                      The Admin is reviewing your receipt and will credit your account balance shortly!
                    </p>
                    {selectedOrder.proofPaymentDocument && (
                      <div className="pt-2">
                        <span className="text-xs font-semibold text-penny-text-muted block mb-2">Uploaded Proof Receipt:</span>
                        <img src={selectedOrder.proofPaymentDocument} alt="Uploaded Proof" className="w-44 h-28 object-cover rounded-xl mx-auto border border-[#252f45] shadow-md" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
