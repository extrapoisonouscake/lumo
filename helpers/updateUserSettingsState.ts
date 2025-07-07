import { UserSettingsWithDerivedFields } from "@/app/(authenticated)/settings/types";
import { queryClient, trpc } from "@/app/trpc";
import set from "lodash/set";
export function updateUserSettingState(key: string, value: any) {
  const queryKey = trpc.core.settings.getSettings.queryKey();
  const currentState =
    queryClient.getQueryData<UserSettingsWithDerivedFields>(queryKey);
  if (!currentState) {
    return;
  }
  const newState = {
    ...currentState,
  };
  set(newState, key, value);
  queryClient.setQueryData(queryKey, newState);
}
