"use client";

import React, { createContext, useContext, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StockRequestContextValue {
  stockRequests: StockRequest[];
  submitStockRequest: (data: Omit<StockRequest, "id" | "status" | "createdAt" | "submittedBy">) => void;
  approveStockRequest: (id: string) => void;
  rejectStockRequest: (id: string) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const StockRequestContext = createContext<StockRequestContextValue | null>(null);

function generateId(): string {
  return `sr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function StockRequestProvider({ children }: { children: React.ReactNode }) {
  const [stockRequests, setStockRequests] = useState<StockRequest[]>([]);

  const submitStockRequest = (
    data: Omit<StockRequest, "id" | "status" | "createdAt" | "submittedBy">
  ) => {
    const request: StockRequest = {
      ...data,
      id: generateId(),
      status: "pending",
      createdAt: new Date().toISOString(),
      submittedBy: "user",
    };
    setStockRequests((prev) => [request, ...prev]);
  };

  const approveStockRequest = (id: string) => {
    setStockRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "approved" } : r))
    );
  };

  const rejectStockRequest = (id: string) => {
    setStockRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "rejected" } : r))
    );
  };

  return (
    <StockRequestContext.Provider
      value={{ stockRequests, submitStockRequest, approveStockRequest, rejectStockRequest }}
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
