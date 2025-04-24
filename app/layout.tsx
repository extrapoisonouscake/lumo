import { AppSidebarWrapper } from "@/components/layout/app-sidebar-wrapper";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/helpers/cn";

import { GeistSans } from "geist/font/sans";
import { Viewport } from "next";
import { ReactNode } from "react";
import { Providers } from "../components/providers";
import "./globals.css";

import { createCaller } from "@/lib/trpc";

import { createTRPCContext } from "@/lib/trpc/context";

export const viewport: Viewport = { maximumScale: 1 };

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const caller = createCaller(await createTRPCContext());
  const userSettings = await caller.user.getSettings();
  const themeColor = userSettings.themeColor;

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
          <Providers>
            <Toaster />
            <AppSidebarWrapper>{children}</AppSidebarWrapper>
          </Providers>
        </body>
      </html>
    </>
  );
}
