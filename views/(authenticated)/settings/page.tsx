"use client";
import { PageHeading } from "@/components/layout/page-heading";
import { TitleManager } from "@/components/misc/title-manager";
import { Spinner } from "@/components/ui/button";
import { useUserSettings } from "@/hooks/trpc/use-user-settings";
import { UserSetting } from "@/types/core";
import { LogOutButton } from "./log-out-button";
import { NotificationsControls } from "./notifications-controls";
import { SchoolPicker } from "./school-picker";
import { SwitchField } from "./switch-field";
import { ThemePicker } from "./theme-picker";
import { UserSettingsWithDerivedFields } from "./types";
const fields: Array<
  | {
      custom: React.ComponentType<{ initialValue: any }>;
      key: keyof UserSettingsWithDerivedFields;
    }
  | { label: string; key: UserSetting }
> = [
  { custom: SchoolPicker, key: "schoolId" },
  { custom: ThemePicker, key: "themeColor" },
  {
    label: "Show countdown timer on the schedule page",
    key: "shouldShowNextSubjectTimer",
  },
  {
    label: "Show percentage for assignment scores",
    key: "shouldShowPercentages",
  },
  {
    label: "Highlight missing assignments",
    key: "shouldHighlightMissingAssignments",
  },
  {
    label: "Highlight averages with colour",
    key: "shouldHighlightAveragesWithColour",
  },
  {
    custom: NotificationsControls,
    key: "notificationsEnabled",
  },
];
export default function SettingsPage() {
  const userSettings = useUserSettings();

  return (
    <>
      <TitleManager>Settings</TitleManager>
      <PageHeading />

      <div className="flex flex-col gap-4 settings-page">
        {userSettings ? (
          fields.map((field) => {
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
          })
        ) : (
          <div className="flex w-full justify-center">
            <Spinner className="text-muted-foreground" />
          </div>
        )}
        <LogOutButton />
      </div>
    </>
  );
}
