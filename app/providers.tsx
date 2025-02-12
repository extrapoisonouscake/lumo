"use client";

import { APIProvider } from "@vis.gl/react-google-maps";
import { ReactNode } from "react";
import { ThemeProvider } from "./theme-provider";
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
if (!GOOGLE_MAPS_API_KEY) throw new Error("No Google Maps API key provided");
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      disableTransitionOnChange
      defaultTheme="system"
      enableSystem
    >
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY as string /*?!*/}>
        {children}
      </APIProvider>
    </ThemeProvider>
  );
}
