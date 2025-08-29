import { UserSettingsWithDerivedFields } from "@/app/(authenticated)/settings/types";
import { trpc } from "@/app/trpc";
import {
  USER_SETTINGS_COOKIE_PREFIX,
  USER_SETTINGS_DEFAULT_VALUES,
} from "@/constants/core";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";

export function useUserSettings() {
  const query = useQuery(trpc.core.settings.getSettings.queryOptions());
  return query.data ?? getCachedUserSettings();
}
function getCachedUserSettings() {
  const cookies = Cookies.get();

  const settings = {
    ...USER_SETTINGS_DEFAULT_VALUES,
    ...JSON.parse(cookies[USER_SETTINGS_COOKIE_PREFIX] ?? "{}"),
  } as UserSettingsWithDerivedFields;
  return settings as UserSettingsWithDerivedFields;
}
