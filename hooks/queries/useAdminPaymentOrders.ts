"use client";

import { adminApi } from "@/lib/api/backend";
import { useQuery } from "@tanstack/react-query";

export function useAdminPaymentOrders() {
  return useQuery({
    queryKey: ["admin", "payment-orders"],
    queryFn: adminApi.paymentOrders,
    staleTime: 60 * 1000,
  });
}
