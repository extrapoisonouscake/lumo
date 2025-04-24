import { trpc } from "@/app/trpc";
import { UpdateUserSettingSchema } from "@/lib/trpc/routes/user/public";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useUserSettings } from "./use-user-settings";

export function useUpdateUserSetting() {
  const mutation = useMutation(trpc.user.updateUserSetting.mutationOptions());
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
