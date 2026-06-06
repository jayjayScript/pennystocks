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
  submitSellOrder: (asset: PortfolioAsset, units: number) => TradeResult;

  // Admin-facing — executes the trade
  approveOrder: (orderId: string) => TradeResult;
  rejectOrder: (orderId: string) => void;

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
  const [accountBalance, setAccountBalance] = useState(INITIAL_BALANCE);
  const [portfolio, setPortfolio]           = useState<PortfolioAsset[]>([...portfolioAssetsList]);
  const [pendingOrders, setPendingOrders]   = useState<Order[]>([]);

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
      netReceive: usdAmount, // will receive the assets worth this
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

  const submitSellOrder = (asset: PortfolioAsset, units: number): TradeResult => {
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
    };

    setPendingOrders((prev) => [order, ...prev]);
    return {
      success: true,
      message: `Sell order for ${parseFloat(units.toFixed(6))} ${asset.symbol} submitted — awaiting admin approval.`,
    };
  };

  // ── Approve Order (Admin) ─────────────────────────────────────────────────

  const approveOrder = (orderId: string): TradeResult => {
    const order = pendingOrders.find((o) => o.id === orderId);
    if (!order) return { success: false, message: "Order not found." };
    if (order.status !== "pending") return { success: false, message: "Order already processed." };

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
    setPendingOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "rejected" } : o))
    );
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
        approveOrder,
        rejectOrder,
        getHolding,
        isHolding,
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
