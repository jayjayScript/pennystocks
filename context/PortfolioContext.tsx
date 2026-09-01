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
  const { data: ordersData, isLoading: ordersLoading, refetch: refetchOrders } = usePaymentOrders();

  const accountBalance = profile?.balance ?? 0;

  // Sync pendingOrders from backend payment orders
  const pendingOrders: PaymentOrder[] = ordersData ?? [];

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

  // ── Notifications (local) ────────────────────────────────────────────────
  const [notifications, setNotifications] = React.useState<AppNotification[]>([]);

  const addNotification = React.useCallback((n: Omit<AppNotification, "id" | "createdAt" | "read">) => {
    setNotifications((prev) => [{
      ...n,
      id: generateId(),
      read: false,
      createdAt: new Date().toISOString(),
    }, ...prev]);
  }, []);

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
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
