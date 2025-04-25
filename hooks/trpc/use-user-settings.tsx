import { trpc } from "@/app/trpc";
import { USER_SETTINGS_DEFAULT_VALUES } from "@/constants/core";
import { RouterOutput } from "@/lib/trpc/types";
import { useQuery } from "@tanstack/react-query";
export function useUserSettings(
  shouldReturnDefaultValues: false
): RouterOutput["core"]["settings"]["getSettings"] | undefined;
export function useUserSettings(
  shouldReturnDefaultValues?: true
): typeof USER_SETTINGS_DEFAULT_VALUES;
export function useUserSettings(shouldReturnDefaultValues = true) {
  const query = useQuery(trpc.core.settings.getSettings.queryOptions());
  return shouldReturnDefaultValues
    ? query.data || USER_SETTINGS_DEFAULT_VALUES
    : query.data;
}
