"use client";

import { MantineProvider } from "@mantine/core";
import theme from "@/constants/theme";
import { PortfolioProvider } from "@/context/PortfolioContext";
import { StockRequestProvider } from "@/context/StockRequestContext";
import { CopyTradingProvider } from "@/context/CopyTradingContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider defaultColorScheme="dark" theme={theme}>
      <CopyTradingProvider>
        <PortfolioProvider>
          <StockRequestProvider>
            {children}
          </StockRequestProvider>
        </PortfolioProvider>
      </CopyTradingProvider>
    </MantineProvider>
  );
}