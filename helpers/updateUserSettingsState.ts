import { UserSettingsWithDerivedFields } from "@/app/settings/types";
import { queryClient, trpc } from "@/app/trpc";
export function updateUserSettingState(
  key: keyof UserSettingsWithDerivedFields,
  value: UserSettingsWithDerivedFields[typeof key]
) {
  const queryKey = trpc.user.getSettings.queryKey();
  const currentState =
    queryClient.getQueryData<UserSettingsWithDerivedFields>(queryKey);
  if (!currentState) {
    return;
  }
  const newState = {
    ...currentState,
    [key]: value,
  };
  queryClient.setQueryData(queryKey, newState);
}
