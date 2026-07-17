"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { copyTradeSetups } from "@/constants/data";
import { sampleLastTrades } from "@/constants/data";

interface CopyTradingContextValue {
  copyWalletBalance: number;
  activeCopyTrades: ActiveCopyTrade[];
  availableSetups: CopyTradeSetup[];
  buyCopyTrade: (setupId: string) => CopyTradeResult;
  stopCopyTrade: (activeTradeId: string) => CopyTradeResult;
  pauseCopyTrade: (activeTradeId: string) => void;
  resumeCopyTrade: (activeTradeId: string) => void;
  simulateNewTrade: (activeTradeId: string) => void;
  getActiveTradeBySetupId: (setupId: string) => ActiveCopyTrade | undefined;
  formatUSD: (n: number) => string;
  // Add any additional methods you need
}

// Create context
const CopyTradingContext = createContext<CopyTradingContextValue | null>(null);

export function CopyTradingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize state from constants
  const [copyWalletBalance, setCopyWalletBalance] = useState(10_000); // Initial balance
  const [activeCopyTrades, setActiveCopyTrades] = useState<ActiveCopyTrade[]>([]);
  const [availableSetups, setAvailableSetups] = useState<CopyTradeSetup[]>(() => copyTradeSetups);

  // Helper function to format USD
  const formatUSD = (n: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  };

  // Buy a copy trade
  const buyCopyTrade = useCallback((setupId: string): CopyTradeResult => {
    const setup = availableSetups.find((s) => s.id === setupId);
    if (!setup) return { success: false, message: "Trading setup not found." };

    if (activeCopyTrades.some((t) => t.setup.id === setupId)) {
      return { success: false, message: "You already have this trade copied." };
    }

    if (copyWalletBalance < setup.price) {
      return {
        success: false,
        message: `Insufficient balance. Need ${formatUSD(setup.price)} but have ${formatUSD(copyWalletBalance)}.`,
      };
    }

    // Deduct price from copy wallet
    setCopyWalletBalance((prev) => parseFloat((prev - setup.price).toFixed(2)));

    // Create active copy trade with initial last 10 trades
    const newActiveTrade: ActiveCopyTrade = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      setup,
      startDate: new Date().toISOString(),
      pnl: 0,
      pnlPercent: 0,
      lastTrades: [...sampleLastTrades.filter((t: any) => t.copyTradeId === setupId)],
      status: "active",
    };

    setActiveCopyTrades((prev) => [...prev, newActiveTrade]);

    return {
      success: true,
      message: `Successfully started copying ${setup.traderNickname}'s ${setup.coin.symbol} trade! Price: ${formatUSD(setup.price)}`,
    };
  }, [availableSetups, activeCopyTrades, copyWalletBalance]);

  // Stop/Cancel a copy trade
  const stopCopyTrade = useCallback((activeTradeId: string): CopyTradeResult => {
    const trade = activeCopyTrades.find((t) => t.id === activeTradeId);
    if (!trade) return { success: false, message: "Active copy trade not found." };

    // Return remaining value to copy wallet
    const returnAmount = trade.setup.price + trade.pnl;
    setCopyWalletBalance((prev) => parseFloat((prev + returnAmount).toFixed(2)));

    // Remove from active trades
    setActiveCopyTrades((prev) => prev.filter((t) => t.id !== activeTradeId));

    return {
      success: true,
      message: `Stopped copying ${trade.setup.traderNickname}. Returned ${formatUSD(returnAmount)} to your copy wallet.`,
    };
  }, [activeCopyTrades]);

  // Pause a copy trade
  const pauseCopyTrade = useCallback((activeTradeId: string) => {
    setActiveCopyTrades((prev) =>
      prev.map((t) =>
        t.id === activeTradeId ? { ...t, status: "paused" } : t
      )
    );
  }, []);

  // Resume a paused copy trade
  const resumeCopyTrade = useCallback((activeTradeId: string) => {
    setActiveCopyTrades((prev) =>
      prev.map((t) =>
        t.id === activeTradeId ? { ...t, status: "active" } : t
      )
    );
  }, []);

  // Simulate a new trade (adds a new trade to lastTrades and updates P&L)
  const simulateNewTrade = useCallback((activeTradeId: string) => {
    setActiveCopyTrades((prev) =>
      prev.map((trade) => {
        if (trade.id !== activeTradeId || trade.status !== "active") return trade;

        // Generate a random new trade (simplified from your original)
        const profitLoss = (Math.random() - 0.4) * 50 * (trade.setup.leverage / 10); // Slight positive bias
        const type = (Math.random() > 0.5 ? "buy" : "sell") as "buy" | "sell";
        const priceChange = (Math.random() - 0.5) * 200 + (type === "buy" ? 50 : -50);

        const newTradeObj = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          copyTradeId: trade.setup.id,
          type,
          coinSymbol: trade.setup.coin.symbol,
          amount: Math.random() * 0.5 + 0.1,
          price: 57000 + priceChange, // Base price example
          profitLoss: parseFloat(profitLoss.toFixed(2)),
          leverage: trade.setup.leverage,
          date: new Date().toISOString(),
        };

        // Update last 10 trades and recalculate P&L
        const newLastTrades = [newTradeObj, ...trade.lastTrades].slice(0, 10);
        const newPnl = trade.pnl + profitLoss;
        const newPnlPercent = parseFloat(((newPnl / trade.setup.price) * 100).toFixed(2));

        return {
          ...trade,
          lastTrades: newLastTrades,
          pnl: parseFloat(newPnl.toFixed(2)),
          pnlPercent: newPnlPercent,
        };
      })
    );

    // Update copy wallet balance with profit/loss (simplified - in your original this was just setting to prev)
    // setCopyWalletBalance((prev) => prev); // This was in original - keeping for fidelity
  }, []);

  // Get active trade by setup ID
  const getActiveTradeBySetupId = useCallback((setupId: string) => {
    return activeCopyTrades.find((t) => t.setup.id === setupId);
  }, [activeCopyTrades]);

  // Context value
  const contextValue: CopyTradingContextValue = {
    copyWalletBalance,
    activeCopyTrades,
    availableSetups,
    buyCopyTrade,
    stopCopyTrade,
    pauseCopyTrade,
    resumeCopyTrade,
    simulateNewTrade,
    getActiveTradeBySetupId,
    formatUSD,
  };

  return (
    <CopyTradingContext.Provider value={contextValue}>
      {children}
    </CopyTradingContext.Provider>
  );
}

export function useCopyTrading() {
  const ctx = useContext(CopyTradingContext);
  if (!ctx) {
    throw new Error("useCopyTrading must be used within CopyTradingProvider");
  }
  return ctx;
}