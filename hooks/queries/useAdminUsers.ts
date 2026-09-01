"use client";

import { adminApi } from "@/lib/api/backend";
import { useQuery } from "@tanstack/react-query";

export function useAdminUsers(page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: ["admin", "users", page, limit],
    queryFn: () => adminApi.users(page, limit),
    staleTime: 60 * 1000,
  });
}
