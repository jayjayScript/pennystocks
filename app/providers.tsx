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
} from "@tanstack/react-query";
import { useState } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";

export function Providers({ children }: { children: React.ReactNode }) {

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      })
  );

  const content = (
    <MantineProvider defaultColorScheme="dark" theme={theme}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CopyTradingProvider>
            <PortfolioProvider>
              <StockRequestProvider>
                {children}
              </StockRequestProvider>
            </PortfolioProvider>
          </CopyTradingProvider>
        </AuthProvider>
      </QueryClientProvider>
    </MantineProvider>
  );

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  return googleClientId ? (
    <GoogleOAuthProvider clientId={googleClientId}>{content}</GoogleOAuthProvider>
  ) : content;
}
