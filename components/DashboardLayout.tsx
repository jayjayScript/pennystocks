// components/DashboardLayout.tsx — client component
"use client";

import DesktopSideNav from "@/components/global/nav/DesktopSideNav";
import MobileNav from "@/components/global/nav/MobileNav";
import TopNav from "@/components/global/nav/TopNav";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex w-full overflow-x-hidden" style={{ background: "#0d1624" }}>
      {/* Desktop Sidebar — fixed, hidden on mobile */}
      <DesktopSideNav />

      {/* Right side: TopNav + main content, offset by sidebar width on md+ */}
      <div className="flex flex-col flex-1 md:ml-64 min-h-screen w-full overflow-x-hidden">
        {/* Top navigation bar */}
        <TopNav />

        {/* Main content area — grows to fill remaining height */}
        <main className="flex-1 overflow-y-auto pb-32 md:pb-0 w-full">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav — fixed, visible only on mobile */}
      <MobileNav />
    </div>
  );
}