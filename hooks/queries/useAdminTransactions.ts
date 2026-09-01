"use client";

import { adminApi } from "@/lib/api/backend";
import { useQuery } from "@tanstack/react-query";

export function useAdminTransactions(page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: ["admin", "transactions", page, limit],
    queryFn: () => adminApi.transactions(page, limit),
    staleTime: 60 * 1000,
  });
}
