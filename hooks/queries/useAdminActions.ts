"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi, stocksApi, copyTradingApi, transactionsApi, authApi } from "@/lib/api/backend";
import type { TransactionStatus, Stock } from "@/types/api";

// ── User mutations ────────────────────────────────────────────────────────────

// Update a user's editable profile fields via the user-facing /user/profile endpoint.
// The backend only accepts: firstName, lastName, phone, profileImage, walletAddress, walletPassword.
export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<ReturnType<typeof authApi.updateProfile>>[0] }) =>
      authApi.updateProfile(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      qc.invalidateQueries({ queryKey: ["user-profile"] });
    },
  });
}

export function useToggleUserSuspend() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isSuspended }: { id: string; isSuspended: boolean }) =>
      adminApi.updateUser(id, { isSuspended }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useToggleUserAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isAdmin }: { id: string; isAdmin: boolean }) =>
      adminApi.updateUser(id, { isAdmin }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

// ── Transaction mutations ─────────────────────────────────────────────────────

export function useUpdateTransactionStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TransactionStatus }) =>
      adminApi.updateTransactionStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "transactions"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["user-profile"] });
    },
  });
}

// ── Payment order mutations ───────────────────────────────────────────────────

export function useUpdatePaymentOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { methodDetails?: string; status?: "completed" | "rejected" } }) =>
      adminApi.updatePaymentOrder(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payment-orders"] });
      qc.invalidateQueries({ queryKey: ["admin", "payment-orders"] });
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      qc.invalidateQueries({ queryKey: ["user-profile"] });
    },
  });
}

export function useSendDepositDetails() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, methodDetails }: { id: string; methodDetails: string }) =>
      adminApi.updatePaymentOrder(id, { methodDetails }),
    onSuccess: () => {
      // Invalidate both admin AND user payment-orders so the user's
      // /transactions/orders query refreshes immediately — no waiting for poll.
      qc.invalidateQueries({ queryKey: ["payment-orders"] });
      qc.invalidateQueries({ queryKey: ["admin", "payment-orders"] });
    },
  });
}

export function useApprovePaymentOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.updatePaymentOrder(id, { status: "completed" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payment-orders"] });
      qc.invalidateQueries({ queryKey: ["admin", "payment-orders"] });
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      qc.invalidateQueries({ queryKey: ["user-profile"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useRejectPaymentOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.updatePaymentOrder(id, { status: "rejected" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payment-orders"] });
      qc.invalidateQueries({ queryKey: ["admin", "payment-orders"] });
    },
  });
}

// ── Stock mutations ───────────────────────────────────────────────────────────

export function useCreateStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: stocksApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stocks"] });
    },
  });
}

export function useUpdateStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof stocksApi.update>[1] }) =>
      stocksApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stocks"] });
    },
  });
}

export function useDeleteStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => stocksApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stocks"] });
    },
  });
}

export function useApproveStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Pick<Stock, "lastPrice" | "name" | "acronym" | "change24h" | "rateOfChange" | "description" | "exchange" | "type" | "supply" | "totalVolume">> }) =>
      adminApi.approveStock(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stocks"] });
    },
  });
}

export function useRejectStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.rejectStock(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stocks"] });
    },
  });
}

// ── Copy trading mutations ────────────────────────────────────────────────────

export function useCreateCopyTrade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: copyTradingApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["copy-trading"] });
    },
  });
}

export function useUpdateCopyTrade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof copyTradingApi.update>[1] }) =>
      copyTradingApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["copy-trading"] });
    },
  });
}

export function useDeleteCopyTrade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => copyTradingApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["copy-trading"] });
    },
  });
}

// ── User-facing transaction create ───────────────────────────────────────────

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof transactionsApi.create>[0]) => transactionsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["user-profile"] });
    },
  });
}

// ── Admin user holdings queries ───────────────────────────────────────────────

export function useAdminUserPurchases(userId: string) {
  return useQuery({
    queryKey: ["admin", "users", userId, "purchases"],
    queryFn: () => adminApi.getUserPurchases(userId),
    enabled: !!userId,
  });
}

export function useAdminUserCopyTrades(userId: string) {
  return useQuery({
    queryKey: ["admin", "users", userId, "copy-trades"],
    queryFn: () => adminApi.getUserCopyTrades(userId),
    enabled: !!userId,
  });
}
