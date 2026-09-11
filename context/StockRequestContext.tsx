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
  // These are no-ops now — admin handles approval/rejection via /admin/stocks
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
        // Creates the stock with isApproved: null (pending admin approval).
        // Backend should default isApproved to null on POST /stocks.
        // proposedPrice is stored locally so the user can see what they proposed.
        const stock = await stocksApi.create({
          name: data.name,
          acronym: data.ticker,
          lastPrice: data.initialPrice,
          change24h: 0,
          rateOfChange: 0,
          currency: "USD",
          description: data.description,
          exchange: data.exchange,
          type: data.type,
        });

        const request: StockRequest = {
          ...data,
          id: stock._id,
          status: "pending",
          createdAt: stock.createdAt,
          submittedBy: "user",
        };
        setStockRequests((prev) => [request, ...prev]);
        return { success: true, message: `${data.ticker} proposal submitted. Admin will review and set the listing price.` };
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

  // No-ops — approval/rejection is handled by the admin on /admin/stocks
  const approveStockRequest = useCallback((_id: string) => {
    // Admin handles this via the stocks approval flow
  }, []);

  const rejectStockRequest = useCallback((_id: string) => {
    // Admin handles this via the stocks approval flow
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
