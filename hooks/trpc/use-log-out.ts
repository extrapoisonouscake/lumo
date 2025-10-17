import { USER_SETTINGS_DEFAULT_VALUES } from "@/constants/core";
import { isIOSApp, isMobileApp } from "@/constants/ui";
import { storage } from "@/helpers/cache";
import { clearAuthCookies } from "@/helpers/capacitor-cookie-persistence";
import { setThemeColorCSSVariable } from "@/helpers/prepare-theme-color";
import { trpcClient } from "@/views/trpc";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";

export function useLogOut(navigate: ReturnType<typeof useNavigate>) {
  return useMutation({
    mutationFn: async () => {
      const promises = [];
      promises.push(trpcClient.myed.auth.logOut.mutate());
      if (isIOSApp) {
        // promises.push(callNative("logoutWipe"));
      }
      await Promise.all(promises);
    },
    onSuccess: async () => {
      storage.clear();

      // Clear cookies from Preferences on mobile
      if (isMobileApp) {
        await clearAuthCookies();
      }

      navigate("/login");
      setThemeColorCSSVariable(USER_SETTINGS_DEFAULT_VALUES.themeColor);
    },
  });
}
