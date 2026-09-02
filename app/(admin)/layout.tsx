"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { adminNavLinks } from "@/constants/admin-data";
import Logo from "@/components/logo/Logo";
import { CopyTradingProvider } from "@/context/CopyTradingContext";
import RequireAdmin from "@/lib/requireAdmin";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If on admin login page, bypass dashboard shell
  if (pathname === "/admin/login") {
    return <RequireAdmin>{children}</RequireAdmin>;
  }

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/admin/login");
    } catch {
      router.replace("/admin/login");
    }
  };

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : "Administrator";

  return (
    <RequireAdmin>
      <div className="flex min-h-screen" style={{ background: "#0d1624" }}>
        {/* Mobile Header */}
        <header
          className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3"
          style={{ background: "#151d2d", borderBottom: "1px solid #1d2639" }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg"
            style={{ background: "#0d1624" }}
            aria-label="Open menu"
          >
            <Icon icon="mdi:menu" width={24} style={{ color: "#9aa3b0" }} />
          </button>
          <Logo />
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
            title="Logout"
            aria-label="Logout"
          >
            <Icon icon="mdi:logout" width={20} />
          </button>
        </header>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="md:hidden fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.5)" }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <aside
          className={`
            md:hidden fixed left-0 top-0 bottom-0 z-50 w-72 p-4 flex flex-col
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
          style={{ background: "#151d2d", borderRight: "1px solid #1d2639" }}
        >
          {/* Close Button */}
          <div className="flex items-center justify-between mb-8">
            <Logo />
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg"
              style={{ background: "#0d1624" }}
              aria-label="Close menu"
            >
              <Icon icon="mdi:close" width={24} style={{ color: "#9aa3b0" }} />
            </button>
          </div>

          {/* Admin Badge */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl mb-6"
            style={{ background: "rgba(0,212,161,0.1)", border: "1px solid rgba(0,212,161,0.2)" }}
          >
            <Icon icon="mdi:shield-check" width={18} style={{ color: "#00d4a1" }} />
            <span className="text-xs font-bold" style={{ color: "#00d4a1" }}>Admin Panel</span>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-1 flex-1 overflow-y-auto">
            {adminNavLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive ? "text-white" : "text-penny-text-muted"
                  }`}
                  style={{
                    background: isActive ? "rgba(0,212,161,0.1)" : "transparent",
                    border: isActive ? "1px solid rgba(0,212,161,0.2)" : "1px solid transparent",
                  }}
                >
                  <Icon
                    icon={link.icon}
                    width={20}
                    style={{ color: isActive ? "#00d4a1" : "#9aa3b0" }}
                  />
                  <span className="text-sm font-semibold">{link.page}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom user section */}
          <div className="pt-4 border-t" style={{ borderColor: "#1d2639" }}>
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3 overflow-hidden">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "rgba(0,212,161,0.15)" }}
                >
                  <Icon icon="mdi:account" width={20} style={{ color: "#00d4a1" }} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                  <p className="text-xs" style={{ color: "#9aa3b0" }}>{user?.email || "Super Admin"}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                title="Sign out"
              >
                <Icon icon="mdi:logout" width={18} />
              </button>
            </div>
          </div>
        </aside>

        {/* Desktop Sidebar */}
        <aside
          className="hidden md:flex flex-col w-64 min-h-screen fixed left-0 top-0 z-40 p-4"
          style={{ background: "#151d2d", borderRight: "1px solid #1d2639" }}
        >
          {/* Logo */}
          <div className="mb-8 px-2">
            <Logo />
          </div>

          {/* Admin Badge */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl mb-6"
            style={{ background: "rgba(0,212,161,0.1)", border: "1px solid rgba(0,212,161,0.2)" }}
          >
            <Icon icon="mdi:shield-check" width={18} style={{ color: "#00d4a1" }} />
            <span className="text-xs font-bold" style={{ color: "#00d4a1" }}>Admin Panel</span>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-1 flex-1 overflow-y-auto">
            {adminNavLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "text-white"
                      : "text-penny-text-muted hover:text-white"
                  }`}
                  style={{
                    background: isActive ? "rgba(0,212,161,0.1)" : "transparent",
                    border: isActive ? "1px solid rgba(0,212,161,0.2)" : "1px solid transparent",
                  }}
                >
                  <Icon
                    icon={link.icon}
                    width={20}
                    style={{ color: isActive ? "#00d4a1" : "#9aa3b0" }}
                  />
                  <span className="text-sm font-semibold">{link.page}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom user section */}
          <div className="pt-4 border-t" style={{ borderColor: "#1d2639" }}>
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3 overflow-hidden">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "rgba(0,212,161,0.15)" }}
                >
                  <Icon icon="mdi:account" width={20} style={{ color: "#00d4a1" }} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                  <p className="text-xs truncate" style={{ color: "#9aa3b0" }}>{user?.email || "Super Admin"}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                title="Sign out"
              >
                <Icon icon="mdi:logout" width={18} />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:ml-64 pt-16 md:pt-0 p-4 md:p-6">
          <CopyTradingProvider>
            {children}
          </CopyTradingProvider>
        </main>
      </div>
    </RequireAdmin>
  );
}
