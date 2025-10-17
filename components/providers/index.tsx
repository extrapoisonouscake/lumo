"use client";
import { QueryClientProvider } from "@tanstack/react-query";

import { ReactNode } from "react";
import { ThemeProvider } from "../../views/theme-provider";
import { queryClient } from "../../views/trpc";
import { NetworkStatusProvider } from "./network-status-provider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        <NetworkStatusProvider>{children}</NetworkStatusProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
