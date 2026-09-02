"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";
import Logo from "@/components/logo/Logo";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

function AdminLoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/admin/overview";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      // Pass admin = true to call admin login with user collection fallback
      await login(email.trim(), password.trim(), true);
      router.replace(nextUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid admin credentials. Access denied.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative w-full max-w-md">
      {/* Glow Effects */}
      <div
        className="absolute -top-16 -left-16 w-64 h-64 rounded-full pointer-events-none opacity-20 blur-3xl"
        style={{ background: "#00d4a1" }}
      />
      <div
        className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full pointer-events-none opacity-10 blur-3xl"
        style={{ background: "#3b82f6" }}
      />

      {/* Card */}
      <div
        className="relative rounded-2xl p-8 backdrop-blur-xl transition-all duration-300 shadow-2xl"
        style={{
          background: "linear-gradient(145deg, rgba(21, 29, 45, 0.95) 0%, rgba(13, 22, 36, 0.98) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(0, 212, 161, 0.05)",
        }}
      >
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="mb-4">
            <Logo />
          </div>

          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-3 tracking-wide uppercase"
            style={{
              background: "rgba(0, 212, 161, 0.12)",
              color: "#00d4a1",
              border: "1px solid rgba(0, 212, 161, 0.25)",
            }}
          >
            <Icon icon="mdi:shield-lock-outline" width={15} />
            <span>Admin Portal</span>
          </div>

          <h1 className="text-2xl font-bold text-white tracking-tight">
            Administrator Sign In
          </h1>
          <p className="text-xs mt-1.5 text-gray-400 max-w-xs">
            Enter your credentials to access the administrative dashboard and management controls.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            className="mb-6 p-3.5 rounded-xl flex items-start gap-3 text-xs leading-relaxed"
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              color: "#f87171",
            }}
          >
            <Icon icon="mdi:alert-circle-outline" width={18} className="shrink-0 mt-0.5" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Icon icon="mdi:email-outline" width={18} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@pennystocks.com"
                required
                disabled={submitting}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl text-white placeholder-gray-500 transition-all outline-none"
                style={{
                  background: "#0d1624",
                  border: "1px solid #252f45",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#00d4a1")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#252f45")}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Admin Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Icon icon="mdi:lock-outline" width={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                disabled={submitting}
                className="w-full pl-10 pr-11 py-2.5 text-sm rounded-xl text-white placeholder-gray-500 transition-all outline-none"
                style={{
                  background: "#0d1624",
                  border: "1px solid #252f45",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#00d4a1")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#252f45")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-white transition-colors"
                tabIndex={-1}
              >
                <Icon icon={showPassword ? "mdi:eye-off-outline" : "mdi:eye-outline"} width={18} />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: submitting
                ? "#00a880"
                : "linear-gradient(135deg, #00d4a1 0%, #00b386 100%)",
              color: "#08101a",
              boxShadow: "0 4px 20px rgba(0, 212, 161, 0.3)",
            }}
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <Icon icon="mdi:lock-open-outline" width={18} />
                <span>Sign In to Admin</span>
              </>
            )}
          </button>
        </form>

        {/* Footer / Back link */}
        <div className="mt-8 pt-5 border-t text-center" style={{ borderColor: "rgba(255, 255, 255, 0.08)" }}>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <Icon icon="mdi:arrow-left" width={15} />
            <span>Return to Client Portal</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4"
      style={{
        background: "radial-gradient(ellipse at center top, #151d2d 0%, #0d1624 70%)",
      }}
    >
      <Suspense
        fallback={
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
            <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">Loading Admin Portal</p>
          </div>
        }
      >
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
