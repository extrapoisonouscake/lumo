"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { updateUserSettingState } from "@/helpers/updateUserSettingsState";

import { Spinner } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { UserSettingsWithDerivedFields } from "./types";

export function AsyncSwitchField({
  label,
  description,
  initialValue,
  settingKey,
  onChange,
}: {
  label: string;
  description?: string;
  onChange: (checked: boolean) => Promise<void>;
  initialValue?: boolean;
  settingKey: keyof UserSettingsWithDerivedFields;
}) {
  const [checked, setChecked] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    if (initialValue !== checked) {
      setChecked(initialValue);
    }
  }, [initialValue]);
  const onChangeHandler = async (checked: boolean) => {
    setIsLoading(true);
    setChecked(checked);
    updateUserSettingState(settingKey, checked);
    try {
      await onChange(checked);
    } catch {
      setChecked(!checked);
      updateUserSettingState(settingKey, !checked);
      toast.error("An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-3 justify-between md:justify-start items-center">
        <Label htmlFor={settingKey} className="cursor-pointer font-normal">
          {label}
        </Label>
        <div className="flex items-center gap-2 md:flex-row-reverse">
          {isLoading && <Spinner className="text-brand size-4" />}
          <Switch
            checked={checked}
            onCheckedChange={onChangeHandler}
            id={settingKey}
            disabled={isLoading}
          />
        </div>
      </div>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
