"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { stocksApi } from "@/lib/api/backend";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StockRequestResult {
  success: boolean;
  message: string;
}

interface StockRequestContextValue {
  stockRequests: StockRequest[];
  submitting: boolean;
  submitStockRequest: (
    data: Omit<StockRequest, "id" | "status" | "createdAt" | "submittedBy">
  ) => Promise<StockRequestResult>;
  approveStockRequest: (id: string) => void;
  rejectStockRequest: (id: string) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const StockRequestContext = createContext<StockRequestContextValue | null>(null);

export function StockRequestProvider({ children }: { children: React.ReactNode }) {
  const [stockRequests, setStockRequests] = useState<StockRequest[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const submitStockRequest = useCallback(
    async (data: Omit<StockRequest, "id" | "status" | "createdAt" | "submittedBy">): Promise<StockRequestResult> => {
      setSubmitting(true);
      try {
        const stock = await stocksApi.create({
          name: data.name,
          acronym: data.ticker,
          lastPrice: data.initialPrice,
          change24h: 0,
          rateOfChange: 0,
          currency: "USD",
        });

        // Optimistically add to local list with backend ID
        const request: StockRequest = {
          ...data,
          id: stock._id,
          status: "pending",
          createdAt: stock.createdAt,
          submittedBy: "user",
        };
        setStockRequests((prev) => [request, ...prev]);
        return { success: true, message: `${data.ticker} proposal submitted for review.` };
      } catch (err) {
        return {
          success: false,
          message: err instanceof Error ? err.message : "Failed to submit proposal.",
        };
      } finally {
        setSubmitting(false);
      }
    },
    []
  );

  const approveStockRequest = useCallback((id: string) => {
    setStockRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "approved" } : r))
    );
  }, []);

  const rejectStockRequest = useCallback((id: string) => {
    setStockRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "rejected" } : r))
    );
  }, []);

  return (
    <StockRequestContext.Provider
      value={{ stockRequests, submitting, submitStockRequest, approveStockRequest, rejectStockRequest }}
    >
      {children}
    </StockRequestContext.Provider>
  );
}

export function useStockRequests() {
  const ctx = useContext(StockRequestContext);
  if (!ctx) throw new Error("useStockRequests must be used within StockRequestProvider");
  return ctx;
}
