"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { usePortfolio, formatUSD } from "@/context/PortfolioContext";
import type { PaymentOrder } from "@/types/api";
import DepositModal from "@/components/modals/DepositModal";

function stepForOrder(order: PaymentOrder): "awaiting_admin_details" | "awaiting_user_proof" | "pending_approval" | "completed" {
  if (order.status === "completed") return "completed";
  if (order.status === "rejected") return "completed";
  if (order.proofPaymentDocument) return "pending_approval";
  if (order.methodDetails) return "awaiting_user_proof";
  return "awaiting_admin_details";
}

export default function PendingDepositBanner() {
  const { pendingOrders } = usePortfolio();
  const [depositOpen, setDepositOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>(undefined);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeDepositOrders = pendingOrders.filter(
    (o) => o.type === "deposit" && (o.status === "pending" || o.status === "awaiting_payment" || o.status === "awaiting_confirmation")
  );

  if (activeDepositOrders.length === 0) return null;

  // Find order awaiting user proof (highest priority)
  const readyOrder = activeDepositOrders.find((o) => stepForOrder(o) === "awaiting_user_proof");
  const underReviewOrder = activeDepositOrders.find((o) => stepForOrder(o) === "pending_approval");
  const awaitingAdminOrder = activeDepositOrders.find((o) => stepForOrder(o) === "awaiting_admin_details");

  const handleCopy = (e: React.MouseEvent, orderId: string, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(orderId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenModal = (orderId?: string) => {
    setSelectedOrderId(orderId);
    setDepositOpen(true);
  };

  if (readyOrder) {
    return (
      <>
        <div
          onClick={() => handleOpenModal(readyOrder._id)}
          className="w-full mb-5 rounded-2xl p-4 md:p-5 transition-all duration-200 cursor-pointer shadow-xl relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(0, 212, 161, 0.12) 0%, rgba(21, 29, 45, 0.95) 50%, rgba(13, 22, 36, 0.98) 100%)",
            border: "1px solid rgba(0, 212, 161, 0.35)",
            boxShadow: "0 10px 30px rgba(0, 212, 161, 0.08)",
          }}
        >
          {/* Subtle glow accent */}
          <div
            className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none opacity-20 blur-2xl"
            style={{ background: "#00d4a1" }}
          />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
            {/* Left Info */}
            <div className="flex items-start gap-3.5">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: "rgba(0, 212, 161, 0.2)", color: "#00d4a1" }}
              >
                <Icon icon="mdi:bank-check" width={24} />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider animate-pulse"
                    style={{ background: "rgba(0, 212, 161, 0.25)", color: "#00d4a1" }}
                  >
                    Action Required
                  </span>
                  <span className="text-xs font-semibold text-white">
                    {formatUSD(readyOrder.amount)} via {readyOrder.method}
                  </span>
                </div>
                <h4 className="text-sm md:text-base font-bold text-white">
                  Payment Details Ready — Send Funds & Upload Proof
                </h4>
                <p className="text-xs text-penny-text-muted mt-0.5 max-w-xl">
                  Admin has sent the payment details. Send your transfer and upload your receipt below to complete the deposit.
                </p>

                {/* Inline copyable details */}
                {readyOrder.methodDetails && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="mt-2.5 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold text-white bg-black/50 border-white/10"
                  >
                    <span className="text-penny-text-muted font-sans font-normal text-[11px]">Details:</span>
                    <span className="select-all text-[#00d4a1]">{readyOrder.methodDetails}</span>
                    <button
                      type="button"
                      onClick={(e) => handleCopy(e, readyOrder._id, readyOrder.methodDetails || "")}
                      className="ml-1 p-1 rounded hover:bg-white/10 text-gray-300 hover:text-white transition-colors flex items-center gap-1 text-[10px]"
                      title="Copy to clipboard"
                    >
                      <Icon icon={copiedId === readyOrder._id ? "mdi:check" : "mdi:content-copy"} width={14} />
                      <span>{copiedId === readyOrder._id ? "Copied!" : "Copy"}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Action Button */}
            <div className="flex items-center gap-3 shrink-0 self-start lg:self-center">
              <button
                type="button"
                onClick={(e) =>{
                  e.stopPropagation();
                  handleOpenModal(readyOrder._id);
                }}
                className="px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shadow-lg cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #00d4a1 0%, #00b386 100%)",
                  color: "#08101a",
                  boxShadow: "0 4px 15px rgba(0, 212, 161, 0.3)",
                }}
              >
                <Icon icon="mdi:cloud-upload-outline" width={17} />
                <span>Upload Payment Proof</span>
              </button>
            </div>
          </div>
        </div>

        {depositOpen && (
          <DepositModal
            isOpen={depositOpen}
            onClose={() => setDepositOpen(false)}
            initialOrderId={selectedOrderId}
          />
        )}
      </>
    );
  }

  if (underReviewOrder) {
    return (
      <>
        <div
          onClick={() => handleOpenModal(underReviewOrder._id)}
          className="w-full mb-5 rounded-2xl p-4 transition-all duration-200 cursor-pointer"
          style={{
            background: "rgba(21, 29, 45, 0.8)",
            border: "1px solid rgba(0, 212, 161, 0.2)",
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-[#00d4a1]/15 text-[#00d4a1]">
                <Icon icon="mdi:clock-check-outline" width={20} />
              </div>
              <div>
                <span className="text-xs font-bold text-white">
                  Deposit of {formatUSD(underReviewOrder.amount)} ({underReviewOrder.method}) — Proof Under Review
                </span>
                <p className="text-[11px] text-penny-text-muted">
                  Your payment receipt was received. Admin is verifying your payment and crediting your balance shortly.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleOpenModal(underReviewOrder._id)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white/5 hover:bg-white/10 text-white border border-[#252f45] transition-colors shrink-0"
            >
              View Status
            </button>
          </div>
        </div>

        {depositOpen && (
          <DepositModal
            isOpen={depositOpen}
            onClose={() => setDepositOpen(false)}
            initialOrderId={selectedOrderId}
          />
        )}
      </>
    );
  }

  if (awaitingAdminOrder) {
    return (
      <>
        <div
          onClick={() => handleOpenModal(awaitingAdminOrder._id)}
          className="w-full mb-5 rounded-2xl p-4 transition-all duration-200 cursor-pointer"
          style={{
            background: "rgba(21, 29, 45, 0.8)",
            border: "1px solid rgba(245, 197, 24, 0.2)",
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-amber-500/15 text-amber-400">
                <Icon icon="mdi:clock-outline" width={20} />
              </div>
              <div>
                <span className="text-xs font-bold text-white">
                  Deposit of {formatUSD(awaitingAdminOrder.amount)} ({awaitingAdminOrder.method}) — Awaiting Admin Details
                </span>
                <p className="text-[11px] text-penny-text-muted">
                  Admin will send the payment account details shortly. You will be alerted as soon as they are ready.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleOpenModal(awaitingAdminOrder._id)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white/5 hover:bg-white/10 text-white border border-[#252f45] transition-colors shrink-0"
            >
              View Order
            </button>
          </div>
        </div>

        {depositOpen && (
          <DepositModal
            isOpen={depositOpen}
            onClose={() => setDepositOpen(false)}
            initialOrderId={selectedOrderId}
          />
        )}
      </>
    );
  }

  return null;
}
