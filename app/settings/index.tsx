"use client";
import { useAuthStatus } from "@/components/providers/auth-status-provider";
import { Spinner } from "@/components/ui/button";
import { useUserSettings } from "@/hooks/trpc/use-user-settings";
import { UserSetting } from "@/types/core";
import { NotificationsControls } from "./notifications-controls";
import { SchoolPicker } from "./school-picker";
import { SwitchField } from "./switch-field";
import { SyncSettingsSwitch } from "./sync-settings-switch";
import { ThemePicker } from "./theme-picker";
import { UserSettingsWithDerivedFields } from "./types";
const fields: Array<
  { isAuthenticatedOnly?: boolean } & (
    | {
        custom: React.ComponentType<{ initialValue: any }>;
        key: keyof UserSettingsWithDerivedFields;
      }
    | { label: string; key: UserSetting }
  )
> = [
  { custom: SchoolPicker, key: "schoolId" },
  { custom: ThemePicker, key: "themeColor" },
  { custom: SyncSettingsSwitch, key: "isSynced", isAuthenticatedOnly: true },
  {
    label: "Show countdown timer on schedule",
    key: "shouldShowNextSubjectTimer",
    isAuthenticatedOnly: true,
  },
  {
    label: "Show percentage for assignment score",
    key: "shouldShowPercentages",
    isAuthenticatedOnly: true,
  },
  {
    label: "Highlight missing assignments",
    key: "shouldHighlightMissingAssignments",
    isAuthenticatedOnly: true,
  },
  {
    custom: NotificationsControls,
    key: "notificationsEnabled",
    isAuthenticatedOnly: true,
  },
];
export function SettingsContent() {
  const userSettings = useUserSettings(false);
  const { isLoggedIn } = useAuthStatus();
  if (!userSettings)
    return (
      <div className="flex w-full justify-center">
        <Spinner />
      </div>
    );
  return fields.map((field) => {
    if (field.isAuthenticatedOnly && !isLoggedIn) return null;
    const initialValue = userSettings[field.key];
    if ("custom" in field) {
      const Component = field.custom;
      return <Component key={field.key} initialValue={initialValue} />;
    } else {
      return (
        <SwitchField
          key={field.key}
          initialValue={initialValue as boolean | undefined}
          label={field.label}
          settingKey={field.key}
        />
      );
    }
  });
}
