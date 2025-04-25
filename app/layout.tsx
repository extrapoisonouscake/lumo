import { AppSidebarWrapper } from "@/components/layout/app-sidebar-wrapper";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/helpers/cn";

import { GeistSans } from "geist/font/sans";
import { Viewport } from "next";
import { ReactNode } from "react";
import { Providers } from "../components/providers";
import "./globals.css";

import { createCaller } from "@/lib/trpc";

import { serverAuthChecks } from "@/helpers/server-auth-checks";
import { createTRPCContext } from "@/lib/trpc/context";
import { cookies } from "next/headers";

export const viewport: Viewport = { maximumScale: 1 };

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const caller = createCaller(await createTRPCContext());
  const userSettings = await caller.core.settings.getSettings();
  const themeColor = userSettings.themeColor;
  const store = await cookies();
  const isLoggedIn = serverAuthChecks.isLoggedIn(store);
  const isGuest = serverAuthChecks.isInGuestMode(store);
  const isSidebarExpanded = store.get("sidebar:state")?.value === "true";
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head>
          <style
            id="theme-color-style"
            dangerouslySetInnerHTML={{
              __html: `
                :root {
                  --brand: ${themeColor};
                }
              `,
            }}
          />
        </head>
        <body
          className={cn("flex justify-center min-h-full", GeistSans.className)}
        >
          <Providers initialCookieValues={{ isLoggedIn, isGuest }}>
            <Toaster />
            <AppSidebarWrapper initialIsExpanded={isSidebarExpanded}>
              {children}
            </AppSidebarWrapper>
          </Providers>
        </body>
      </html>
    </>
  );
}
