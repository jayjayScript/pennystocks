"use client";

import { authApi } from "@/lib/api/backend";
import { useQuery } from "@tanstack/react-query";

export function useUserProfile() {
  return useQuery({
    queryKey: ["user-profile"],
    queryFn: authApi.profile,
  });
}
