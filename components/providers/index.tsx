"use client";
import { QueryClientProvider } from "@tanstack/react-query";

import { ReactNode, useEffect } from "react";
import { ThemeProvider } from "../../views/theme-provider";
import { queryClient } from "../../views/trpc";
import { NetworkStatusProvider } from "./network-status-provider";

import { isMobileApp } from "../../constants/ui";
export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (isMobileApp) {
      Promise.all([import("@sentry/capacitor"), import("@sentry/react")]).then(
        ([Sentry, SentryReact]) => {
          Sentry.init(
            {
              dsn: "https://c6ccf7cc17d5709e02d1c069313fb6d0@o4508129189363712.ingest.de.sentry.io/4508129193689168",
              sendDefaultPii: true,
              release: `lumo@${process.env.IOS_MARKETING_VERSION}`,
              dist: process.env.IOS_BUILD_NUMBER,
            },
            SentryReact.init
          );
        }
      );
    }
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        <NetworkStatusProvider>{children}</NetworkStatusProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
