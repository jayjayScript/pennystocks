"use client"

import React, { createContext, useContext, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCopyTrading as useCopyTradingQuery } from "@/hooks/queries/useCopyTrading";
import { useCopyTradingPortfolio } from "@/hooks/queries";
import { usePortfolio } from "@/context/PortfolioContext";
import { copyTradingApi } from "@/lib/api/backend";
import { flagFromCountryCode } from "@/lib/copyTradeMeta";
import type { CopyTradingPortfolio, CopyTradePurchase } from "@/types/api";

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
  addToActiveTrade: (tradeId: string, amount: number) => Promise<CopyTradeResult>;
  buyCopyTrade: (setupId: string, amountInvested: number) => Promise<CopyTradeResult>;
  stopCopyTrade: (activeTradeId: string) => Promise<CopyTradeResult>;
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
    coin: { symbol: backend.currency || "USD", name: backend.traderName, bgColor: bgColors[backend.riskLevel] ?? "rgba(0,212,161,0.1)" },
    traderNickname: backend.traderName,
    traderId: backend._id,
    countryFlag: flagFromCountryCode(backend.country),
    country: backend.country || "Global",
    leverage: backend.leverage ?? 1,
    price: 0,
    traderWinRate: backend.winrate ?? 0,
    last10Trades: backend.last_10_trades ?? [],
    percentage: backend.percentage ?? 0,
  };
}

/** Maps a real backend CopyTradePurchase into the local ActiveCopyTrade shape
 *  that existing components already render. */
function toActiveTrade(purchase: CopyTradePurchase): ActiveCopyTrade {
  const setupId = typeof purchase.copyTradingId === "string"
    ? purchase.copyTradingId
    : purchase.copyTradingId?._id ?? purchase._id;

  return {
    id: purchase._id,
    setup: {
      id: setupId,
      traderId: setupId,
      traderNickname: purchase.traderName,
      countryFlag: "",
      country: "Global",
      leverage: purchase.leverage ?? 1,
      coin: { symbol: purchase.currency || "USD", name: purchase.traderName },
      price: 0,
      traderWinRate: purchase.winrate ?? 0,
      last10Trades: [],
      percentage: purchase.percentage ?? 0,
    },
    startDate: purchase.createdAt,
    investedAmount: purchase.amountInvested,
    pnl: purchase.pnl ?? 0,
    pnlPercent: purchase.percentage ?? 0,
    lastTrades: [],
    status: "active",
  };
}

// ─── Context ──────────────────────────────────────────────────────────────────

const CopyTradingContext = createContext<CopyTradingContextValue | null>(null);

export function CopyTradingProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { data: backendSetups, isLoading: setupsLoading, refetch: refetchSetups } = useCopyTradingQuery();
  const {
    data: copyPortfolio,
    refetch: refetchCopyPortfolio,
  } = useCopyTradingPortfolio();
  // Main wallet balance — used to validate copy-wallet top-ups.
  const { accountBalance } = usePortfolio();

  // Real active trades, sourced from the backend — no local mock state.
  const {
    data: purchases,
    isLoading: purchasesLoading,
    refetch: refetchPurchases,
  } = useQuery({
    queryKey: ["my-copy-trades"],
    queryFn: copyTradingApi.mine,
    staleTime: 10 * 1000,
  });

  const loading = setupsLoading || purchasesLoading;

  const activeCopyTrades: ActiveCopyTrade[] = (purchases ?? [])
    .filter((p) => p.status !== "liquidated")
    .map(toActiveTrade);

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

  // ── Add Funds to an existing active trade (real backend call) ──────────────
  const addToActiveTrade = useCallback(
    async (tradeId: string, amount: number): Promise<CopyTradeResult> => {
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
        await copyTradingApi.addFunds(tradeId, { amountInvested: amount });
        await Promise.all([
          refetchPurchases(),
          refetchCopyPortfolio(),
          queryClient.invalidateQueries({ queryKey: ["transactions"] }),
        ]);
        return { success: true, message: `${formatUSD(amount)} added to your copy trade.` };
      } catch (err) {
        return {
          success: false,
          message: err instanceof Error ? err.message : "Failed to add funds to this trade.",
        };
      }
    },
    [copyWalletBalance, queryClient, refetchPurchases, refetchCopyPortfolio]
  );

  // ── Buy ──────────────────────────────────────────────────────────────────
  // amountInvested is a required, explicit argument — plans have no fixed
  // price, the user chooses how much to invest (see the confirmation modal).
  const buyCopyTrade = useCallback(
    async (setupId: string, amountInvested: number): Promise<CopyTradeResult> => {
      const setup = availableSetups.find((s) => s.id === setupId);
      if (!setup) return { success: false, message: "Trading setup not found." };

      if (!amountInvested || amountInvested <= 0) {
        return { success: false, message: "Enter a valid amount to invest." };
      }

      if (activeCopyTrades.some((t) => t.setup.id === setupId)) {
        return { success: false, message: "You already have this trade copied." };
      }

      if (copyWalletBalance < amountInvested) {
        return {
          success: false,
          message: `Insufficient copy wallet balance. Need ${formatUSD(amountInvested)} but have ${formatUSD(copyWalletBalance)}. Top up your copy wallet first.`,
        };
      }

      try {
        await copyTradingApi.buy(setupId, amountInvested);
      } catch (err) {
        return {
          success: false,
          message: err instanceof Error ? err.message : "Failed to purchase copy trade.",
        };
      }

      await Promise.all([refetchPurchases(), refetchCopyPortfolio()]);

      return {
        success: true,
        message: `Successfully started copying ${setup.traderNickname}!`,
      };
    },
    [availableSetups, activeCopyTrades, copyWalletBalance, refetchPurchases, refetchCopyPortfolio]
  );

  // ── Stop ─────────────────────────────────────────────────────────────────
  const stopCopyTrade = useCallback(async (activeTradeId: string): Promise<CopyTradeResult> => {
    const trade = activeCopyTrades.find((t) => t.id === activeTradeId);
    if (!trade) return { success: false, message: "Active copy trade not found." };

    try {
      await copyTradingApi.liquidate(activeTradeId);
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : "Failed to liquidate copy trade.",
      };
    }

    await Promise.all([
      refetchPurchases(),
      refetchCopyPortfolio(),
      queryClient.invalidateQueries({ queryKey: ["transactions"] }),
    ]);

    const returnAmount = trade.investedAmount + trade.pnl;
    return {
      success: true,
      message: `Stopped copying ${trade.setup.traderNickname}. Returned ${formatUSD(returnAmount)} to your copy wallet.`,
    };
  }, [activeCopyTrades, queryClient, refetchPurchases, refetchCopyPortfolio]);

  const getActiveTradeBySetupId = useCallback(
    (setupId: string) => activeCopyTrades.find((t) => t.setup.id === setupId),
    [activeCopyTrades]
  );

  const refetch = useCallback(() => {
    refetchSetups();
    refetchCopyPortfolio();
    refetchPurchases();
  }, [refetchSetups, refetchCopyPortfolio, refetchPurchases]);

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