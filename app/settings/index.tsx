"use client";
import { Spinner } from "@/components/ui/button";
import { useUserSettings } from "@/hooks/trpc/use-user-settings";
import { UserSetting } from "@/types/core";
import { SchoolPicker } from "./school-picker";
import { SwitchField } from "./switch-field";
import { SyncSettingsSwitch } from "./sync-settings-switch";
import { ThemePicker } from "./theme-picker";
import { UserSettingsWithDerivedFields } from "./types";
const fields: Array<
  | {
      custom: React.FC<{ initialValue: any }>;
      key: keyof UserSettingsWithDerivedFields;
    }
  | { label: string; key: UserSetting }
> = [
  { custom: SchoolPicker, key: "schoolId" },
  { custom: ThemePicker, key: "themeColor" },
  { custom: SyncSettingsSwitch, key: "isSynced" },
  {
    label: "Show countdown timer on schedule",
    key: "shouldShowNextSubjectTimer",
  },
  {
    label: "Show percentage for assignment score",
    key: "shouldShowPercentages",
  },
  {
    label: "Highlight missing assignments",
    key: "shouldHighlightMissingAssignments",
  },
];
export function SettingsContent() {
  const userSettings = useUserSettings(false);
  if (!userSettings)
    return (
      <div className="flex w-full justify-center">
        <Spinner />
      </div>
    );
  return fields.map((field) => {
    const initialValue = userSettings[field.key];
    if ("custom" in field) {
      const Component = field.custom;
      return <Component initialValue={initialValue} />;
    } else {
      return (
        <SwitchField
          initialValue={initialValue as boolean | undefined}
          label={field.label}
          settingKey={field.key}
        />
      );
    }
  });
}
