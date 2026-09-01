
"use client";

import { transactionsApi } from "@/lib/api/backend";
import { useQuery } from "@tanstack/react-query";

export function useTransactions(
  page: number = 1,
  limit: number = 50
) {
  return useQuery({
    queryKey: ["transactions", page, limit],
    queryFn: () => transactionsApi.mine(page, limit),
    staleTime: 60 * 1000,
  });
}
