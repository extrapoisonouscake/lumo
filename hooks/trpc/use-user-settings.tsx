import { USER_SETTINGS_DEFAULT_VALUES } from "@/constants/core";
import { RouterOutput } from "@/lib/trpc/types";
import { trpc } from "@/views/trpc";
import { useCachedQuery } from "../use-cached-query";

export function useUserSettings() {
  const query = useCachedQuery(trpc.core.settings.getSettings.queryOptions());

  return (
    query.data ??
    (USER_SETTINGS_DEFAULT_VALUES as RouterOutput["core"]["settings"]["getSettings"])
  );
}
