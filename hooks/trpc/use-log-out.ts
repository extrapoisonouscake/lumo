import { isIOSWebView } from "@/constants/ui";
import { callNative } from "@/helpers/ios-bridge";
import { trpcClient } from "@/views/trpc";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";

export function useLogOut(navigate: ReturnType<typeof useNavigate>) {
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
      navigate("/login");
    },
  });
}
