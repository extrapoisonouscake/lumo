"use client";

import { Spinner } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { setUserSetting } from "@/lib/settings/mutations";
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
  const [isLoading, setIsLoading] = useState(false);
  const [checked, setChecked] = useState(initialValue);
  const onChangeHandler = async (checked: boolean) => {
    setChecked(checked);
    setIsLoading(true);
    try {
      await setUserSetting({ key: settingKey, value: checked });
    } catch {
      setChecked(!checked);
      toast.error("An error occurred.");
    }
    setIsLoading(false);
  };
  return (
    <div className="flex gap-3 justify-between lg:justify-start items-center">
      <Label
        htmlFor={settingKey}
        aria-disabled={isLoading}
        className="cursor-pointer font-normal"
      >
        {label}
        {isLoading && <Spinner className="inline ml-1.5 align-middle size-4" />}
      </Label>
      <Switch
        disabled={isLoading}
        checked={checked}
        onCheckedChange={onChangeHandler}
        id={settingKey}
      />
    </div>
  );
}
