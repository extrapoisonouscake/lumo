import { trpc } from "@/app/trpc";

import { useMutation } from "@tanstack/react-query";

export function useUpdateGenericUserSetting() {
  return useMutation(
    trpc.core.settings.updateGenericUserSetting.mutationOptions()
  );
}
