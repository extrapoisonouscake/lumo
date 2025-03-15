import { AppSidebarWrapper } from "@/components/layout/app-sidebar-wrapper";
import { Toaster } from "@/components/ui/sonner";
import { WEBSITE_TITLE } from "@/constants/website";
import { cn } from "@/helpers/cn";
import { getUserSettings } from "@/lib/settings/queries";
import { GeistSans } from "geist/font/sans";
import { Metadata, Viewport } from "next";
import { ReactNode } from "react";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    default: WEBSITE_TITLE,
    template: `%s | ${WEBSITE_TITLE}`,
  },
};
export const viewport: Viewport = { maximumScale: 1 };
export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Get theme color from server-side
  const userSettings = getUserSettings();
  const themeColor = userSettings.themeColor;

  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head>
          <style
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
