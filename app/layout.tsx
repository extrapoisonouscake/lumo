import { Toaster } from "@/components/ui/sonner";
import { GoogleAnalytics } from "@next/third-parties/google";

import { GeistSans } from "geist/font/sans";
import { Metadata, Viewport } from "next";
import { ReactNode } from "react";
import { Providers } from "../components/providers";
import "./globals.css";

import {
  USER_SETTINGS_COOKIE_PREFIX,
  USER_SETTINGS_DEFAULT_VALUES,
} from "@/constants/core";
import { THEME_COLOR_TAG_ID, WEBSITE_TITLE } from "@/constants/website";
import { prepareThemeColor } from "@/helpers/prepare-theme-color";
import { serverAuthChecks } from "@/helpers/server-auth-checks";
import { cookies } from "next/headers";

export const viewport: Viewport = {
  maximumScale: 1,
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    {
      color: "black",
      media: "(prefers-color-scheme: dark)",
    },
  ],
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
  let themeColor = USER_SETTINGS_DEFAULT_VALUES.themeColor;
  if (isLoggedIn) {
    const cachedThemeColor = JSON.parse(
      store.get(`${USER_SETTINGS_COOKIE_PREFIX}`)?.value ?? "{}"
    ).themeColor;
    if (cachedThemeColor) {
      themeColor = cachedThemeColor;
    }
  }

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
        </head>
        <body className={GeistSans.className}>
          <div
            className="flex justify-center min-h-full"
            vaul-drawer-wrapper="true"
          >
            <Providers>
              <Toaster />

              {children}
            </Providers>
            {process.env.NODE_ENV === "production" && (
              <GoogleAnalytics
                gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID!}
              />
            )}
          </div>
        </body>
      </html>
    </>
  );
}
