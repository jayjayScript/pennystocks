"use client";

import { MantineProvider } from "@mantine/core";
import theme from "@/constants/theme";
import { PortfolioProvider } from "@/context/PortfolioContext";
import { StockRequestProvider } from "@/context/StockRequestContext";
import { CopyTradingProvider } from "@/context/CopyTradingContext";
import { AuthProvider } from "@/context/AuthContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider defaultColorScheme="dark" theme={theme}>
      <AuthProvider>
      <CopyTradingProvider>
        <PortfolioProvider>
          <StockRequestProvider>
            {children}
          </StockRequestProvider>
        </PortfolioProvider>
      </CopyTradingProvider>
      </AuthProvider>
    </MantineProvider>
  );
}
