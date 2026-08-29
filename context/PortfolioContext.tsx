"use client";

import React, { createContext, useContext, useState } from "react";
import { portfolioAssetsList } from "@/constants/data";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TradeResult {
  success: boolean;
  message: string;
  soldAll?: boolean;
}

interface PortfolioContextValue {
  accountBalance: number;
  portfolio: PortfolioAsset[];
  pendingOrders: Order[];

  // User-facing — creates a pending order, does NOT mutate portfolio/balance
  submitBuyOrder: (stock: Stock, usdAmount: number) => TradeResult;
  submitSellOrder: (asset: PortfolioAsset, units: number, proofImageUrl?: string) => TradeResult;
  submitDepositOrder: (usdAmount: number, paymentMethod?: string, note?: string) => TradeResult;
  submitDepositProof: (orderId: string, proofImageUrl: string, note?: string) => TradeResult;
  submitWithdrawOrder: (usdAmount: number, note?: string) => TradeResult;

  // Admin-facing — executes the trade
  adminProvideDepositDetails: (orderId: string, paymentDetails: string) => TradeResult;
  approveOrder: (orderId: string) => TradeResult;
  rejectOrder: (orderId: string) => void;

  // Notifications
  notifications: AppNotification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Withdrawal password management
  withdrawalPassword: string;
  setWithdrawalPassword: (pw: string) => void;

  getHolding: (symbol: string) => PortfolioAsset | undefined;
  isHolding: (symbol: string) => boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const FEE_RATE = 0.001;
const INITIAL_BALANCE = 200_000;

function parsePrice(price: string): number {
  return parseFloat(price.replace(/[$,]/g, "")) || 0;
}

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
  const [accountBalance, setAccountBalance] = useState(INITIAL_BALANCE - 500.50); // deducted for dummy PYPL buy order
  const [portfolio, setPortfolio]           = useState<PortfolioAsset[]>([...portfolioAssetsList]);
  const [notifications, setNotifications]   = useState<AppNotification[]>([]);

  const addNotification = (n: Omit<AppNotification, "id" | "createdAt" | "read">) => {
    setNotifications((prev) => [{
      ...n,
      id: generateId(),
      read: false,
      createdAt: new Date().toISOString(),
    }, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };
  // ── Dummy pending order — pre-seeded so admin orders queue is visible on first load ──
  const [pendingOrders, setPendingOrders]   = useState<Order[]>([
    {
      id:           "dummy-deposit-001",
      type:         "deposit",
      symbol:       "USD",
      name:         "Deposit (Crypto (BTC / USDT))",
      stockPrice:   1,
      units:        250.00,
      usdAmount:    250.00,
      fee:          0,
      totalCost:    250.00,
      netReceive:   250.00,
      status:       "pending",
      depositStep:  "awaiting_admin_details",
      paymentMethod: "Crypto (BTC / USDT)",
      createdAt:    "2026-07-17T18:00:00.000Z",
      note:         "Prefer TRC-20 USDT",
    },
    {
      id:         "dummy-order-001",
      type:       "buy",
      symbol:     "PYPL",
      name:       "PayPal Holdings Inc.",
      icon:       "logos:paypal",
      bgColor:    "rgba(0, 112, 186, 0.1)",
      stockPrice: 62.35,
      units:      8.02726700,
      usdAmount:  500.00,
      fee:        0.50,
      totalCost:  500.50,
      netReceive: 500.00,
      status:     "pending",
      createdAt:  "2026-07-17T17:30:00.000Z",
      note:       "Dummy seed order — for backend integration reference",
    },
  ]);
  const [withdrawalPassword, setWithdrawalPassword] = useState<string>('');

  // ── Submit Buy Order ──────────────────────────────────────────────────────

  const submitBuyOrder = (stock: Stock, usdAmount: number): TradeResult => {
    const stockPrice = parsePrice(stock.price);
    if (stockPrice === 0) return { success: false, message: "Invalid stock price." };
    if (usdAmount <= 0)   return { success: false, message: "Enter a valid amount." };

    const units      = usdAmount / stockPrice;
    const fee        = usdAmount * FEE_RATE;
    const totalCost  = usdAmount + fee;

    const order: Order = {
      id:         generateId(),
      type:       "buy",
      symbol:     stock.symbol,
      name:       stock.name,
      icon:       stock.icon,
      bgColor:    stock.bgColor,
      stockPrice,
      units,
      usdAmount,
      fee,
      totalCost,
      netReceive: usdAmount,
      status:     "pending",
      createdAt:  new Date().toISOString(),
    };

    setPendingOrders((prev) => [order, ...prev]);
    return {
      success: true,
      message: `Buy order for ${parseFloat(units.toFixed(6))} ${stock.symbol} submitted — awaiting admin approval.`,
    };
  };

  // ── Submit Sell Order ─────────────────────────────────────────────────────

  const submitSellOrder = (asset: PortfolioAsset, units: number, proofImageUrl?: string): TradeResult => {
    const ownedUnits = parseFloat(asset.amount);
    if (units <= 0)                   return { success: false, message: "Enter a valid amount." };
    if (units > ownedUnits + 0.000001) return { success: false, message: "You don't own that many units." };

    const stockPrice  = parsePrice(asset.price);
    const grossValue  = units * stockPrice;
    const fee         = grossValue * FEE_RATE;
    const netReceive  = grossValue - fee;

    const order: Order = {
      id:         generateId(),
      type:       "sell",
      symbol:     asset.symbol,
      name:       asset.name,
      icon:       asset.icon,
      bgColor:    asset.bgColor,
      stockPrice,
      units,
      usdAmount:  grossValue,
      fee,
      totalCost:  grossValue,
      netReceive,
      status:     "pending",
      createdAt:  new Date().toISOString(),
      proofImageUrl,
    };

    setPendingOrders((prev) => [order, ...prev]);
    return {
      success: true,
      message: `Sell order for ${parseFloat(units.toFixed(6))} ${asset.symbol} submitted — awaiting admin approval.`,
    };
  };

  // ── Submit Deposit Order ──────────────────────────────────────────────────

  const submitDepositOrder = (
    usdAmount: number,
    paymentMethod?: string,
    note?: string
  ): TradeResult => {
    if (usdAmount < 0.01) return { success: false, message: "Minimum deposit amount is $0.01." };
    if (usdAmount <= 0) return { success: false, message: "Enter a valid deposit amount." };
    const order: Order = {
      id:            generateId(),
      type:          "deposit",
      symbol:        "USD",
      name:          paymentMethod ? `Deposit (${paymentMethod})` : "Deposit",
      stockPrice:    1,
      units:         usdAmount,
      usdAmount,
      fee:           0,
      totalCost:     usdAmount,
      netReceive:    usdAmount,
      status:        "pending",
      depositStep:   "awaiting_admin_details",
      createdAt:     new Date().toISOString(),
      paymentMethod: paymentMethod || "Crypto",
      note,
    };
    setPendingOrders((prev) => [order, ...prev]);
    return { success: true, message: `Deposit request for $${usdAmount.toFixed(2)} via ${paymentMethod || "deposit"} submitted. Admin will provide payment details.` };
  };

  // ── Admin Provide Deposit Details ───────────────────────────────────────

  const adminProvideDepositDetails = (orderId: string, paymentDetails: string): TradeResult => {
    const order = pendingOrders.find((o) => o.id === orderId);
    if (!order) return { success: false, message: "Order not found." };
    setPendingOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              adminPaymentDetails: paymentDetails,
              ...(o.type === "deposit" ? { depositStep: "awaiting_user_proof" } : {}),
            }
          : o
      )
    );
    addNotification({
      type: "deposit_details",
      title: order.type === "buy" ? `Payment Details for ${order.symbol}` : "Payment Details Ready",
      message:
        order.type === "buy"
          ? `Admin has sent payment details for your ${order.symbol} buy order ($${order.totalCost.toFixed(2)}): ${paymentDetails}`
          : `Admin has sent the ${order.paymentMethod || "payment"} account details for your $${order.usdAmount.toFixed(2)} deposit. Tap to view & complete payment.`,
      icon: "mdi:bank-check",
      orderId,
      adminPaymentDetails: paymentDetails,
    });
    return { success: true, message: "Payment details sent to user." };
  };

  // ── User Submit Deposit Proof ─────────────────────────────────────────────

  const submitDepositProof = (orderId: string, proofImageUrl: string, note?: string): TradeResult => {
    const order = pendingOrders.find((o) => o.id === orderId);
    if (!order) return { success: false, message: "Order not found." };
    setPendingOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              proofImageUrl,
              note: note || o.note,
              depositStep: "pending_approval",
            }
          : o
      )
    );
    return { success: true, message: "Payment proof submitted. Awaiting admin approval." };
  };

  // ── Submit Withdraw Order ─────────────────────────────────────────────────

  const submitWithdrawOrder = (usdAmount: number, note?: string): TradeResult => {
    if (usdAmount <= 0)              return { success: false, message: "Enter a valid withdrawal amount." };
    if (usdAmount > accountBalance)  return { success: false, message: "Insufficient balance." };
    const order: Order = {
      id:         generateId(),
      type:       "withdraw",
      symbol:     "USD",
      name:       "Withdrawal",
      stockPrice: 1,
      units:      usdAmount,
      usdAmount,
      fee:        0,
      totalCost:  usdAmount,
      netReceive: usdAmount,
      status:     "pending",
      createdAt:  new Date().toISOString(),
      note,
    };
    setPendingOrders((prev) => [order, ...prev]);
    return { success: true, message: `Withdrawal of $${usdAmount.toFixed(2)} submitted — awaiting admin approval.` };
  };

  // ── Approve Order (Admin) ─────────────────────────────────────────────────

  const approveOrder = (orderId: string): TradeResult => {
    const order = pendingOrders.find((o) => o.id === orderId);
    if (!order) return { success: false, message: "Order not found." };
    if (order.status !== "pending") return { success: false, message: "Order already processed." };

    if (order.type === "deposit") {
      setAccountBalance((prev) => parseFloat((prev + order.usdAmount).toFixed(2)));
      setPendingOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "approved", depositStep: "completed" } : o))
      );
      addNotification({
        type: "success",
        title: "Deposit Approved!",
        message: `Your deposit of $${order.usdAmount.toFixed(2)} via ${order.paymentMethod || "deposit"} has been verified and credited to your account.`,
        icon: "mdi:check-circle",
        orderId,
      });
      return { success: true, message: "Deposit approved and credited." };
    }

    if (order.type === "withdraw") {
      if (order.usdAmount > accountBalance) {
        return { success: false, message: "User has insufficient balance." };
      }
      setAccountBalance((prev) => parseFloat((prev - order.usdAmount).toFixed(2)));
      setPendingOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "approved" } : o))
      );
      return { success: true, message: "Withdrawal approved and processed." };
    }

    if (order.type === "buy") {
      // Validate balance at time of approval
      if (order.totalCost > accountBalance) {
        return { success: false, message: "User has insufficient balance." };
      }
      setAccountBalance((prev) => parseFloat((prev - order.totalCost).toFixed(2)));
      setPortfolio((prev) => {
        const existing = prev.find((a) => a.symbol === order.symbol);
        if (existing) {
          return prev.map((a) => {
            if (a.symbol !== order.symbol) return a;
            const newAmount = parseFloat(a.amount) + order.units;
            const newValue  = newAmount * order.stockPrice;
            return { ...a, amount: parseFloat(newAmount.toFixed(8)).toString(), value: formatUSD(newValue) };
          });
        }
        return [...prev, {
          symbol:      order.symbol,
          name:        order.name,
          icon:        order.icon,
          bgColor:     order.bgColor,
          price:       formatUSD(order.stockPrice),
          change:      "0",
          pct:         "+0.00%",
          up:          true,
          amount:      parseFloat(order.units.toFixed(8)).toString(),
          value:       formatUSD(order.usdAmount),
          description: "",
        } as PortfolioAsset];
      });
    }

    if (order.type === "sell") {
      const holding = portfolio.find((a) => a.symbol === order.symbol);
      if (!holding) return { success: false, message: "User no longer holds this asset." };

      const ownedUnits = parseFloat(holding.amount);
      if (order.units > ownedUnits + 0.000001) {
        return { success: false, message: "User has insufficient units to sell." };
      }

      setAccountBalance((prev) => parseFloat((prev + order.netReceive).toFixed(2)));
      const soldAll = order.units >= ownedUnits - 0.000001;
      setPortfolio((prev) => {
        if (soldAll) return prev.filter((a) => a.symbol !== order.symbol);
        return prev.map((a) => {
          if (a.symbol !== order.symbol) return a;
          const newAmount = ownedUnits - order.units;
          const newValue  = newAmount * order.stockPrice;
          return { ...a, amount: parseFloat(newAmount.toFixed(8)).toString(), value: formatUSD(newValue) };
        });
      });
    }

    setPendingOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "approved" } : o))
    );

    return { success: true, message: "Order approved and executed." };
  };

  // ── Reject Order (Admin) ──────────────────────────────────────────────────

  const rejectOrder = (orderId: string): void => {
    const order = pendingOrders.find((o) => o.id === orderId);
    setPendingOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "rejected", depositStep: "rejected" } : o))
    );
    if (order) {
      addNotification({
        type: "error",
        title: "Order Rejected",
        message: order.type === "deposit"
          ? `Your deposit request of $${order.usdAmount.toFixed(2)} via ${order.paymentMethod || "deposit"} has been rejected. Please contact support for assistance.`
          : `Your ${order.type} order for ${order.symbol} has been rejected.`,
        icon: "mdi:close-circle",
        orderId,
      });
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────

  const getHolding  = (symbol: string) => portfolio.find((a) => a.symbol === symbol);
  const isHolding   = (symbol: string) => portfolio.some((a) => a.symbol === symbol);

  return (
    <PortfolioContext.Provider
      value={{
        accountBalance,
        portfolio,
        pendingOrders,
        submitBuyOrder,
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
        getHolding,
        isHolding,
        withdrawalPassword,
        setWithdrawalPassword,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error("usePortfolio must be used within PortfolioProvider");
  return ctx;
}
