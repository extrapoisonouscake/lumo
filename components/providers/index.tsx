"use client";
import { QueryClientProvider } from "@tanstack/react-query";
import { APIProvider } from "@vis.gl/react-google-maps";
import { ReactNode } from "react";
import { ThemeProvider } from "../../app/theme-provider";
import { queryClient } from "../../app/trpc";
import { AuthStatusProvider } from "./auth-status-provider";
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
if (!GOOGLE_MAPS_API_KEY) throw new Error("No Google Maps API key provided");
export function Providers({
  children,
  initialCookieValues,
}: {
  children: ReactNode;
  initialCookieValues: { isLoggedIn: boolean };
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        disableTransitionOnChange
        defaultTheme="system"
        enableSystem
      >
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY!}>
          <AuthStatusProvider initialCookieValues={initialCookieValues}>
            {children}
          </AuthStatusProvider>
        </APIProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
