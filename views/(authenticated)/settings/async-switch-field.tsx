"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { Spinner } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function AsyncSwitchField({
  label,
  description,
  initialValue,
  onChange,
  settingKey,
  checked: externalChecked,
  disabled,
}: {
  label: string;
  description?: string;
  onChange: (checked: boolean) => Promise<void>;
  checked?: boolean;
  initialValue?: boolean;
  settingKey: string;
  disabled?: boolean;
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
    try {
      await onChange(checked);
    } catch {
      setChecked(!checked);
      toast.error("An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-3 justify-between sm:justify-start items-center">
        <Label htmlFor={settingKey} className="cursor-pointer font-normal">
          {label}
        </Label>
        <div className="flex items-center gap-2 sm:flex-row-reverse">
          {isLoading && <Spinner className="text-brand size-4" />}
          <Switch
            checked={externalChecked ?? checked}
            onCheckedChange={onChangeHandler}
            id={settingKey}
            disabled={isLoading || disabled}
          />
        </div>
      </div>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
