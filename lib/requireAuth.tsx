"use client";
import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
export default function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth(); const router = useRouter(); const pathname = usePathname();
  useEffect(() => { if (!loading && !user) router.replace(`/?next=${encodeURIComponent(pathname)}`); }, [loading, user, router, pathname]);
  if (loading || !user) return null;
  return <>{children}</>;
}
