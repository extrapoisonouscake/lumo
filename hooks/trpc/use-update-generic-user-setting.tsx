import { trpc } from "@/app/trpc";

import { UpdateUserSettingSchema } from "@/lib/trpc/routes/core/settings/public";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useUserSettings } from "./use-user-settings";

export function useUpdateGenericUserSetting() {
  const mutation = useMutation(
    trpc.core.settings.updateGenericUserSetting.mutationOptions()
  );
  const settings = useUserSettings(false);
  return {
    ...mutation,
    mutateAsync: async (
      input: Omit<UpdateUserSettingSchema, "shouldUpdateDB">
    ) => {
      if (!settings) {
        toast.error("Wait for settings to load...");
        return;
      }
      return mutation.mutateAsync({
        ...input,
        shouldUpdateDB: settings.isSynced,
      });
    },
  };
}
