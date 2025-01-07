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
  { label: "Show Timer on Schedule", key: "shouldShowNextSubjectTimer" },
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
