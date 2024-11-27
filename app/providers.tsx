"use client";

import { ReactNode } from "react";
import { ReloginProvider } from "./relogin-provider";
import { ThemeProvider } from "./theme-provider";
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      disableTransitionOnChange
      defaultTheme="system"
      enableSystem
    >
      <ReloginProvider>{children}</ReloginProvider>
    </ThemeProvider>
  );
}
