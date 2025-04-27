import { AppSidebarWrapper } from "@/components/layout/app-sidebar-wrapper";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/helpers/cn";

import { GeistSans } from "geist/font/sans";
import { Metadata, Viewport } from "next";
import { ReactNode } from "react";
import { Providers } from "../components/providers";
import "./globals.css";

import { createCaller } from "@/lib/trpc";

import { USER_SETTINGS_DEFAULT_VALUES } from "@/constants/core";
import { WEBSITE_TITLE } from "@/constants/website";
import { prepareThemeColor } from "@/helpers/prepare-theme-color";
import { serverAuthChecks } from "@/helpers/server-auth-checks";
import { createTRPCContext } from "@/lib/trpc/context";
import { cookies } from "next/headers";
import { THEME_COLOR_TAG_ID } from "./constants";

export const viewport: Viewport = {
  maximumScale: 1,
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};
export const metadata: Metadata = {
  manifest: "/manifest.json",
  title: {
    default: WEBSITE_TITLE,
    template: `%s | ${WEBSITE_TITLE}`,
  },
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const store = await cookies();
  const isLoggedIn = serverAuthChecks.isLoggedIn(store);
  const isGuest = serverAuthChecks.isInGuestMode(store);
  let themeColor = USER_SETTINGS_DEFAULT_VALUES.themeColor;
  if (isLoggedIn || isGuest) {
    const caller = createCaller(await createTRPCContext());
    const userSettings = await caller.core.settings.getSettings();
    themeColor = userSettings.themeColor;
  }
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
          <meta
            name="theme-color"
            id={THEME_COLOR_TAG_ID}
            content={prepareThemeColor(themeColor)}
            media="(prefers-color-scheme: light)"
          />
          <meta
            name="theme-color"
            media="(prefers-color-scheme: dark)"
            content="black"
          />
        </head>
        <body
          className={cn("flex justify-center min-h-full", GeistSans.className)}
        >
          <Providers initialCookieValues={{ isLoggedIn, isGuest }}>
            <Toaster />
            <AppSidebarWrapper
              initialIsExpanded={isSidebarExpanded}
              initialThemeColor={themeColor}
            >
              {children}
            </AppSidebarWrapper>
          </Providers>
        </body>
      </html>
    </>
  );
}
