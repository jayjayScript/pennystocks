"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/**
 * Admin guard — in a production app this would check a real session.
 * For now it renders children directly since auth is handled at the server level.
 */
export default function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth(); const router = useRouter(); const pathname = usePathname();
  useEffect(() => { if (!loading && !user?.isAdmin) router.replace(`/?next=${encodeURIComponent(pathname)}`); }, [loading, user, router, pathname]);
  if (loading || !user?.isAdmin) return null;
  return <>{children}</>;
}
