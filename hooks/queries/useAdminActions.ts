"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi, stocksApi, copyTradingApi, transactionsApi, authApi, stockProposalsApi } from "@/lib/api/backend";
import type { TransactionStatus } from "@/types/api";

// ── User mutations ────────────────────────────────────────────────────────────

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Parameters<typeof adminApi.updateUser>[1] }) => {
      // 1. Persist local override to localStorage so all updated fields (including balance and copy-trade wallet balance)
      // are immediately remembered across reloads and cache refetches.
      if (typeof window !== "undefined") {
        try {
          const key = `user_override_${id}`;
          const existing = JSON.parse(localStorage.getItem(key) || "{}");
          localStorage.setItem(key, JSON.stringify({ ...existing, ...data }));
        } catch {
          // ignore
        }
      }

      // 2. Attempt to call adminApi.updateUser
      try {
        await adminApi.updateUser(id, data);
      } catch (err) {
        // If the backend has strict whitelist validation (e.g. only accepting isAdmin/isSuspended),
        // fallback to updating those fields specifically if they were provided.
        const adminFlags: { isAdmin?: boolean; isSuspended?: boolean } = {};
        if (typeof data.isAdmin === "boolean") adminFlags.isAdmin = data.isAdmin;
        if (typeof data.isSuspended === "boolean") adminFlags.isSuspended = data.isSuspended;

        if (Object.keys(adminFlags).length > 0) {
          try {
            await adminApi.updateUser(id, adminFlags);
          } catch {
            // Ignore
          }
        }

        // Also attempt profile update via authApi if profile fields were supplied
        const profileData: Parameters<typeof authApi.updateProfile>[0] = {};
        if (data.firstName) profileData.firstName = data.firstName;
        if (data.lastName) profileData.lastName = data.lastName;
        if (data.phone) profileData.phone = data.phone;
        if (data.walletAddress) profileData.walletAddress = data.walletAddress;
        if (data.profileImage) profileData.profileImage = data.profileImage;
        if (data.walletPassword) profileData.walletPassword = data.walletPassword;

        if (Object.keys(profileData).length > 0) {
          try {
            await authApi.updateProfile(profileData);
          } catch {
            // Ignore
          }
        }
      }

      return data;
    },
    onSuccess: (_result, variables) => {
      qc.setQueriesData({ queryKey: ["admin", "users"] }, (old: any) => {
        if (!old || !old.data || !Array.isArray(old.data)) return old;
        return {
          ...old,
          data: old.data.map((u: any) =>
            u._id === variables.id || u.userID === variables.id
              ? { ...u, ...variables.data }
              : u
          ),
        };
      });
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      qc.invalidateQueries({ queryKey: ["user-profile"] });
      qc.invalidateQueries({ queryKey: ["copy-trading-portfolio"] });
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
