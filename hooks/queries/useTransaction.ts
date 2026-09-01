"use client";

import { transactionsApi } from "@/lib/api/backend";
import { useQuery } from "@tanstack/react-query";

export function useTransaction(id?: string) {
  return useQuery({
    queryKey: ["transaction", id],
    queryFn: () => transactionsApi.get(id!),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
  });
}
