"use client";

import { copyTradingApi } from "@/lib/api/backend";
import { useQuery } from "@tanstack/react-query";

export function useCopyTrading() {
  return useQuery({
    queryKey: ["copy-trading"],
    queryFn: copyTradingApi.list,
    staleTime: 60 * 1000,
  });
}

export function useCopyTradingDetail(id?: string) {
  return useQuery({
    queryKey: ["copy-trading", id],
    queryFn: () => copyTradingApi.get(id!),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
  });
}
