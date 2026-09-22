"use client"

import React, { createContext, useContext, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCopyTrading as useCopyTradingQuery } from "@/hooks/queries/useCopyTrading";
import { useCopyTradingPortfolio } from "@/hooks/queries";
import { usePortfolio } from "@/context/PortfolioContext";
import { copyTradingApi } from "@/lib/api/backend";
import type { CopyTradingPortfolio } from "@/types/api";

interface CopyTradingContextValue {
  /** Balance held in the dedicated copy-trading wallet (separate from the main wallet). */
  copyWalletBalance: number;
  /** Backend copy-trading portfolio record (totals, currency, etc.). */
  copyPortfolio: CopyTradingPortfolio | null;
  activeCopyTrades: ActiveCopyTrade[];
  availableSetups: CopyTradeSetup[];
  loading: boolean;
  /** Move funds from the main wallet into the copy-trading wallet. */
  topUpCopyWallet: (amount: number) => Promise<CopyTradeResult>;
  /** Move funds from the copy-trading wallet back to the main wallet. */
  withdrawCopyWallet: (amount: number) => Promise<CopyTradeResult>;
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
    // Plans have no fixed price; users choose the amount they want to invest.
    price: 0,
    traderWinRate: backend.rateOfChange,
  };
}

// ─── Context ──────────────────────────────────────────────────────────────────

const CopyTradingContext = createContext<CopyTradingContextValue | null>(null);

export function CopyTradingProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { data: backendSetups, isLoading: loading, refetch: refetchSetups } = useCopyTradingQuery();
  const {
    data: copyPortfolio,
    refetch: refetchCopyPortfolio,
  } = useCopyTradingPortfolio();
  // Main wallet balance — used to validate copy-wallet top-ups.
  const { accountBalance } = usePortfolio();

  const [activeCopyTrades, setActiveCopyTrades] = useState<ActiveCopyTrade[]>([]);

  // The copy-trading wallet balance lives on the backend portfolio record.
  const copyWalletBalance = copyPortfolio?.balance ?? 0;

  // availableSetups — show all setups from the API.
  const availableSetups: CopyTradeSetup[] = (backendSetups ?? []).map(toLocalSetup);

  // ── Top Up Copy Wallet (main wallet → copy wallet) ──────────────────────────
  const topUpCopyWallet = useCallback(
    async (amount: number): Promise<CopyTradeResult> => {
      if (!amount || amount <= 0) {
        return { success: false, message: "Enter a valid amount." };
      }
      if (amount > accountBalance) {
        return {
          success: false,
          message: `Insufficient main wallet balance. You have ${formatUSD(accountBalance)} available.`,
        };
      }
      try {
        await copyTradingApi.depositToPortfolio({ amount });
        await Promise.all([
          refetchCopyPortfolio(),
          queryClient.invalidateQueries({ queryKey: ["user-profile"] }),
          queryClient.invalidateQueries({ queryKey: ["transactions"] }),
        ]);
        return {
          success: true,
          message: `${formatUSD(amount)} moved to your copy trading wallet.`,
        };
      } catch (err) {
        return {
          success: false,
          message: err instanceof Error ? err.message : "Failed to top up copy wallet.",
        };
      }
    },
    [accountBalance, queryClient, refetchCopyPortfolio]
  );

  // ── Withdraw Copy Wallet (copy wallet → main wallet) ────────────────────────
  const withdrawCopyWallet = useCallback(
    async (amount: number): Promise<CopyTradeResult> => {
      if (!amount || amount <= 0) {
        return { success: false, message: "Enter a valid amount." };
      }
      if (amount > copyWalletBalance) {
        return {
          success: false,
          message: `Insufficient copy wallet balance. You have ${formatUSD(copyWalletBalance)} available.`,
        };
      }
      try {
        await copyTradingApi.withdrawFromPortfolio({ amount });
        await Promise.all([
          refetchCopyPortfolio(),
          queryClient.invalidateQueries({ queryKey: ["user-profile"] }),
          queryClient.invalidateQueries({ queryKey: ["transactions"] }),
        ]);
        return {
          success: true,
          message: `${formatUSD(amount)} returned to your main wallet.`,
        };
      } catch (err) {
        return {
          success: false,
          message: err instanceof Error ? err.message : "Failed to withdraw from copy wallet.",
        };
      }
    },
    [copyWalletBalance, queryClient, refetchCopyPortfolio]
  );

  // ── Add Funds to Active Trade ─────────────────────────────────────────────
  // TODO: wire to backend endpoint (e.g. POST /copy-trading/:tradeId/add-funds)
  const addToActiveTrade = useCallback((tradeId: string, amount: number) => {
    if (amount <= 0 || amount > copyWalletBalance) return;
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
  }, [copyWalletBalance]);

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
          message: `Insufficient copy wallet balance. Need ${formatUSD(setup.price)} but have ${formatUSD(copyWalletBalance)}. Top up your copy wallet first.`,
        };
      }

      // Call backend — it debits the copy-trading wallet on success.
      try {
        await copyTradingApi.buy(setupId, setup.price);
      } catch {
        return { success: false, message: "Failed to purchase copy trade." };
      }

      // Refresh the copy wallet balance from the backend.
      await refetchCopyPortfolio();

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
    [availableSetups, activeCopyTrades, copyWalletBalance, refetchCopyPortfolio]
  );

  // ── Stop ─────────────────────────────────────────────────────────────────
  const stopCopyTrade = useCallback((activeTradeId: string): CopyTradeResult => {
    const trade = activeCopyTrades.find((t) => t.id === activeTradeId);
    if (!trade) return { success: false, message: "Active copy trade not found." };

    const returnAmount = trade.investedAmount + trade.pnl;
    // Liquidation credits the copy wallet on the backend.
    void refetchCopyPortfolio();
    setActiveCopyTrades((prev) => prev.filter((t) => t.id !== activeTradeId));

    return {
      success: true,
      message: `Stopped copying ${trade.setup.traderNickname}. Returned ${formatUSD(returnAmount)} to your copy wallet.`,
    };
  }, [activeCopyTrades, refetchCopyPortfolio]);

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

  const refetch = useCallback(() => {
    refetchSetups();
    refetchCopyPortfolio();
  }, [refetchSetups, refetchCopyPortfolio]);

  const value: CopyTradingContextValue = {
    copyWalletBalance,
    copyPortfolio: copyPortfolio ?? null,
    activeCopyTrades,
    availableSetups,
    loading,
    topUpCopyWallet,
    withdrawCopyWallet,
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
