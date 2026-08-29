"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { usePortfolio } from "@/context/PortfolioContext";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PaymentSystem {
  id: string;
  name: string;
  icon: string;
  description: string;
}

const PAYMENT_METHODS: PaymentSystem[] = [
  {
    id: "crypto",
    name: "Crypto (BTC / USDT)",
    icon: "cryptocurrency:usdt",
    description: "Deposit using USDT or Bitcoin",
  },
  {
    id: "cashapp",
    name: "Cash App",
    icon: "simple-icons:cashapp",
    description: "Instant transfer via Cash App",
  },
  {
    id: "paypal",
    name: "PayPal",
    icon: "logos:paypal",
    description: "Send funds via PayPal",
  },
  {
    id: "venmo",
    name: "Venmo",
    icon: "simple-icons:venmo",
    description: "Quick transfer using Venmo",
  },
  {
    id: "zelle",
    name: "Zelle",
    icon: "simple-icons:zelle",
    description: "Direct transfer with Zelle",
  },
  {
    id: "wire",
    name: "Wire Transfer",
    icon: "mdi:bank-transfer",
    description: "Domestic & international wire transfer",
  },
  {
    id: "bank",
    name: "Bank Transfer",
    icon: "mdi:bank",
    description: "Direct local bank deposit",
  },
];

export default function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const { pendingOrders, submitDepositOrder, submitDepositProof } = usePortfolio();

  // Active deposit orders
  const activeDepositOrders = pendingOrders.filter(
    (o) => o.type === "deposit" && o.status === "pending"
  );

  const [activeTab, setActiveTab] = useState<"new" | "active">("new");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // New Deposit Form State
  const [amount, setAmount] = useState("");
  const [selectedMethodId, setSelectedMethodId] = useState("crypto");
  const [newNote, setNewNote] = useState("");

  // Proof Submission State
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [proofNote, setProofNote] = useState("");

  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<"idle" | "request_submitted" | "proof_submitted">("idle");

  const currentMethod = PAYMENT_METHODS.find((m) => m.id === selectedMethodId) || PAYMENT_METHODS[0];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      if (activeDepositOrders.length > 0) {
        setActiveTab("active");
        const readyForProof = activeDepositOrders.find((o) => o.depositStep === "awaiting_user_proof");
        if (readyForProof) {
          setSelectedOrderId(readyForProof.id);
        } else {
          setSelectedOrderId(activeDepositOrders[0].id);
        }
      } else {
        setActiveTab("new");
      }
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, pendingOrders.length]);

  const selectedOrder = activeDepositOrders.find((o) => o.id === selectedOrderId) || activeDepositOrders[0];

  const handleCopyDetails = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

    try {
      await submitDepositOrder(parsedAmount, currentMethod.name, newNote);
      setStatus("request_submitted");
      setError("");
    } catch (err) {
      setError("Failed to submit deposit request. Please try again.");
    }
  };

  const handleUploadProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    if (!proofImage) {
      setError("Please upload your payment screenshot or proof receipt.");
      return;
    }

    try {
      await submitDepositProof(selectedOrder.id, proofImage, proofNote);
      setStatus("proof_submitted");
      setError("");
    } catch (err) {
      setError("Failed to submit proof. Please try again.");
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
        style={{
          background: "linear-gradient(160deg, #141e30 0%, #0d1624 100%)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1d2639] mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#00d4a1]/15 text-[#00d4a1]">
              <Icon icon="mdi:arrow-down" width={22} />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">Deposit Funds</h2>
              <p className="text-xs text-penny-text-muted mt-0.5">Request deposit & upload payment proof</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 text-penny-text-muted hover:text-white transition-colors"
          >
            <Icon icon="mdi:close" width={18} />
          </button>
        </div>

        {/* Status Confirmation Screens */}
        {status === "request_submitted" && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#00d4a1]/15 flex items-center justify-center mb-4">
              <Icon icon="mdi:clock-fast" width={32} className="text-[#00d4a1]" />
            </div>
            <h3 className="text-white font-bold text-lg mb-1">Deposit Request Sent!</h3>
            <p className="text-sm text-penny-text-muted max-w-sm leading-normal mb-6">
              Your request to deposit <span className="text-white font-bold">${parseFloat(amount).toFixed(2)}</span> via{" "}
              <span className="text-[#00d4a1] font-bold">{currentMethod.name}</span> has been sent to Admin.
              <br /><br />
              The Admin will send you the account/payment details shortly. You can check back here anytime to view details & submit proof!
            </p>
            <button
              onClick={() => {
                setStatus("idle");
                setActiveTab("active");
              }}
              className="px-8 py-3 rounded-xl font-bold text-sm bg-[#00d4a1] text-[#0d1624] hover:opacity-90 transition-all"
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
              className="px-8 py-3 rounded-xl font-bold text-sm bg-[#00d4a1] text-[#0d1624] hover:opacity-90 transition-all"
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
                  + New Deposit Request
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

            {/* TAB 1: NEW DEPOSIT REQUEST */}
            {activeTab === "new" && (
              <form onSubmit={handleCreateRequest} className="space-y-4 text-left">
                {/* Amount */}
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

                {/* Payment System Selector */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-penny-text-muted">Select Payment System</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto pr-1">
                    {PAYMENT_METHODS.map((method) => {
                      const isSelected = method.id === selectedMethodId;
                      return (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => {
                            setSelectedMethodId(method.id);
                            setError("");
                          }}
                          className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
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

                {/* Reference Note */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-penny-text-muted">Note for Admin (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Prefer TRC-20 for crypto, or Cash App tag"
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
                    className="flex-1 py-3 rounded-xl font-bold text-sm bg-white/5 border border-[#252f45] text-penny-text-muted hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl font-bold text-sm bg-[#00d4a1] text-[#0d1624] hover:opacity-90 active:scale-95 transition-all"
                  >
                    Send Request to Admin
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: ACTIVE DEPOSIT REQUESTS & PROOF UPLOAD */}
            {activeTab === "active" && selectedOrder && (
              <div className="space-y-4 text-left">
                {/* Active Order Selector Dropdown if multiple */}
                {activeDepositOrders.length > 1 && (
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-penny-text-muted">Select Deposit Order</label>
                    <select
                      value={selectedOrder.id}
                      onChange={(e) => setSelectedOrderId(e.target.value)}
                      className="w-full p-2.5 rounded-xl text-xs font-bold bg-[#0d1624] border border-[#252f45] text-white focus:outline-none focus:border-[#00d4a1]"
                    >
                      {activeDepositOrders.map((o) => (
                        <option key={o.id} value={o.id}>
                          ${o.usdAmount.toFixed(2)} - {o.paymentMethod || "Deposit"} (
                          {o.depositStep === "awaiting_admin_details" ? "Step 1: Awaiting Admin Response" : "Step 2: Payment Details Ready"})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Request Overview Header */}
                <div className="p-3.5 rounded-xl bg-[#0d1624] border border-[#252f45] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#00d4a1] px-2 py-0.5 rounded bg-[#00d4a1]/15">
                      {selectedOrder.paymentMethod || "Deposit"}
                    </span>
                    <h4 className="text-white font-bold text-lg mt-1">${selectedOrder.usdAmount.toFixed(2)} USD</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-semibold text-amber-400 px-2 py-1 rounded bg-amber-500/15">
                      {selectedOrder.depositStep === "awaiting_admin_details" && "Awaiting Admin Response"}
                      {selectedOrder.depositStep === "awaiting_user_proof" && "Ready for Payment"}
                      {selectedOrder.depositStep === "pending_approval" && "Proof Under Review"}
                    </span>
                  </div>
                </div>

                {/* STEP 1: AWAITING ADMIN DETAILS */}
                {selectedOrder.depositStep === "awaiting_admin_details" && (
                  <div className="p-5 rounded-xl bg-[#0d1624] border border-[#252f45] text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center mx-auto">
                      <Icon icon="mdi:clock-outline" width={24} />
                    </div>
                    <h4 className="text-white font-bold text-base">Awaiting Admin Response</h4>
                    <p className="text-xs text-penny-text-muted leading-relaxed max-w-xs mx-auto">
                      Your deposit request for <span className="text-white font-semibold">${selectedOrder.usdAmount.toFixed(2)}</span> via{" "}
                      <span className="text-white font-semibold">{selectedOrder.paymentMethod}</span> was received.
                      <br /><br />
                      The Admin is preparing the payment details for your transaction. Please check back shortly!
                    </p>
                  </div>
                )}

                {/* STEP 2: ADMIN HAS PROVIDED PAYMENT DETAILS -> USER PAYS & UPLOADS PROOF */}
                {selectedOrder.depositStep === "awaiting_user_proof" && (
                  <form onSubmit={handleUploadProof} className="space-y-4">
                    {/* Admin Payment Details Box */}
                    <div className="p-3.5 rounded-xl bg-[#00d4a1]/10 border border-[#00d4a1]/30">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-[#00d4a1] flex items-center gap-1">
                          <Icon icon="mdi:bank-check" width={16} />
                          Admin Payment Details:
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyDetails(selectedOrder.adminPaymentDetails || "")}
                          className="flex items-center gap-1 text-[11px] font-bold text-[#00d4a1] hover:underline"
                        >
                          <Icon icon={copied ? "mdi:check" : "mdi:content-copy"} width={14} />
                          {copied ? "Copied!" : "Copy"}
                        </button>
                      </div>
                      <p className="text-xs font-mono font-bold text-white break-all bg-black/40 p-2.5 rounded-lg border border-white/10 select-all">
                        {selectedOrder.adminPaymentDetails}
                      </p>
                      <p className="text-[11px] text-penny-text-muted mt-2 leading-tight">
                        👉 Send exact amount (<strong className="text-white">${selectedOrder.usdAmount.toFixed(2)}</strong>) to the account details above, then upload your proof screenshot below.
                      </p>
                    </div>

                    {/* Proof Upload */}
                    <div>
                      <label className="block text-xs font-semibold mb-1.5 text-penny-text-muted">
                        Upload Proof of Payment <span className="text-[#F44336]">*</span>
                      </label>

                      {proofImage ? (
                        <div className="relative rounded-xl overflow-hidden border border-[#00d4a1] bg-[#0d1624] p-2 flex items-center justify-between">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <img src={proofImage} alt="Payment Proof" className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />
                            <span className="text-xs font-medium text-white truncate">Receipt uploaded</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setProofImage(null)}
                            className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                          >
                            <Icon icon="mdi:trash-can-outline" width={16} />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-[#252f45] hover:border-[#00d4a1]/50 bg-[#0d1624] cursor-pointer transition-colors group">
                          <Icon icon="mdi:cloud-upload-outline" width={28} className="text-penny-text-muted group-hover:text-[#00d4a1] transition-colors mb-1" />
                          <span className="text-xs font-semibold text-white">Click to upload transfer screenshot</span>
                          <span className="text-[10px] text-penny-text-muted">PNG, JPG or WEBP (Max 5MB)</span>
                          <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                        </label>
                      )}
                    </div>

                    {/* Transaction Reference */}
                    <div>
                      <label className="block text-xs font-semibold mb-1.5 text-penny-text-muted">Transaction ID / Reference (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. TxID or Bank Reference #"
                        value={proofNote}
                        onChange={(e) => setProofNote(e.target.value)}
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
                        className="flex-1 py-3 rounded-xl font-bold text-sm bg-white/5 border border-[#252f45] text-penny-text-muted hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-3 rounded-xl font-bold text-sm bg-[#00d4a1] text-[#0d1624] hover:opacity-90 active:scale-95 transition-all"
                      >
                        Submit Proof of Payment
                      </button>
                    </div>
                  </form>
                )}

                {/* STEP 3: PROOF SUBMITTED, PENDING FINAL APPROVAL */}
                {selectedOrder.depositStep === "pending_approval" && (
                  <div className="p-5 rounded-xl bg-[#0d1624] border border-[#252f45] text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-[#00d4a1]/15 text-[#00d4a1] flex items-center justify-center mx-auto">
                      <Icon icon="mdi:check-decagram-outline" width={26} />
                    </div>
                    <h4 className="text-white font-bold text-base">Proof Uploaded & Under Review</h4>
                    <p className="text-xs text-penny-text-muted leading-relaxed max-w-xs mx-auto">
                      You have submitted proof of payment for <span className="text-white font-semibold">${selectedOrder.usdAmount.toFixed(2)}</span>.
                      <br /><br />
                      The Admin is reviewing your receipt and will credit your account balance shortly!
                    </p>
                    {selectedOrder.proofImageUrl && (
                      <div className="pt-2">
                        <span className="text-xs font-semibold text-penny-text-muted block mb-2">Uploaded Proof:</span>
                        <img src={selectedOrder.proofImageUrl} alt="Uploaded Proof" className="w-32 h-20 object-cover rounded-lg mx-auto border border-[#252f45]" />
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