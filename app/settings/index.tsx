"use client";
import { useAuthStatus } from "@/components/providers/auth-status-provider";
import { Button, Spinner } from "@/components/ui/button";
import { useLogOut } from "@/hooks/trpc/use-log-out";
import { useUserSettings } from "@/hooks/trpc/use-user-settings";
import { useIsMobile } from "@/hooks/use-mobile";
import { UserSetting } from "@/types/core";
import { LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";
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
  return (
    <div className="flex flex-col gap-4">
      {fields.map((field) => {
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
      })}
      <LogOutButton />
    </div>
  );
}
function LogOutButton() {
  const router = useRouter();
  const { refreshAuthStatus } = useAuthStatus();
  const logOutMutation = useLogOut(router.push, refreshAuthStatus);
  const isMobile = useIsMobile();
  if (!isMobile) return null;
  return (
    <Button
      disabled={logOutMutation.isPending}
      variant="outline"
      onClick={() => logOutMutation.mutateAsync()}
      leftIcon={<LogOutIcon />}
      shouldShowChildrenOnLoading
    >
      Log out
    </Button>
  );
}
