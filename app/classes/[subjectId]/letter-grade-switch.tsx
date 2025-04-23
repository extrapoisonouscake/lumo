import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { updateUserSettingState } from "@/helpers/updateUserSettingsState";
import { useUpdateUserSetting } from "@/hooks/trpc/use-update-user-setting";

import LetterA from "@/public/icons/letter-a.svg";
import { Percent } from "lucide-react";

function StyledToggleGroupItem({
  ...props
}: React.ComponentProps<typeof ToggleGroupItem>) {
  return (
    <ToggleGroupItem
      size="sm"
      className="bg-transparent hover:bg-transparent data-[state=on]:bg-background"
      {...props}
    />
  );
}
export function LetterGradeSwitch({
  value,
  onValueChange,
}: {
  value: boolean;
  onValueChange?: (value: boolean) => void;
}) {
  const updateUserSettingMutation = useUpdateUserSetting();
  async function handleValueChange(value: string) {
    const newIsLetterGradeToggled = value === "on";
    onValueChange?.(newIsLetterGradeToggled);
    updateUserSettingState("shouldShowLetterGrade", newIsLetterGradeToggled);
    await updateUserSettingMutation.mutateAsync({
      key: "shouldShowLetterGrade",
      value: newIsLetterGradeToggled,
    });
  }
  return (
    <ToggleGroup
      type="single"
      className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1 gap-0"
      value={value ? "on" : "off"}
      onValueChange={handleValueChange}
    >
      <StyledToggleGroupItem value="off" aria-label="Toggle off">
        <Percent />
      </StyledToggleGroupItem>
      <StyledToggleGroupItem value="on" aria-label="Toggle on">
        <LetterA />
      </StyledToggleGroupItem>
    </ToggleGroup>
  );
}
