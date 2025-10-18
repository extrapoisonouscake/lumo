import { IS_LOGGED_IN_COOKIE_NAME } from "@/constants/auth";
import {
  USER_SETTINGS_DEFAULT_VALUES,
  USER_THEME_COLOR_COOKIE_PREFIX,
} from "@/constants/core";
import { isMobileApp } from "@/constants/ui";
import { APP_STORE_APP_ID, WEBSITE_TITLE } from "@/constants/website";
import { cn } from "@/helpers/cn";
import "@/views/globals.css";
import { THEME_STORAGE_KEY_NAME } from "@/views/theme-provider/constants";
import { GeistSans } from "geist/font/sans";
import { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
export const viewport: Viewport = {
  userScalable: false,
  viewportFit: "cover",
};
export const metadata: Metadata = {
  appleWebApp: { capable: true },
  itunes: {
    appId: APP_STORE_APP_ID,
  },
  title: WEBSITE_TITLE,
};
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let theme,
    themeColor = USER_SETTINGS_DEFAULT_VALUES.themeColor;
  if (!isMobileApp) {
    const store = await cookies();
    const isLoggedIn = store.get(IS_LOGGED_IN_COOKIE_NAME)?.value === "true";

    if (isLoggedIn) {
      const cachedThemeColor = store.get(USER_THEME_COLOR_COOKIE_PREFIX);

      if (cachedThemeColor) {
        themeColor = cachedThemeColor.value;
      }
    }
    theme = store.get(THEME_STORAGE_KEY_NAME)?.value;
  }
  return (
    <>
      <html lang="en" suppressHydrationWarning className={theme}>
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
        <body className={cn(GeistSans.className, "bg-background")}>
          {children}
        </body>
      </html>
    </>
  );
}
