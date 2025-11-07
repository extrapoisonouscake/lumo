"use client";
import { QueryClientProvider } from "@tanstack/react-query";

import { ReactNode, useEffect } from "react";
import { ThemeProvider } from "../../views/theme-provider";
import { queryClient } from "../../views/trpc";
import { NetworkStatusProvider } from "./network-status-provider";

import { isProduction } from "@/constants/core";
import * as Sentry from "@sentry/react";
import { isMobileApp } from "../../constants/ui";
import { AppUpdatePromptProvider } from "./app-update-prompt-provider";
const sentryConfig = {
  dsn: "https://044f7cfed8d518021870324fa7e59d7e@o4509261052641280.ingest.us.sentry.io/4509261053493248",
  sendDefaultPii: true,

  enabled: isProduction,
  // Add optional integrations for additional features
  integrations: [Sentry.replayIntegration()],

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,
  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Define how likely Replay events are sampled.
  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,

  // Define how likely Replay events are sampled when an error occurs.
  replaysOnErrorSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
};
export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (isMobileApp) {
      import("@sentry/capacitor").then((SentryCapacitor) => {
        SentryCapacitor.init(sentryConfig, Sentry.init);
      });
    } else {
      Sentry.init(sentryConfig);
    }
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        <NetworkStatusProvider>
          <AppUpdatePromptProvider>{children}</AppUpdatePromptProvider>
        </NetworkStatusProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
