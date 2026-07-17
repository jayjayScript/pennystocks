"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/overview");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: "#0d1624" }}>
      <div className="animate-pulse">
        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(0,212,161,0.1)" }}>
          <div className="w-6 h-6 rounded-full" style={{ background: "#00d4a1" }} />
        </div>
      </div>
    </div>
  );
}