"use client";

import { authApi } from "@/lib/api/backend";
import { useQuery } from "@tanstack/react-query";

export function useUserProfile(enabled: boolean = true) {
  return useQuery({
    queryKey: ["user-profile"],
    queryFn: authApi.profile,
    enabled,
  });
}
