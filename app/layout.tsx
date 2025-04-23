import { AppSidebarWrapper } from "@/components/layout/app-sidebar-wrapper";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/helpers/cn";

import { getUserSettings } from "@/lib/trpc/routes/user/queries";
import { GeistSans } from "geist/font/sans";
import { Viewport } from "next";
import { ReactNode } from "react";
import "./globals.css";
import { Providers } from "./providers";

export const viewport: Viewport = { maximumScale: 1 };
export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const userSettings = await getUserSettings();
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
