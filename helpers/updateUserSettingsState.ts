import { queryClient, trpc } from "@/app/trpc";
import { UserSetting, UserSettings } from "@/types/core";
export function updateUserSettingState(
  key: UserSetting,
  value: UserSettings[typeof key]
) {
  const queryKey = trpc.user.getSettings.queryKey();
  const currentState = queryClient.getQueryData<UserSettings>(queryKey);
  if (!currentState) {
    return;
  }
  const newState = {
    ...currentState,
    [key]: value,
  };
  queryClient.setQueryData(queryKey, newState);
}
