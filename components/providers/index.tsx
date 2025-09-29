"use client";
import { QueryClientProvider } from "@tanstack/react-query";
import { APIProvider } from "@vis.gl/react-google-maps";
import { ReactNode } from "react";
import { ThemeProvider } from "../../views/theme-provider";
import { queryClient } from "../../views/trpc";
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
if (!GOOGLE_MAPS_API_KEY) throw new Error("No Google Maps API key provided");
export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY!}>{children}</APIProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
