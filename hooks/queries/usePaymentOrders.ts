"use client";

import { paymentOrdersApi } from "@/lib/api/backend";
import { useQuery } from "@tanstack/react-query";

export function usePaymentOrders() {
  return useQuery({
    queryKey: ["payment-orders"],
    queryFn: paymentOrdersApi.mine,
    staleTime: 5 * 1000,
    refetchInterval: 5000,
    retry: 2,
    retryDelay: attempt => Math.min(1000 * 2 ** attempt, 30000),
  });
}
