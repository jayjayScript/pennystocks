"use client";

import { MantineProvider } from "@mantine/core";
import theme from "@/constants/theme";
import { PortfolioProvider } from "@/context/PortfolioContext";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <MantineProvider defaultColorScheme="dark" theme={theme}>
            <PortfolioProvider>
                {children}
            </PortfolioProvider>
        </MantineProvider>
    );
}