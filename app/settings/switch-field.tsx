"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { updateUserSettingState } from "@/helpers/updateUserSettingsState";
import { useUpdateGenericUserSetting } from "@/hooks/trpc/use-update-generic-user-setting";

import { UserSetting } from "@/types/core";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function SwitchField({
  label,
  settingKey,
  initialValue,
}: {
  label: string;
  initialValue?: boolean;
  settingKey: UserSetting;
}) {
  const [checked, setChecked] = useState(initialValue);
  useEffect(() => {
    if (initialValue !== checked) {
      setChecked(initialValue);
    }
  }, [initialValue]);
  const updateUserSettingMutation = useUpdateGenericUserSetting();
  const onChangeHandler = async (checked: boolean) => {
    setChecked(checked);
    updateUserSettingState(settingKey, checked);
    try {
      await updateUserSettingMutation.mutateAsync({
        key: settingKey,
        value: checked,
      });
    } catch {
      setChecked(!checked);
      updateUserSettingState(settingKey, !checked);
      toast.error("An error occurred.");
    }
  };
  return (
    <div className="flex gap-3 justify-between md:justify-start items-center">
      <Label htmlFor={settingKey} className="cursor-pointer font-normal">
        {label}
      </Label>
      <Switch
        checked={checked}
        onCheckedChange={onChangeHandler}
        id={settingKey}
      />
    </div>
  );
}
