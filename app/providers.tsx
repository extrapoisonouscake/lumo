"use client";
import { SidebarVisibilityProvider } from "@/components/layout/app-sidebar-wrapper";
import { QueryClientProvider } from "@tanstack/react-query";
import { APIProvider } from "@vis.gl/react-google-maps";
import { ReactNode } from "react";
import { ThemeProvider } from "./theme-provider";
import { queryClient } from "./trpc";
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
if (!GOOGLE_MAPS_API_KEY) throw new Error("No Google Maps API key provided");
export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        disableTransitionOnChange
        defaultTheme="system"
        enableSystem
      >
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY as string /*?!*/}>
          <SidebarVisibilityProvider>{children}</SidebarVisibilityProvider>
        </APIProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
