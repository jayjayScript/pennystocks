"use client";

import { MantineProvider } from "@mantine/core";
import theme from "@/constants/theme";
import { PortfolioProvider } from "@/context/PortfolioContext";
import { StockRequestProvider } from "@/context/StockRequestContext";
import { CopyTradingProvider } from "@/context/CopyTradingContext";
import { AuthProvider } from "@/context/AuthContext";
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";
import { useState } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";

const handleAuthExpiry = (error: unknown) => {
  if (typeof window === "undefined") return;
  const status = (error as { status?: number })?.status;
  if (status === 401) {
    const isAdminRoute = window.location.pathname.startsWith("/admin");
    if (isAdminRoute) {
      localStorage.removeItem("adminAccessToken");
      localStorage.removeItem("adminRefreshToken");
      if (window.location.pathname !== "/admin/login") {
        window.location.replace("/admin/login");
      }
    } else {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      if (window.location.pathname !== "/") {
        window.location.replace("/");
      }
    }
  }
};

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: handleAuthExpiry,
        }),
        mutationCache: new MutationCache({
          onError: handleAuthExpiry,
        }),
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: (failureCount, error) => {
              if ((error as { status?: number })?.status === 401) return false;
              return failureCount < 2;
            },
          },
        },
      })
  );

  const content = (
    <MantineProvider defaultColorScheme="dark" theme={theme}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <PortfolioProvider>
            <CopyTradingProvider>
              <StockRequestProvider>
                {children}
              </StockRequestProvider>
            </CopyTradingProvider>
          </PortfolioProvider>
        </AuthProvider>
      </QueryClientProvider>
    </MantineProvider>
  );

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  return googleClientId ? (
    <GoogleOAuthProvider clientId={googleClientId}>{content}</GoogleOAuthProvider>
  ) : content;
}
