"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { adminApi, authApi } from "@/lib/api/backend";
import type { ApiUser, AuthResponse } from "@/types/api";

type AuthContextValue = { user: ApiUser | null; loading: boolean; login: (email: string, password: string, admin?: boolean) => Promise<void>; signInWithGoogle: (idToken: string) => Promise<void>; signInWithApple: () => Promise<void>; logout: () => Promise<void>; refreshProfile: () => Promise<void> };
const AuthContext = createContext<AuthContextValue | null>(null);
const persist = (result: AuthResponse) => { localStorage.setItem("accessToken", result.accessToken); localStorage.setItem("refreshToken", result.refreshToken); };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null); const [loading, setLoading] = useState(true);
  const refreshProfile = useCallback(async () => { const profile = await authApi.profile(); setUser({ ...profile, isAdmin: localStorage.getItem("isAdmin") === "true" }); }, []);
  useEffect(() => { if (!localStorage.getItem("accessToken")) { setLoading(false); return; } refreshProfile().catch(() => { localStorage.removeItem("accessToken"); localStorage.removeItem("refreshToken"); }).finally(() => setLoading(false)); }, [refreshProfile]);
  const login = async (email: string, password: string, admin = false) => { const result = await (admin ? adminApi.adminLogin({ email, password }) : authApi.login({ email, password })); persist(result); localStorage.setItem("isAdmin", String(admin)); await refreshProfile(); };
  const completeProviderSignIn = async (result: AuthResponse) => { persist(result); localStorage.setItem("isAdmin", "false"); await refreshProfile(); };
  const loadScript = (src: string, id: string) => new Promise<void>((resolve, reject) => { if (document.getElementById(id)) return resolve(); const script = document.createElement("script"); script.id = id; script.src = src; script.async = true; script.onload = () => resolve(); script.onerror = () => reject(new Error("Could not load the identity provider")); document.head.appendChild(script); });
  const signInWithGoogle = async (idToken: string) => {
    if (!idToken) throw new Error("Google did not return an ID token");
    await completeProviderSignIn(await authApi.google({ idToken }));
  };
  const signInWithApple = async () => {
    const clientId = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID;
    const redirectURI = process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI;
    if (!clientId || !redirectURI) throw new Error("Apple sign-in is not configured");
    await loadScript("https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js", "apple-identity-services");
    const apple = (window as Window & { AppleID?: { auth: { init: (options: { clientId: string; scope: string; redirectURI: string; usePopup: boolean }) => void; signIn: () => Promise<{ authorization: { id_token?: string }; user?: { name?: { firstName?: string; lastName?: string } } }> } } }).AppleID;
    if (!apple) throw new Error("Apple sign-in is unavailable");
    apple.auth.init({ clientId, scope: "name email", redirectURI, usePopup: true });
    const response = await apple.auth.signIn();
    const idToken = response.authorization.id_token;
    if (!idToken) throw new Error("Apple did not return an ID token");
    await completeProviderSignIn(await authApi.apple({ idToken, firstName: response.user?.name?.firstName, lastName: response.user?.name?.lastName }));
  };
  const logout = async () => { try { await authApi.logout(); } finally { localStorage.removeItem("accessToken"); localStorage.removeItem("refreshToken"); localStorage.removeItem("isAdmin"); setUser(null); } };
  return <AuthContext.Provider value={{ user, loading, login, signInWithGoogle, signInWithApple, logout, refreshProfile }}>{children}</AuthContext.Provider>;
}
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error("useAuth must be used within AuthProvider"); return value; }
