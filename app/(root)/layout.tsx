// app/(root)/layout.tsx  — server component, just re-exports metadata
import { DashboardLayout } from "@/components/DashboardLayout";
import type { Metadata } from "next";
import RequireAuth from "@/lib/requireAuth";


export const metadata: Metadata = {
  title: "Dashboard",
  description: "User dashboard",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  // return <RequireAuth><DashboardLayout>{children}</DashboardLayout></RequireAuth>;
  return <DashboardLayout>{children}</DashboardLayout>
}