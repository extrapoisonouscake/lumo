import { UserSettingsWithDerivedFields } from "@/app/(authenticated)/settings/types";
import { trpc } from "@/app/trpc";
import {
  USER_SETTINGS_COOKIE_PREFIX,
  USER_SETTINGS_DEFAULT_VALUES,
} from "@/constants/core";
import { getCachedClientResponse } from "@/helpers/get-cached-client-response";
import { useQuery } from "@tanstack/react-query";

export function useUserSettings() {
  const query = useQuery(trpc.core.settings.getSettings.queryOptions());
  return (
    query.data ??
    getCachedClientResponse<UserSettingsWithDerivedFields>(
      USER_SETTINGS_COOKIE_PREFIX,
      USER_SETTINGS_DEFAULT_VALUES
    )
  );
}
