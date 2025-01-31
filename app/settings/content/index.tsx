import { getUserSettings } from "@/lib/settings/queries";
import { UserSetting } from "@/types/core";
import { SchoolPicker } from "./school-picker";
import { SwitchField } from "./switch-field";
const fields: Array<
  ({ custom: React.FC<{ initialValue: any }> } | { label: string }) & {
    key: UserSetting;
  }
> = [
  { custom: SchoolPicker, key: "schoolId" },
  {
    label: "Show countdown timer on schedule",
    key: "shouldShowNextSubjectTimer",
  },
  {
    label: "Show percentage for assignment score",
    key: "shouldShowAssignmentScorePercentage",
  },
  {
    label: "Highlight missing assignments",
    key: "shouldHighlightMissingAssignments",
  },
];
export async function SettingsContent() {
  const userSettings = await getUserSettings();
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
