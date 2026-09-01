
"use client";

import { stocksApi } from "@/lib/api/backend";
import { useQuery } from "@tanstack/react-query";

export function useStocks(
  page: number = 1,
  limit: number = 50
) {
  return useQuery({
    queryKey: ["stocks", page, limit],
    queryFn: () => stocksApi.list(page, limit),
    staleTime: 60 * 1000,
  });
}
