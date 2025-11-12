import { saveClientResponseToCache } from "@/helpers/cache";
import { trpc } from "@/views/trpc";

import { updateUserSettingState } from "@/helpers/updateUserSettingsState";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getCacheKey } from "../use-cached-query";

export function useUpdateGenericUserSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn:
      trpc.core.settings.updateGenericUserSetting.mutationOptions().mutationFn,
    onMutate: async (variables) => {
      updateUserSettingState(variables.key, variables.value);
      const queryKey = trpc.core.settings.getSettings.queryKey();
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({
        queryKey,
      });

      // Snapshot the previous value
      const previousSettings = queryClient.getQueryData(queryKey);
      if (previousSettings) {
        const newSettings = {
          ...previousSettings,
          [variables.key]: variables.value,
        };
        saveClientResponseToCache(getCacheKey(queryKey), newSettings);
        // Optimistically update the cache
        queryClient.setQueryData(queryKey, newSettings);
      }
      // Return context with previous data for potential rollback
      return { previousSettings };
    },
    onError: (_error, _variables, context) => {
      // Revert to previous value on error
      if (context?.previousSettings) {
        queryClient.setQueryData(
          trpc.core.settings.getSettings.queryKey(),
          context.previousSettings
        );
      }
    },
  });
}
