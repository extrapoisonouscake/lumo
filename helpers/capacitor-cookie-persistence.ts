import {
  AUTH_COOKIES_NAMES,
  AUTH_COOKIES_PREFIX,
  IS_LOGGED_IN_COOKIE_NAME,
} from "@/constants/auth";
import { isMobileApp } from "@/constants/ui";
import { WEBSITE_ROOT } from "@/constants/website";
import { CapacitorCookies } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";

const PREFERENCES_KEY = "auth_cookies";

interface StoredCookies {
  cookies: Record<string, string>;
  timestamp: number;
}

/**
 * Get all auth-related cookies from the browser
 */
export async function getAuthCookiesFromBrowser(): Promise<
  Record<string, string>
> {
  const allCookies = await CapacitorCookies.getCookies();
  const authCookies: Record<string, string> = {};

  // Get all auth cookies
  Object.values(AUTH_COOKIES_NAMES).forEach((name) => {
    const fullName = `${AUTH_COOKIES_PREFIX}.${name}`;
    if (allCookies[fullName]) {
      authCookies[fullName] = allCookies[fullName];
    }
  });

  // Also save the isLoggedIn cookie
  if (allCookies[IS_LOGGED_IN_COOKIE_NAME]) {
    authCookies[IS_LOGGED_IN_COOKIE_NAME] =
      allCookies[IS_LOGGED_IN_COOKIE_NAME];
  }

  return authCookies;
}

/**
 * Save auth cookies to Capacitor Preferences (mobile only)
 */
export async function saveAuthCookiesToPreferences(): Promise<void> {
  if (!isMobileApp) return;

  const cookies = await getAuthCookiesFromBrowser();

  if (Object.keys(cookies).length > 0) {
    const data: StoredCookies = {
      cookies,
      timestamp: Date.now(),
    };

    await Preferences.set({
      key: PREFERENCES_KEY,
      value: JSON.stringify(data),
    });
  }
}

/**
 * Load auth cookies from Capacitor Preferences and restore them to browser (mobile only)
 * Decodes URL-encoded cookie values before setting them to ensure proper decryption on the server
 */
export async function restoreAuthCookiesFromPreferences(): Promise<boolean> {
  if (!isMobileApp) return false;

  try {
    const { value } = await Preferences.get({ key: PREFERENCES_KEY });

    if (!value) {
      return false;
    }

    const data: StoredCookies = JSON.parse(value);

    // Restore each cookie using Capacitor Cookies API
    // Decode URL-encoded values to restore original encrypted data
    const cookiePromises = Object.entries(data.cookies).map(([key, value]) => {
      try {
        // Decode the URL-encoded cookie value
        const decodedValue = decodeURIComponent(value);

        return CapacitorCookies.setCookie({
          key,
          value: decodedValue,
          url: WEBSITE_ROOT,
        });
      } catch (error) {
        // Fallback: try setting the original value
        return CapacitorCookies.setCookie({
          key,
          value,
          url: WEBSITE_ROOT,
        });
      }
    });

    await Promise.all(cookiePromises);

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Clear auth cookies from both browser and Preferences (mobile only)
 */
export async function clearAuthCookies(): Promise<void> {
  if (!isMobileApp) return;
  // Clear from browser using Capacitor Cookies API
  const deletePromises = Object.values(AUTH_COOKIES_NAMES).map((name) => {
    const fullName = `${AUTH_COOKIES_PREFIX}.${name}`;
    return CapacitorCookies.deleteCookie({
      key: fullName,
    });
  });

  deletePromises.push(
    CapacitorCookies.deleteCookie({
      key: IS_LOGGED_IN_COOKIE_NAME,
    })
  );

  await Promise.all(deletePromises);

  // Clear from Preferences (mobile only)

  await Preferences.remove({ key: PREFERENCES_KEY });
}
