"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { useCopyTrading as useCopyTradingQuery } from "@/hooks/queries/useCopyTrading";
import { copyTradingApi } from "@/lib/api/backend";

interface CopyTradingContextValue {
  copyWalletBalance: number;
  activeCopyTrades: ActiveCopyTrade[];
  availableSetups: CopyTradeSetup[];
  loading: boolean;
  topUpCopyWallet: (amount: number) => void;
  addToActiveTrade: (tradeId: string, amount: number) => void;
  buyCopyTrade: (setupId: string) => Promise<CopyTradeResult>;
  stopCopyTrade: (activeTradeId: string) => CopyTradeResult;
  pauseCopyTrade: (activeTradeId: string) => void;
  resumeCopyTrade: (activeTradeId: string) => void;
  simulateNewTrade: (activeTradeId: string) => void;
  getActiveTradeBySetupId: (setupId: string) => ActiveCopyTrade | undefined;
  formatUSD: (n: number) => string;
  refetch: () => void;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

export function formatUSD(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function toLocalSetup(backend: import("@/types/api").CopyTrading): CopyTradeSetup {
  const bgColors: Record<string, string> = {
    low: "rgba(0,212,161,0.1)",
    medium: "rgba(245,197,24,0.1)",
    high: "rgba(244,67,54,0.1)",
  };
  return {
    id: backend._id,
    coin: { symbol: backend.traderName, name: backend.traderName, bgColor: bgColors[backend.riskLevel] ?? "rgba(0,212,161,0.1)" },
    traderNickname: backend.traderName,
    traderId: backend._id,
    countryFlag: "🌐",
    country: "Global",
    leverage: 1,
    price: backend.copyTradePrice,
    traderWinRate: backend.rateOfChange,
  };
}

// ─── Context ──────────────────────────────────────────────────────────────────

const CopyTradingContext = createContext<CopyTradingContextValue | null>(null);

export function CopyTradingProvider({ children }: { children: React.ReactNode }) {
  const { data: backendSetups, isLoading: loading, refetch } = useCopyTradingQuery();

  const [copyWalletBalance, setCopyWalletBalance] = useState(0);
  const [activeCopyTrades, setActiveCopyTrades] = useState<ActiveCopyTrade[]>([]);

  // availableSetups — show all setups from the API.
  const availableSetups: CopyTradeSetup[] = (backendSetups ?? []).map(toLocalSetup);

  // ── Top Up Wallet ──────────────────────────────────────────────────────────
  // TODO: wire to backend endpoint (e.g. POST /copy-wallet/topup)
  const topUpCopyWallet = useCallback((amount: number) => {
    if (amount <= 0) return;
    setCopyWalletBalance((prev) => parseFloat((prev + amount).toFixed(2)));
  }, []);

  // ── Add Funds to Active Trade ─────────────────────────────────────────────
  // TODO: wire to backend endpoint (e.g. POST /copy-trading/:tradeId/add-funds)
  const addToActiveTrade = useCallback((tradeId: string, amount: number) => {
    if (amount <= 0) return;
    setCopyWalletBalance((prev) => {
      const next = prev - amount;
      if (next < 0) return prev; // insufficient balance
      return parseFloat(next.toFixed(2));
    });
    setActiveCopyTrades((prev) =>
      prev.map((trade) => {
        if (trade.id !== tradeId) return trade;
        const newInvested = trade.investedAmount + amount;
        // Recalculate PnL percent based on new invested amount
        const newPnlPercent = trade.pnl === 0 ? 0 : parseFloat(((trade.pnl / newInvested) * 100).toFixed(2));
        return {
          ...trade,
          investedAmount: newInvested,
          pnlPercent: newPnlPercent,
        };
      })
    );
  }, []);

  // ── Buy ──────────────────────────────────────────────────────────────────
  const buyCopyTrade = useCallback(
    async (setupId: string): Promise<CopyTradeResult> => {
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

      // Call backend
      try {
        await copyTradingApi.buy(setupId, setup.price);
      } catch {
        // Rollback on failure
        setCopyWalletBalance((prev) => parseFloat((prev + setup.price).toFixed(2)));
        return { success: false, message: "Failed to purchase copy trade." };
      }

      // Create active copy trade entry
      const newActiveTrade: ActiveCopyTrade = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        setup,
        startDate: new Date().toISOString(),
        investedAmount: setup.price,
        pnl: 0,
        pnlPercent: 0,
        lastTrades: [],
        status: "active",
      };

      setActiveCopyTrades((prev) => [...prev, newActiveTrade]);

      return {
        success: true,
        message: `Successfully started copying ${setup.traderNickname}!`,
      };
    },
    [availableSetups, activeCopyTrades, copyWalletBalance]
  );

  // ── Stop ─────────────────────────────────────────────────────────────────
  const stopCopyTrade = useCallback((activeTradeId: string): CopyTradeResult => {
    const trade = activeCopyTrades.find((t) => t.id === activeTradeId);
    if (!trade) return { success: false, message: "Active copy trade not found." };

    const returnAmount = trade.investedAmount + trade.pnl;
    setCopyWalletBalance((prev) => parseFloat((prev + returnAmount).toFixed(2)));
    setActiveCopyTrades((prev) => prev.filter((t) => t.id !== activeTradeId));

    return {
      success: true,
      message: `Stopped copying ${trade.setup.traderNickname}. Returned ${formatUSD(returnAmount)} to your copy wallet.`,
    };
  }, [activeCopyTrades]);

  const pauseCopyTrade = useCallback((activeTradeId: string) => {
    setActiveCopyTrades((prev) =>
      prev.map((t) => t.id === activeTradeId ? { ...t, status: "paused" } : t)
    );
  }, []);

  const resumeCopyTrade = useCallback((activeTradeId: string) => {
    setActiveCopyTrades((prev) =>
      prev.map((t) => t.id === activeTradeId ? { ...t, status: "active" } : t)
    );
  }, []);

  const simulateNewTrade = useCallback((activeTradeId: string) => {
    setActiveCopyTrades((prev) =>
      prev.map((trade) => {
        if (trade.id !== activeTradeId || trade.status !== "active") return trade;

        const profitLoss = (Math.random() - 0.4) * 50;
        const type = (Math.random() > 0.5 ? "buy" : "sell") as "buy" | "sell";
        const priceChange = (Math.random() - 0.5) * 200 + (type === "buy" ? 50 : -50);

        const newTradeObj = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          copyTradeId: trade.setup.id,
          type,
          coinSymbol: trade.setup.coin.symbol,
          amount: Math.random() * 0.5 + 0.1,
          price: 57000 + priceChange,
          profitLoss: parseFloat(profitLoss.toFixed(2)),
          leverage: trade.setup.leverage,
          date: new Date().toISOString(),
        };

        const newLastTrades = [newTradeObj, ...trade.lastTrades].slice(0, 10);
        const newPnl = trade.pnl + profitLoss;
        const newPnlPercent = parseFloat(((newPnl / trade.investedAmount) * 100).toFixed(2));

        return {
          ...trade,
          lastTrades: newLastTrades,
          pnl: parseFloat(newPnl.toFixed(2)),
          pnlPercent: newPnlPercent,
        };
      })
    );
  }, []);

  const getActiveTradeBySetupId = useCallback(
    (setupId: string) => activeCopyTrades.find((t) => t.setup.id === setupId),
    [activeCopyTrades]
  );

  const value: CopyTradingContextValue = {
    copyWalletBalance,
    activeCopyTrades,
    availableSetups,
    loading,
    topUpCopyWallet,
    addToActiveTrade,
    buyCopyTrade,
    stopCopyTrade,
    pauseCopyTrade,
    resumeCopyTrade,
    simulateNewTrade,
    getActiveTradeBySetupId,
    formatUSD,
    refetch,
  };

  return (
    <CopyTradingContext.Provider value={value}>
      {children}
    </CopyTradingContext.Provider>
  );
}

export function useCopyTrading() {
  const ctx = useContext(CopyTradingContext);
  if (!ctx) throw new Error("useCopyTrading must be used within CopyTradingProvider");
  return ctx;
}
