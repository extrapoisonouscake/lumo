"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { updateUserSettingViaServerAction } from "@/lib/settings/mutations";
import { UserSetting } from "@/types/core";
import { useState } from "react";
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
  const onChangeHandler = async (checked: boolean) => {
    setChecked(checked);
    try {
      await updateUserSettingViaServerAction({
        key: settingKey,
        value: checked,
      });
    } catch {
      setChecked(!checked);
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
