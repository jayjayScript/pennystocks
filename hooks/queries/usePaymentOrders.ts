"use client";

import { paymentOrdersApi } from "@/lib/api/backend";
import { useQuery } from "@tanstack/react-query";

export function usePaymentOrders(enabled: boolean = true) {
  return useQuery({
    queryKey: ["payment-orders"],
    queryFn: paymentOrdersApi.mine,
    staleTime: 5 * 1000,
    refetchInterval: enabled ? 5000 : false,
    retry: 2,
    retryDelay: attempt => Math.min(1000 * 2 ** attempt, 30000),
    enabled,
  });
}
