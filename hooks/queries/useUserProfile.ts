"use client";

import { authApi } from "@/lib/api/backend";
import { useQuery } from "@tanstack/react-query";

export function useUserProfile(enabled: boolean = true) {
  return useQuery({
    queryKey: ["user-profile"],
    queryFn: authApi.profile,
    enabled,
    // Always re-fetch from the server on window focus so that admin-updated
    // balances are reflected immediately when the user returns to the tab.
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}
