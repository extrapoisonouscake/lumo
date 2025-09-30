import { IS_LOGGED_IN_COOKIE_NAME } from "@/constants/auth";
import {
  USER_SETTINGS_DEFAULT_VALUES,
  USER_THEME_COLOR_COOKIE_PREFIX,
} from "@/constants/core";
import "@/views/globals.css";
import { THEME_STORAGE_KEY_NAME } from "@/views/theme-provider/constants";
import { GeistSans } from "geist/font/sans";
import { Metadata } from "next";
import { cookies } from "next/headers";
export const metadata: Metadata = {
  appleWebApp: { capable: true },
};
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const store = await cookies();
  const isLoggedIn = store.get(IS_LOGGED_IN_COOKIE_NAME)?.value === "true";
  let themeColor = USER_SETTINGS_DEFAULT_VALUES.themeColor;
  if (isLoggedIn) {
    const cachedThemeColor = store.get(USER_THEME_COLOR_COOKIE_PREFIX);

    if (cachedThemeColor) {
      themeColor = cachedThemeColor.value;
    }
  }
  const theme = store.get(THEME_STORAGE_KEY_NAME)?.value;
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
        <body className={GeistSans.className}>
          <div
            className="flex items-center justify-center min-h-full pt-[env(safe-area-inset-top,0)]"
            vaul-drawer-wrapper="true"
          >
            {children}
          </div>
        </body>
      </html>
    </>
  );
}
