// app/(root)/layout.tsx  — server component, forces dynamic rendering for all dashboard pages
import { DashboardLayout } from "@/components/DashboardLayout";
import type { Metadata } from "next";
import RequireAuth from "@/lib/requireAuth";

// This layout MUST be dynamic — all child pages show user-specific, real-time data.
// Without this, Next.js prerenders at build time and serves stale/stale empty pages.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "User dashboard",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RequireAuth><DashboardLayout>{children}</DashboardLayout></RequireAuth>;
}