"use client";

import { paymentOrdersApi } from "@/lib/api/backend";
import { useQuery } from "@tanstack/react-query";

export function usePaymentOrders() {
  return useQuery({
    queryKey: ["payment-orders"],
    queryFn: paymentOrdersApi.mine,
    staleTime: 60 * 1000,
  });
}
