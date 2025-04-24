import { trpc } from "@/app/trpc";
import { useMutation } from "@tanstack/react-query";
import { AsyncSwitchField } from "./async-switch-field";

export function SyncSettingsSwitch({
  initialValue,
}: {
  initialValue: boolean;
}) {
  const optInMutation = useMutation(
    trpc.user.switchSettingsSync.mutationOptions()
  );
  return (
    <AsyncSwitchField
      label="Sync settings"
      settingKey="isSynced"
      onChange={async () => {
        await optInMutation.mutateAsync();
      }}
      description="When enabled, your student number is securely stored on our servers."
      initialValue={initialValue}
    />
  );
}
