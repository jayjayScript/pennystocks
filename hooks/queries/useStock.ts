"use client";

import { stocksApi } from "@/lib/api/backend";
import { useQuery } from "@tanstack/react-query";

export function useStock(id?: string) {
  return useQuery({
    queryKey: ["stock", id],
    queryFn: () => stocksApi.get(id!),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
  });
}
