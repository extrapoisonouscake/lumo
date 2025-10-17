"use client";

import { isMobileApp } from "@/constants/ui";
import { storage } from "@/helpers/cache";
import { restoreAuthCookiesFromPreferences } from "@/helpers/capacitor-cookie-persistence";
import { ReactNode, useEffect, useState } from "react";
import { FullscreenLoader } from "../ui/fullscreen-loader";

interface CookieRestorationProviderProps {
  children: ReactNode;
}

/**
 * Provider that ensures auth cookies are restored from Capacitor Preferences
 * before rendering children on mobile apps. This prevents API requests from
 * being made before cookies are available.
 *
 * On web, this is a no-op and renders children immediately.
 */
export function CookieRestorationProvider({
  children,
}: CookieRestorationProviderProps) {
  const [isRestoring, setIsRestoring] = useState(isMobileApp);

  useEffect(() => {
    // Skip restoration on web
    if (!isMobileApp) {
      return;
    }

    const initializeCookies = async () => {
      try {
        // Restore auth cookies from Preferences on mobile app startup
        // This MUST complete before any API requests are made
        // Add a timeout to prevent the app from being stuck
        await Promise.race([
          restoreAuthCookiesFromPreferences(),
          new Promise((resolve) => setTimeout(resolve, 3000)), // 3 second timeout
        ]);
      } catch (error) {
        console.error("[CookieRestoration] Failed:", error);
      } finally {
        // Check if any of the keys are expired
        storage.clearExpired();

        // Mark restoration as complete, allowing the app to render
        setIsRestoring(false);
      }
    };

    initializeCookies();
  }, []);

  // Show loading spinner while restoring cookies to prevent API requests
  if (isRestoring) {
    return <FullscreenLoader />;
  }

  return <>{children}</>;
}
