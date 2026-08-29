"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authApi } from "@/lib/api/backend";
import type { ApiUser, AuthResponse } from "@/types/api";

type AuthContextValue = { user: ApiUser | null; loading: boolean; login: (email: string, password: string, admin?: boolean) => Promise<void>; logout: () => Promise<void>; refreshProfile: () => Promise<void> };
const AuthContext = createContext<AuthContextValue | null>(null);
const persist = (result: AuthResponse) => { localStorage.setItem("accessToken", result.accessToken); localStorage.setItem("refreshToken", result.refreshToken); };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null); const [loading, setLoading] = useState(true);
  const refreshProfile = useCallback(async () => { const profile = await authApi.profile(); setUser({ ...profile, isAdmin: localStorage.getItem("isAdmin") === "true" }); }, []);
  useEffect(() => { if (!localStorage.getItem("accessToken")) { setLoading(false); return; } refreshProfile().catch(() => { localStorage.removeItem("accessToken"); localStorage.removeItem("refreshToken"); }).finally(() => setLoading(false)); }, [refreshProfile]);
  const login = async (email: string, password: string, admin = false) => { const result = await (admin ? authApi.adminLogin({ email, password }) : authApi.login({ email, password })); persist(result); localStorage.setItem("isAdmin", String(admin)); await refreshProfile(); };
  const logout = async () => { try { await authApi.logout(); } finally { localStorage.removeItem("accessToken"); localStorage.removeItem("refreshToken"); localStorage.removeItem("isAdmin"); setUser(null); } };
  return <AuthContext.Provider value={{ user, loading, login, logout, refreshProfile }}>{children}</AuthContext.Provider>;
}
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error("useAuth must be used within AuthProvider"); return value; }
