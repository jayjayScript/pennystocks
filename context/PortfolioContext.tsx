"use client";

import React, { createContext, useCallback, useContext, useMemo } from "react";
import { usePaymentOrders, useTransactions, useUserProfile } from "@/hooks/queries";
import { transactionsApi, paymentOrdersApi, adminApi, authApi } from "@/lib/api/backend";
import type { Transaction, PaymentOrder, PaymentMethod } from "@/types/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TradeResult {
  success: boolean;
  message: string;
}

interface PortfolioContextValue {
  accountBalance: number;
  portfolio: PortfolioAsset[]; // local holdings — populated on buy/sell
  pendingOrders: PaymentOrder[];

  // loading states
  profileLoading: boolean;
  transactionsLoading: boolean;
  ordersLoading: boolean;
  ordersError: string | null;

  // User-facing — creates a pending order, does NOT mutate portfolio/balance
  submitSellOrder: (asset: PortfolioAsset, units: number, proofImageUrl?: string) => Promise<TradeResult>;
  submitDepositOrder: (usdAmount: number, paymentMethod?: PaymentMethod | string, note?: string) => Promise<TradeResult>;
  submitDepositProof: (orderId: string, proofImageUrl: string, note?: string) => Promise<TradeResult>;
  submitWithdrawOrder: (usdAmount: number, note?: string) => Promise<TradeResult>;

  // Admin-facing — executes the trade
  adminProvideDepositDetails: (orderId: string, paymentDetails: string) => Promise<TradeResult>;
  approveOrder: (orderId: string) => Promise<TradeResult>;
  rejectOrder: (orderId: string) => Promise<TradeResult>;

  // Notifications
  notifications: AppNotification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Withdrawal password management
  withdrawalPassword: string;
  setWithdrawalPassword: (pw: string) => Promise<TradeResult>;

  getHolding: (symbol: string) => PortfolioAsset | undefined;
  isHolding: (symbol: string) => boolean;
  refetch: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatUSD(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const PortfolioContext = createContext<PortfolioContextValue | null>(null);

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useUserProfile();
  const { data: txData, isLoading: transactionsLoading, refetch: refetchTransactions } = useTransactions();
  const { data: ordersData, isLoading: ordersLoading, error: ordersQueryError, refetch: refetchOrders } = usePaymentOrders();

  const accountBalance = profile?.balance ?? 0;

  // Sync pendingOrders from backend payment orders
  const pendingOrders: PaymentOrder[] = ordersData ?? [];
  const ordersError: string | null = ordersQueryError ? (ordersQueryError as Error).message : null;

  const refetch = useCallback(() => {
    refetchProfile();
    refetchTransactions();
    refetchOrders();
  }, [refetchProfile, refetchTransactions, refetchOrders]);

  // ── Submit Sell Order ─────────────────────────────────────────────────────
  const submitSellOrder = useCallback(
    async (asset: PortfolioAsset, units: number, _proofImageUrl?: string): Promise<TradeResult> => {
      try {
        const stockPrice = parseFloat(asset.price.replace(/[$,]/g, "")) || 0;
        const amount = units * stockPrice;
        const tx = await transactionsApi.create({
          type: "sell",
          amount,
          reference: asset.symbol,
          note: `Sell ${units} ${asset.symbol}`,
        });
        void tx; // backend may return the created transaction
        return { success: true, message: `Sell order for ${units} ${asset.symbol} submitted — awaiting admin approval.` };
      } catch (err) {
        return { success: false, message: err instanceof Error ? err.message : "Failed to submit sell order." };
      }
    },
    []
  );

  // ── Submit Deposit Order ──────────────────────────────────────────────────
  const submitDepositOrder = useCallback(
    async (usdAmount: number, paymentMethod?: PaymentMethod | string, note?: string): Promise<TradeResult> => {
      try {
        await paymentOrdersApi.createDeposit({
          amount: usdAmount,
          method: (paymentMethod as PaymentMethod) || "crypto",
          suggestedMethod: paymentMethod,
        });
        refetchOrders();
        return { success: true, message: `Deposit request for $${usdAmount.toFixed(2)} submitted. Admin will provide payment details.` };
      } catch (err) {
        return { success: false, message: err instanceof Error ? err.message : "Failed to submit deposit request." };
      }
    },
    [refetchOrders]
  );

  // ── Submit Deposit Proof ─────────────────────────────────────────────────
  const submitDepositProof = useCallback(
    async (orderId: string, proofImageUrl: string, _note?: string): Promise<TradeResult> => {
      try {
        await paymentOrdersApi.submitDepositProof(orderId, proofImageUrl);
        refetchOrders();
        return { success: true, message: "Payment proof submitted. Awaiting admin approval." };
      } catch (err) {
        return { success: false, message: err instanceof Error ? err.message : "Failed to submit proof." };
      }
    },
    [refetchOrders]
  );

  // ── Submit Withdraw Order ─────────────────────────────────────────────────
  const submitWithdrawOrder = useCallback(
    async (usdAmount: number, note?: string): Promise<TradeResult> => {
      try {
        await paymentOrdersApi.createWithdraw({
          amount: usdAmount,
          method: "crypto",
          methodDetails: note || "",
        });
        refetchOrders();
        return { success: true, message: `Withdrawal of $${usdAmount.toFixed(2)} submitted — awaiting admin approval.` };
      } catch (err) {
        return { success: false, message: err instanceof Error ? err.message : "Failed to submit withdrawal." };
      }
    },
    [refetchOrders]
  );

  // ── Admin Provide Deposit Details ───────────────────────────────────────
  const adminProvideDepositDetails = useCallback(
    async (orderId: string, paymentDetails: string): Promise<TradeResult> => {
      try {
        await adminApi.updatePaymentOrder(orderId, { methodDetails: paymentDetails });
        refetchOrders();
        return { success: true, message: "Payment details sent to user." };
      } catch (err) {
        return { success: false, message: err instanceof Error ? err.message : "Failed to send details." };
      }
    },
    [refetchOrders]
  );

  // ── Approve Order (Admin) ─────────────────────────────────────────────────
  const approveOrder = useCallback(
    async (orderId: string): Promise<TradeResult> => {
      try {
        await adminApi.updatePaymentOrder(orderId, { status: "completed" });
        refetchOrders();
        refetchProfile();
        return { success: true, message: "Order approved." };
      } catch (err) {
        return { success: false, message: err instanceof Error ? err.message : "Failed to approve order." };
      }
    },
    [refetchOrders, refetchProfile]
  );

  // ── Reject Order (Admin) ─────────────────────────────────────────────────
  const rejectOrder = useCallback(
    async (orderId: string): Promise<TradeResult> => {
      try {
        await adminApi.updatePaymentOrder(orderId, { status: "rejected" });
        refetchOrders();
        return { success: true, message: "Order rejected." };
      } catch (err) {
        return { success: false, message: err instanceof Error ? err.message : "Failed to reject order." };
      }
    },
    [refetchOrders]
  );

  // ── Notifications (Synced with backend orders + persistent read state) ──
  const [readNotifIds, setReadNotifIds] = React.useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("penny_read_notifications");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [localNotifications, setLocalNotifications] = React.useState<AppNotification[]>([]);

  // Automatically generate real notifications from backend payment orders
  const notifications = useMemo<AppNotification[]>(() => {
    const derived: AppNotification[] = [];
    const ACTIVE_STATUSES = ["pending", "awaiting_payment", "awaiting_confirmation"];

    for (const order of pendingOrders) {
      if (order.type === "deposit") {
        // Admin has sent payment details — user must copy & upload proof
        if (
          (order.methodDetails || order.isMethodIncluded) &&
          !order.proofPaymentDocument &&
          ACTIVE_STATUSES.includes(order.status)
        ) {
          const id = `order-details-${order._id}`;
          derived.push({
            id,
            type: "deposit_details",
            title: `💳 Payment Details Ready — ${formatUSD(order.amount)} via ${order.method}`,
            message: `Admin has sent the payment details for your deposit. Tap here to view the account info, copy it, and upload your transfer receipt.`,
            icon: "mdi:bank-transfer-in",
            read: readNotifIds.includes(id),
            createdAt: order.updatedAt || order.createdAt,
            orderId: order._id,
            adminPaymentDetails: order.methodDetails,
          });
        // User uploaded proof — awaiting admin approval
        } else if (
          order.proofPaymentDocument &&
          ACTIVE_STATUSES.includes(order.status)
        ) {
          const id = `order-proof-${order._id}`;
          derived.push({
            id,
            type: "info",
            title: `Proof Submitted — ${formatUSD(order.amount)} deposit under review`,
            message: `Your payment receipt was received by the admin. Your balance will be updated once the transfer is confirmed.`,
            icon: "mdi:clock-check-outline",
            read: readNotifIds.includes(id),
            createdAt: order.updatedAt || order.createdAt,
            orderId: order._id,
          });
        // Fresh request — pending admin response
        } else if (
          !order.methodDetails &&
          !order.proofPaymentDocument &&
          order.status === "pending"
        ) {
          const id = `order-pending-${order._id}`;
          derived.push({
            id,
            type: "info",
            title: `⏳ Deposit Request Received — ${formatUSD(order.amount)}`,
            message: `Your ${order.method} deposit request has been sent to admin. You'll be notified here once payment details are ready.`,
            icon: "mdi:clock-outline",
            read: readNotifIds.includes(id),
            createdAt: order.createdAt,
            orderId: order._id,
          });
        // Deposit approved
        } else if (order.status === "completed") {
          const id = `order-completed-${order._id}`;
          derived.push({
            id,
            type: "success",
            title: `✅ Deposit Approved — ${formatUSD(order.amount)} added to balance`,
            message: `Your deposit of ${formatUSD(order.amount)} via ${order.method} was verified and credited to your account.`,
            icon: "mdi:check-circle",
            read: readNotifIds.includes(id),
            createdAt: order.updatedAt || order.createdAt,
            orderId: order._id,
          });
        // Deposit rejected
        } else if (order.status === "rejected") {
          const id = `order-rejected-${order._id}`;
          derived.push({
            id,
            type: "error",
            title: `❌ Deposit Rejected — ${formatUSD(order.amount)}`,
            message: `Your deposit request for ${formatUSD(order.amount)} via ${order.method} was rejected by admin. Please contact support if you believe this is an error.`,
            icon: "mdi:close-circle",
            read: readNotifIds.includes(id),
            createdAt: order.updatedAt || order.createdAt,
            orderId: order._id,
          });
        }
      } else if (order.type === "withdraw") {
        // Withdrawal submitted, awaiting admin
        if (order.status === "pending" || order.status === "awaiting_payment" || order.status === "awaiting_confirmation") {
          const id = `withdraw-pending-${order._id}`;
          derived.push({
            id,
            type: "info",
            title: `⏳ Withdrawal Submitted — ${formatUSD(order.amount)}`,
            message: `Your withdrawal of ${formatUSD(order.amount)} via ${order.method} is being processed by admin.`,
            icon: "mdi:bank-transfer-out",
            read: readNotifIds.includes(id),
            createdAt: order.createdAt,
            orderId: order._id,
          });
        } else if (order.status === "completed") {
          const id = `withdraw-completed-${order._id}`;
          derived.push({
            id,
            type: "success",
            title: `✅ Withdrawal Sent — ${formatUSD(order.amount)}`,
            message: `Your withdrawal of ${formatUSD(order.amount)} via ${order.method} has been processed and sent to your wallet.`,
            icon: "mdi:check-circle",
            read: readNotifIds.includes(id),
            createdAt: order.updatedAt || order.createdAt,
            orderId: order._id,
          });
        } else if (order.status === "rejected") {
          const id = `withdraw-rejected-${order._id}`;
          derived.push({
            id,
            type: "error",
            title: `❌ Withdrawal Rejected — ${formatUSD(order.amount)}`,
            message: `Your withdrawal of ${formatUSD(order.amount)} via ${order.method} was rejected. Please contact support.`,
            icon: "mdi:close-circle",
            read: readNotifIds.includes(id),
            createdAt: order.updatedAt || order.createdAt,
            orderId: order._id,
          });
        }
      }
    }


    const all = [...derived, ...localNotifications];
    return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [pendingOrders, readNotifIds, localNotifications]);

  const markNotificationRead = (id: string) => {
    setReadNotifIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try { localStorage.setItem("penny_read_notifications", JSON.stringify(next)); } catch {}
      return next;
    });
    setLocalNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    const allIds = notifications.map((n) => n.id);
    setReadNotifIds(allIds);
    try { localStorage.setItem("penny_read_notifications", JSON.stringify(allIds)); } catch {}
    setLocalNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // ── Withdrawal password (persisted to backend via authApi.updateProfile) ──
  const [withdrawalPassword, _setWithdrawalPasswordLocal] = React.useState<string>("");

  const setWithdrawalPassword = useCallback(async (pw: string): Promise<TradeResult> => {
    _setWithdrawalPasswordLocal(pw);
    try {
      await authApi.updateProfile({ walletPassword: pw });
      return { success: true, message: "Withdrawal password set." };
    } catch (err) {
      return { success: false, message: err instanceof Error ? err.message : "Failed to save password." };
    }
  }, []);

  // ── Portfolio helpers (local — no holdings endpoint) ─────────────────────
  // Keep a local portfolio array that components can use directly.
  // It is updated by the user flow (buy/sell modals push to it).
  const [portfolio, setPortfolio] = React.useState<PortfolioAsset[]>([]);

  const getHolding  = useCallback((symbol: string) => portfolio.find((a) => a.symbol === symbol), [portfolio]);
  const isHolding   = useCallback((symbol: string) => portfolio.some((a) => a.symbol === symbol), [portfolio]);

  const value: PortfolioContextValue = {
    accountBalance,
    portfolio,
    pendingOrders,
    profileLoading,
    transactionsLoading,
    ordersLoading,
    ordersError,
    submitSellOrder,
    submitDepositOrder,
    submitDepositProof,
    submitWithdrawOrder,
    adminProvideDepositDetails,
    approveOrder,
    rejectOrder,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    withdrawalPassword,
    setWithdrawalPassword,
    getHolding,
    isHolding,
    refetch,
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error("usePortfolio must be used within PortfolioProvider");
  return ctx;
}
