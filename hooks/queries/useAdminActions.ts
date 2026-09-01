"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, stocksApi, copyTradingApi, transactionsApi } from "@/lib/api/backend";
import type { TransactionStatus } from "@/types/api";

// ── User mutations ────────────────────────────────────────────────────────────

export function useToggleUserSuspend() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isSuspended }: { id: string; isSuspended: boolean }) =>
      adminApi.updateUser(id, { isSuspended }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
}

export function useToggleUserAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isAdmin }: { id: string; isAdmin: boolean }) =>
      adminApi.updateUser(id, { isAdmin }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
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
      qc.invalidateQueries({ queryKey: ["admin-transactions"] });
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
      qc.invalidateQueries({ queryKey: ["admin-payment-orders"] });
      qc.invalidateQueries({ queryKey: ["user-profile"] });
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
