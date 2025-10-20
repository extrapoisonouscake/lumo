import { USER_SETTINGS_DEFAULT_VALUES } from "@/constants/core";
import { isMobileApp } from "@/constants/ui";
import { storage } from "@/helpers/cache";
import { clearAuthCookies } from "@/helpers/capacitor-cookie-persistence";
import { setThemeColorCSSVariable } from "@/helpers/theme";
import { trpc } from "@/views/trpc";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";

export function useLogOut(navigate: ReturnType<typeof useNavigate>) {
  return useMutation({
    ...trpc.myed.auth.logOut.mutationOptions(),

    onSuccess: async () => {
      storage.clear();

      navigate("/login");
      setThemeColorCSSVariable(USER_SETTINGS_DEFAULT_VALUES.themeColor);
      // Clear cookies from Preferences on mobile
      if (isMobileApp) {
        await clearAuthCookies();
      }
    },
  });
}
