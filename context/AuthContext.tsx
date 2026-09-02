"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { adminApi, authApi } from "@/lib/api/backend";
import type { ApiUser, AuthResponse } from "@/types/api";

type AuthContextValue = { user: ApiUser | null; loading: boolean; login: (email: string, password: string, admin?: boolean) => Promise<void>; signInWithGoogle: (idToken: string) => Promise<void>; signInWithApple: () => Promise<void>; logout: () => Promise<void>; refreshProfile: () => Promise<void> };
const AuthContext = createContext<AuthContextValue | null>(null);
const persist = (result: AuthResponse, isAdmin = false) => {
  if (isAdmin) {
    // Store both admin-namespace tokens (for admin-only routes) AND
    // regular tokens (for /transactions/* routes that both admins and users hit).
    localStorage.setItem("adminAccessToken", result.accessToken);
    localStorage.setItem("adminRefreshToken", result.refreshToken);
    localStorage.setItem("accessToken", result.accessToken);
    localStorage.setItem("refreshToken", result.refreshToken);
  } else {
    localStorage.setItem("accessToken", result.accessToken);
    localStorage.setItem("refreshToken", result.refreshToken);
  }
};


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    try {
      const profile = await authApi.profile();
      setUser({ ...profile, isAdmin: localStorage.getItem("isAdmin") === "true" });
    } catch (err) {
      const isAdmin = localStorage.getItem("isAdmin") === "true";
      if (isAdmin && localStorage.getItem("accessToken")) {
        setUser((prev) => prev ?? {
          _id: "admin",
          userID: "ADMIN",
          email: "admin@pennystocks.com",
          firstName: "Super",
          lastName: "Admin",
          balance: 0,
          totalWithdraw: 0,
          totalDeposit: 0,
          transactionCount: 0,
          isSuspended: false,
          isAdmin: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        return;
      }
      throw err;
    }
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      setLoading(false);
      return;
    }
    refreshProfile()
      .catch(() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("isAdmin");
      })
      .finally(() => setLoading(false));
  }, [refreshProfile]);

  const login = async (email: string, password: string, admin = false) => {
    let result: AuthResponse;
    let isAdminUser = admin;

    if (admin) {
      try {
        result = await adminApi.adminLogin({ email, password });
        isAdminUser = true;
      } catch (adminErr) {
        // Fallback: Attempt standard login to check if account has isAdmin flag in database
        try {
          result = await authApi.login({ email, password });
          persist(result);
          const profile = await authApi.profile().catch(() => null);
          const isActuallyAdmin = Boolean(profile?.isAdmin || (result.user as { isAdmin?: boolean })?.isAdmin);
          if (isActuallyAdmin) {
            isAdminUser = true;
          } else {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("isAdmin");
            throw new Error("Access denied: This account does not have administrator privileges.");
          }
        } catch (userErr) {
          if (userErr instanceof Error && userErr.message.includes("administrator privileges")) {
            throw userErr;
          }
          throw (adminErr instanceof Error ? adminErr : userErr);
        }
      }
    } else {
      result = await authApi.login({ email, password });
    }

    // Store tokens in the correct namespace (admin vs user)
    persist(result, isAdminUser);
    localStorage.setItem("isAdmin", String(isAdminUser));


    if (result.user) {
      setUser({
        _id: result.user._id || "admin",
        userID: result.user.userID || "ADMIN",
        email: result.user.email,
        firstName: result.user.firstName || (isAdminUser ? "Super" : "User"),
        lastName: result.user.lastName || (isAdminUser ? "Admin" : ""),
        balance: 0,
        totalWithdraw: 0,
        totalDeposit: 0,
        transactionCount: 0,
        isSuspended: false,
        isAdmin: isAdminUser,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    await refreshProfile().catch(() => {});
  };
  const completeProviderSignIn = async (result: AuthResponse) => { persist(result, false); localStorage.setItem("isAdmin", "false"); await refreshProfile(); };

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
  const logout = async () => { try { await authApi.logout(); } finally { localStorage.removeItem("accessToken"); localStorage.removeItem("refreshToken"); localStorage.removeItem("adminAccessToken"); localStorage.removeItem("adminRefreshToken"); localStorage.removeItem("isAdmin"); setUser(null); } };

  return <AuthContext.Provider value={{ user, loading, login, signInWithGoogle, signInWithApple, logout, refreshProfile }}>{children}</AuthContext.Provider>;
}
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error("useAuth must be used within AuthProvider"); return value; }
