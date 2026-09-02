"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/**
 * Admin guard — ensures only authenticated administrators can access admin routes.
 * Redirects unauthenticated users to the admin login page.
 */
export default function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/admin/login") return;

    if (!loading && !user?.isAdmin) {
      router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, user, router, pathname]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (loading || !user?.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "#0d1624" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-2 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
          <p className="text-xs text-gray-400 font-medium tracking-wider uppercase">Verifying Admin Access</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

