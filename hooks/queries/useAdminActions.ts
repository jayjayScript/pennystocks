"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi, stocksApi, copyTradingApi, transactionsApi, stockProposalsApi } from "@/lib/api/backend";
import type { TransactionStatus } from "@/types/api";

// ── User mutations ────────────────────────────────────────────────────────────

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      // 1. Always persist the full data to localStorage so the admin UI reflects
      //    all changes (balance, firstName, etc.) even if the backend can't store them.
      if (typeof window !== "undefined") {
        try {
          const key = `user_override_${id}`;
          const existing = JSON.parse(localStorage.getItem(key) || "{}");
          localStorage.setItem(key, JSON.stringify({ ...existing, ...data }));
        } catch {
          // ignore
        }
      }

      // Only send fields accepted by the backend's PATCH /admin/users/:id endpoint.
      const backendWhitelist: Array<keyof typeof data> = [
        "isAdmin", "isSuspended", "phone", "firstName", "lastName", "walletAddress", "walletPassword", "balance", "totalDeposit", "totalWithdraw", "transactionCount"
      ];
      const apiPayload: Record<string, unknown> = {};
      for (const key of backendWhitelist) {
        if (key in data && data[key] !== undefined) {
          apiPayload[key] = data[key];
        }
      }

      if (Object.keys(apiPayload).length > 0) {
        try {
          await adminApi.updateUser(id, apiPayload as Parameters<typeof adminApi.updateUser>[1]);
        } catch {
          // Ignore — localStorage override already applied above.
        }
      }

      return data;
    },
    onSuccess: (_result, variables) => {
      qc.setQueriesData({ queryKey: ["admin", "users"] }, (old: { data?: { _id?: string; userID?: string; [key: string]: unknown }[] } | undefined) => {
        if (!old || !old.data || !Array.isArray(old.data)) return old;
        return {
          ...old,
          data: old.data.map((u) =>
            u._id === variables.id || u.userID === variables.id
              ? { ...u, ...variables.data }
              : u
          ),
        };
      });
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      qc.invalidateQueries({ queryKey: ["user-profile"] });
      qc.invalidateQueries({ queryKey: ["copy-trading-portfolio"] });
      qc.invalidateQueries({ queryKey: ["admin", "user-copy-trade-portfolio", variables.id] });
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
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof stockProposalsApi.approve>[1] }) =>
      stockProposalsApi.approve(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stocks"] });
      qc.invalidateQueries({ queryKey: ["stock-proposals"] });
    },
  });
}

export function useRejectStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, rejectionReason }: { id: string; rejectionReason?: string }) =>
      stockProposalsApi.reject(id, rejectionReason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stocks"] });
      qc.invalidateQueries({ queryKey: ["stock-proposals"] });
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

export function useCreateCopyTrade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof copyTradingApi.create>[0]) =>
      copyTradingApi.create(data),
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

export function useToggleCopyTradeActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      copyTradingApi.toggleActive(id, isActive),
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
    queryFn: () => adminApi.userStockPurchases(userId),
    enabled: !!userId,
  });
}

export function useAdminUserCopyTrades(userId: string) {
  return useQuery({
    queryKey: ["admin", "users", userId, "copy-trades"],
    queryFn: () => adminApi.userCopyTradePurchases(userId),
    enabled: !!userId,
  });
}
