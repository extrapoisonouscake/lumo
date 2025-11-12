import { USER_SETTINGS_DEFAULT_VALUES } from "@/constants/core";
import { RouterOutput } from "@/lib/trpc/types";
import { trpc } from "@/views/trpc";
import { useMemo } from "react";
import { useCachedQuery } from "../use-cached-query";
type Result = RouterOutput["core"]["settings"]["getSettings"];
export function useUserSettings(useDefaultValues?: true | undefined): Result;
export function useUserSettings(useDefaultValues: false): Result | undefined;
export function useUserSettings(
  useDefaultValues: boolean = true
): Result | undefined {
  const query = useCachedQuery(trpc.core.settings.getSettings.queryOptions());

  return useMemo(() => {
    if (query.data) return query.data;
    if (useDefaultValues) {
      return USER_SETTINGS_DEFAULT_VALUES as Result;
    }
    return undefined;
  }, [query.data, useDefaultValues]);
}
