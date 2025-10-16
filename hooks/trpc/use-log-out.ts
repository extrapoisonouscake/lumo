import { USER_SETTINGS_DEFAULT_VALUES } from "@/constants/core";
import { isIOSApp } from "@/constants/ui";
import { storage } from "@/helpers/cache";
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
    onSuccess: () => {
      storage.clear();
      navigate("/login");
      setThemeColorCSSVariable(USER_SETTINGS_DEFAULT_VALUES.themeColor);
    },
  });
}
