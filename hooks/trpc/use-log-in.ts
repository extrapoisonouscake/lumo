import { trpc } from "@/app/trpc";
import { isIOSWebView } from "@/constants/ui";
import { callNative } from "@/helpers/ios-bridge";
import { useMutation } from "@tanstack/react-query";

export function useLogIn() {
  const options = trpc.myed.auth.login.mutationOptions();
  return useMutation({
    ...options,
    onSuccess: (...args) => {
      options.onSuccess?.(...args);

      if (isIOSWebView) {
        callNative("saveAuthData");
      }
    },
  });
}
