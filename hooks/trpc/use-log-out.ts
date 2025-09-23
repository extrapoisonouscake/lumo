import { trpcClient } from "@/app/trpc";
import { isIOSWebView } from "@/constants/ui";
import { callNative } from "@/helpers/ios-bridge";
import { useMutation } from "@tanstack/react-query";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export function useLogOut(push: AppRouterInstance["push"]) {
  return useMutation({
    mutationFn: async () => {
      const promises = [];
      promises.push(trpcClient.myed.auth.logOut.mutate());
      if (isIOSWebView) {
        promises.push(callNative("logoutWipe"));
      }
      await Promise.all(promises);
    },
    onSuccess: () => {
      push("/login");
    },
  });
}
