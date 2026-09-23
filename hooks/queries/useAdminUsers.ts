"use client";

import { adminApi } from "@/lib/api/backend";
import { useQuery } from "@tanstack/react-query";

export function useAdminUsers(page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: ["admin", "users", page, limit],
    queryFn: async () => {
      const res = await adminApi.users(page, limit);
      if (typeof window !== "undefined" && res?.data && Array.isArray(res.data)) {
        res.data = res.data.map((u) => {
          try {
            const raw = localStorage.getItem(`user_override_${u._id}`) || localStorage.getItem(`user_override_${u.userID}`);
            if (raw) {
              const override = JSON.parse(raw);
              // Guard: don't let a numeric override of 0 (a form default) clobber
              // a real non-zero value that the API already returned for this user.
              const safeOverride = Object.fromEntries(
                Object.entries(override).filter(([_, v]) => {
                  if (typeof v === "number") return v !== 0; // skip 0 — it's a form default, not an intentional edit
                  return v !== null && v !== undefined && v !== "";
                })
              );
              return { ...u, ...safeOverride };
            }
          } catch {
            // Ignore parse errors
          }
          return u;
        });
      }
      return res;
    },
    staleTime: 60 * 1000,
  });
}
