import { trpc } from "@/app/trpc";
import { useMutation } from "@tanstack/react-query";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export function useLogOut(
  push: AppRouterInstance["push"],
  refreshAuthStatus: () => void
) {
  const options = trpc.myed.auth.logOut.mutationOptions();
  return useMutation({
    ...options,
    onSuccess: (...args) => {
      options.onSuccess?.(...args);
      refreshAuthStatus();
      push("/login");
    },
  });
}
