// app/(root)/layout.tsx  — server component, just re-exports metadata
import { DashboardLayout } from "@/components/DashboardLayout";
import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "Dashboard",
  description: "User dashboard",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}