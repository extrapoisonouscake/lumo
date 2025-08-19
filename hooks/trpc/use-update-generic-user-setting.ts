import { trpc } from "@/app/trpc";

import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateGenericUserSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn:
      trpc.core.settings.updateGenericUserSetting.mutationOptions().mutationFn,
    onMutate: async (variables) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({
        queryKey: trpc.core.settings.getSettings.queryKey(),
      });

      // Snapshot the previous value
      const previousSettings = queryClient.getQueryData(
        trpc.core.settings.getSettings.queryKey()
      );

      // Optimistically update the cache
      queryClient.setQueryData(
        trpc.core.settings.getSettings.queryKey(),
        (old) => {
          return {
            ...old!,
            [variables.key]: variables.value,
          };
        }
      );

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
