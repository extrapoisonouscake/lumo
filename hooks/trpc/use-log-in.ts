import { isIOSApp } from "@/constants/ui";
import { trpc } from "@/views/trpc";
import { useMutation } from "@tanstack/react-query";
import { SavePassword } from "capacitor-ios-autofill-save-password";

export function useLogIn() {
  const options = trpc.myed.auth.login.mutationOptions();
  return useMutation({
    ...options,
    onSuccess: async (data, variables, ...args) => {
      options.onSuccess?.(data, variables, ...args);

      if (isIOSApp) {
        SavePassword.promptDialog({
          username: variables.username,
          password: variables.password,
        });

        // callNative("saveAuthData");
      }
    },
  });
}
